import csv
import io
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, require_roles
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.academic import Assessment
from app.models.prediction import PredictionRecord
from app.schemas.assessment import AssessmentCreate, AssessmentResponse, BatchUploadResult
from app.services.ml_engine import ml_engine
from app.services.xai_explainer import compute_xai_and_recommendations

router = APIRouter()


@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_in: AssessmentCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY])),
    db: Session = Depends(get_db)
) -> Any:
    """Create a single academic assessment record for a student."""
    student = db.query(Student).filter(Student.id == assessment_in.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{assessment_in.student_id}' does not exist."
        )

    assessment = Assessment(
        student_id=assessment_in.student_id,
        semester=assessment_in.semester,
        attendance_percentage=assessment_in.attendance_percentage,
        internal_test_marks=assessment_in.internal_test_marks,
        assignment_score=assessment_in.assignment_score,
        quiz_score=assessment_in.quiz_score,
        prev_semester_gpa=assessment_in.prev_semester_gpa
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Automatically trigger inference for this student
    run_background_inference(student, assessment, db)

    return assessment


@router.get("/student/{student_id}", response_model=List[AssessmentResponse])
def get_student_assessments(
    student_id: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT])),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve all assessment records for a specific student."""
    assessments = db.query(Assessment).filter(
        Assessment.student_id == student_id
    ).order_by(desc(Assessment.semester), desc(Assessment.created_at)).all()
    return assessments


@router.post("/batch-csv", response_model=BatchUploadResult)
async def batch_upload_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY])),
    db: Session = Depends(get_db)
) -> Any:
    """
    Parse uploaded CSV of class scores, validate data with Pydantic schemas,
    and bulk-insert students and assessments with automated inference.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid CSV file."
        )

    content = await file.read()
    try:
        decoded = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        decoded = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(decoded))
    if not reader.fieldnames:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty or missing headers."
        )

    # Normalize column names
    field_map = {}
    for col in reader.fieldnames:
        cleaned = col.strip().lower().replace(" ", "_")
        field_map[col] = cleaned

    total_rows = 0
    successful_records = 0
    failed_records = 0
    errors: List[str] = []
    new_students_count = 0
    new_assessments_count = 0

    students_to_evaluate = []

    for row_idx, raw_row in enumerate(reader, start=2):  # line 2 is first data row
        total_rows += 1
        normalized_row = {field_map[k]: (v.strip() if v else "") for k, v in raw_row.items() if k in field_map}

        # Flexible alias matching
        roll_number = normalized_row.get("roll_number") or normalized_row.get("roll_no") or normalized_row.get("student_id")
        student_name = normalized_row.get("student_name") or normalized_row.get("name") or f"Student {roll_number}"
        department = normalized_row.get("department") or normalized_row.get("branch") or "Computer Science and Engineering"
        semester_val = normalized_row.get("semester") or normalized_row.get("current_semester") or "5"

        att_val = normalized_row.get("attendance_percentage") or normalized_row.get("attendance")
        internal_val = normalized_row.get("internal_test_marks") or normalized_row.get("internals") or normalized_row.get("internal_marks")
        asg_val = normalized_row.get("assignment_score") or normalized_row.get("assignment") or normalized_row.get("assignments")
        quiz_val = normalized_row.get("quiz_score") or normalized_row.get("quiz") or normalized_row.get("quizzes")
        gpa_val = normalized_row.get("prev_semester_gpa") or normalized_row.get("prev_gpa") or normalized_row.get("gpa")

        if not roll_number:
            failed_records += 1
            errors.append(f"Row {row_idx}: Missing 'roll_number'")
            continue

        try:
            semester = int(float(semester_val))
            attendance = float(att_val)
            internals = float(internal_val)
            assignment = float(asg_val)
            quiz = float(quiz_val)
            prev_gpa = float(gpa_val)

            # Bounds validation
            if not (0.0 <= attendance <= 100.0):
                raise ValueError("Attendance must be between 0 and 100")
            if not (0.0 <= internals <= 100.0):
                raise ValueError("Internal test marks must be between 0 and 100")
            if not (0.0 <= assignment <= 100.0):
                raise ValueError("Assignment score must be between 0 and 100")
            if not (0.0 <= quiz <= 100.0):
                raise ValueError("Quiz score must be between 0 and 100")
            if not (0.0 <= prev_gpa <= 10.0):
                raise ValueError("Previous GPA must be between 0.0 and 10.0")

        except (ValueError, TypeError) as e:
            failed_records += 1
            errors.append(f"Row {row_idx} (Roll: {roll_number}): Invalid values - {str(e)}")
            continue

        # Look up or create student
        roll_clean = roll_number.strip().upper()
        student = db.query(Student).filter(Student.roll_number == roll_clean).first()
        if not student:
            student = Student(
                roll_number=roll_clean,
                name=student_name.strip(),
                department=department.strip(),
                current_semester=semester
            )
            db.add(student)
            db.flush()
            new_students_count += 1
        else:
            student.current_semester = semester
            if student_name and student.name != student_name:
                student.name = student_name.strip()

        # Add assessment record
        assessment = Assessment(
            student_id=student.id,
            semester=semester,
            attendance_percentage=attendance,
            internal_test_marks=internals,
            assignment_score=assignment,
            quiz_score=quiz,
            prev_semester_gpa=prev_gpa
        )
        db.add(assessment)
        db.flush()
        new_assessments_count += 1
        successful_records += 1

        students_to_evaluate.append((student, assessment))

    # Commit all database inserts
    db.commit()

    # Automatically compute ML inference and XAI for uploaded records
    for student, assessment in students_to_evaluate:
        run_background_inference(student, assessment, db)
    db.commit()

    return BatchUploadResult(
        total_processed=total_rows,
        successful_records=successful_records,
        failed_records=failed_records,
        errors=errors[:15],  # return first 15 errors to keep payload concise
        inserted_students_count=new_students_count,
        inserted_assessments_count=new_assessments_count
    )


def run_background_inference(student: Student, assessment: Assessment, db: Session):
    """Helper to evaluate student using the ML model and store prediction record."""
    features = {
        "attendance_percentage": assessment.attendance_percentage,
        "internal_test_marks": assessment.internal_test_marks,
        "assignment_score": assessment.assignment_score,
        "quiz_score": assessment.quiz_score,
        "prev_semester_gpa": assessment.prev_semester_gpa
    }
    pred_res = ml_engine.predict(features)
    xai_res = compute_xai_and_recommendations(
        features=features,
        risk_tier=pred_res["risk_tier"],
        feature_importances=pred_res["feature_importances"]
    )

    record = PredictionRecord(
        student_id=student.id,
        risk_tier=pred_res["risk_tier"],
        confidence_score=pred_res["confidence_score"],
        top_negative_factors=xai_res["top_negative_factors"],
        actionable_recommendations=xai_res["actionable_recommendations"],
        model_version=pred_res["model_version"]
    )
    db.add(record)

