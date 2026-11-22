from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.api.deps import get_db, get_current_user, require_roles
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.academic import Assessment
from app.models.prediction import PredictionRecord
from app.schemas.student import (
    StudentCreate,
    StudentResponse,
    StudentUpdate,
    StudentProfileInfo,
    StudentSelfProfileResponse,
    StudentDetailResponse,
)
from app.services.ml_engine import ml_engine
from app.services.xai_explainer import compute_xai_and_recommendations

router = APIRouter()


@router.get("", response_model=List[StudentResponse])
def get_students(
    search: Optional[str] = Query(None, description="Search by roll number or name"),
    risk_filter: Optional[str] = Query(None, description="Filter by risk tier (High Risk, Moderate Risk, Low Risk, Unpredicted)"),
    department: Optional[str] = Query(None, description="Filter by department"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY])),
    db: Session = Depends(get_db)
) -> Any:
    """List students with live risk tier, latest attendance, and test marks."""
    query = db.query(Student)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.roll_number.ilike(search_pattern),
                Student.name.ilike(search_pattern)
            )
        )

    if department:
        query = query.filter(Student.department == department)

    students = query.order_by(Student.roll_number.asc()).all()

    # Enrich with latest prediction and assessment metrics
    results = []
    for s in students:
        latest_pred = db.query(PredictionRecord).filter(
            PredictionRecord.student_id == s.id
        ).order_by(desc(PredictionRecord.created_at)).first()

        latest_assess = db.query(Assessment).filter(
            Assessment.student_id == s.id
        ).order_by(desc(Assessment.semester), desc(Assessment.created_at)).first()

        risk_tier = latest_pred.risk_tier if latest_pred else "Unpredicted"
        confidence = latest_pred.confidence_score if latest_pred else None

        if risk_filter:
            if risk_filter.lower() == "unpredicted" and latest_pred is not None:
                continue
            elif risk_filter.lower() != "unpredicted" and (latest_pred is None or latest_pred.risk_tier.lower() != risk_filter.lower()):
                continue

        results.append(StudentResponse(
            id=s.id,
            user_id=s.user_id,
            roll_number=s.roll_number,
            name=s.name,
            department=s.department,
            current_semester=s.current_semester,
            latest_risk_tier=risk_tier,
            latest_confidence=confidence,
            latest_attendance=latest_assess.attendance_percentage if latest_assess else None,
            latest_internals=latest_assess.internal_test_marks if latest_assess else None
        ))

    # Apply pagination on filtered results
    return results[skip:skip + limit]


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY])),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new student entry, optionally linking to a login account."""
    existing_student = db.query(Student).filter(Student.roll_number == student_in.roll_number).first()
    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student with roll number '{student_in.roll_number}' already exists."
        )

    user_id = None
    if student_in.email:
        existing_user = db.query(User).filter(User.email == student_in.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email '{student_in.email}' already exists."
            )
        password = student_in.password or "Student@123"
        new_user = User(
            email=student_in.email.lower(),
            hashed_password=get_password_hash(password),
            role=UserRole.STUDENT
        )
        db.add(new_user)
        db.flush()
        user_id = new_user.id

    student = Student(
        roll_number=student_in.roll_number.strip().upper(),
        name=student_in.name.strip(),
        department=student_in.department.strip(),
        current_semester=student_in.current_semester,
        user_id=user_id
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    return StudentResponse(
        id=student.id,
        user_id=student.user_id,
        roll_number=student.roll_number,
        name=student.name,
        department=student.department,
        current_semester=student.current_semester,
        latest_risk_tier="Unpredicted",
        latest_confidence=None,
        latest_attendance=None,
        latest_internals=None
    )


@router.get("/me/profile", response_model=StudentSelfProfileResponse)
def get_student_self_profile(
    current_user: User = Depends(require_roles([UserRole.STUDENT])),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve personal academic dashboard data for the authenticated student."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found for this account."
        )

    assessments = db.query(Assessment).filter(
        Assessment.student_id == student.id
    ).order_by(desc(Assessment.semester), desc(Assessment.created_at)).all()

    latest_prediction = db.query(PredictionRecord).filter(
        PredictionRecord.student_id == student.id
    ).order_by(desc(PredictionRecord.created_at)).first()

    # If student has assessment records but no prediction yet, run auto-inference
    if not latest_prediction and assessments:
        latest_assess = assessments[0]
        feats = {
            "attendance_percentage": float(latest_assess.attendance_percentage),
            "internal_test_marks": float(latest_assess.internal_test_marks),
            "assignment_score": float(latest_assess.assignment_score),
            "quiz_score": float(latest_assess.quiz_score),
            "prev_semester_gpa": float(latest_assess.prev_semester_gpa)
        }
        pred_res = ml_engine.predict(feats)
        xai_res = compute_xai_and_recommendations(
            features=feats,
            risk_tier=pred_res["risk_tier"],
            feature_importances=pred_res["feature_importances"]
        )
        latest_prediction = PredictionRecord(
            student_id=student.id,
            risk_tier=pred_res["risk_tier"],
            confidence_score=pred_res["confidence_score"],
            top_negative_factors=xai_res["top_negative_factors"],
            actionable_recommendations=xai_res["actionable_recommendations"],
            model_version=pred_res["model_version"]
        )
        db.add(latest_prediction)
        db.commit()
        db.refresh(latest_prediction)

    return {
        "student": {
            "id": student.id,
            "roll_number": student.roll_number,
            "name": student.name,
            "department": student.department,
            "current_semester": student.current_semester,
            "email": current_user.email,
            "user_id": student.user_id
        },
        "latest_prediction": latest_prediction,
        "assessments": assessments
    }


@router.get("/{student_id}", response_model=StudentDetailResponse)
def get_student_by_id(
    student_id: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT])),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve full details, assessments, and prediction records for a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )

    # If student role, ensure they are accessing only their own profile
    if current_user.role == UserRole.STUDENT and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view other students' records."
        )

    assessments = db.query(Assessment).filter(
        Assessment.student_id == student.id
    ).order_by(desc(Assessment.semester), desc(Assessment.created_at)).all()

    predictions = db.query(PredictionRecord).filter(
        PredictionRecord.student_id == student.id
    ).order_by(desc(PredictionRecord.created_at)).all()

    return {
        "student": {
            "id": student.id,
            "roll_number": student.roll_number,
            "name": student.name,
            "department": student.department,
            "current_semester": student.current_semester,
            "user_id": student.user_id
        },
        "assessments": assessments,
        "predictions": predictions
    }

