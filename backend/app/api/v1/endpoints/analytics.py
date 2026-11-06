from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.api.deps import get_db, require_roles
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.academic import Assessment
from app.models.prediction import PredictionRecord
from app.schemas.prediction import DashboardSummaryResponse

router = APIRouter()


@router.get("/dashboard-summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY])),
    db: Session = Depends(get_db)
) -> Any:
    """Computes comprehensive institutional and class-level academic analytics."""
    students = db.query(Student).all()
    total_students = len(students)
    total_assessments = db.query(Assessment).count()

    high_risk_count = 0
    moderate_risk_count = 0
    low_risk_count = 0
    unpredicted_count = 0

    attendance_list = []
    internals_list = []
    gpa_list = []

    scatter_data: List[Dict[str, Any]] = []

    # Map each student to their latest assessment and prediction
    for student in students:
        latest_pred = db.query(PredictionRecord).filter(
            PredictionRecord.student_id == student.id
        ).order_by(desc(PredictionRecord.created_at)).first()

        latest_assess = db.query(Assessment).filter(
            Assessment.student_id == student.id
        ).order_by(desc(Assessment.semester), desc(Assessment.created_at)).first()

        tier = latest_pred.risk_tier if latest_pred else "Unpredicted"

        if tier == "High Risk":
            high_risk_count += 1
        elif tier == "Moderate Risk":
            moderate_risk_count += 1
        elif tier == "Low Risk":
            low_risk_count += 1
        else:
            unpredicted_count += 1

        if latest_assess:
            attendance_list.append(latest_assess.attendance_percentage)
            internals_list.append(latest_assess.internal_test_marks)
            gpa_list.append(latest_assess.prev_semester_gpa)

            scatter_data.append({
                "student_id": student.id,
                "roll_number": student.roll_number,
                "name": student.name,
                "attendance": round(latest_assess.attendance_percentage, 1),
                "internal_marks": round(latest_assess.internal_test_marks, 1),
                "risk_tier": tier,
                "gpa": round(latest_assess.prev_semester_gpa, 2)
            })

    evaluated_students = high_risk_count + moderate_risk_count + low_risk_count
    avg_attendance = round(sum(attendance_list) / len(attendance_list), 1) if attendance_list else 0.0
    avg_internals = round(sum(internals_list) / len(internals_list), 1) if internals_list else 0.0
    avg_gpa = round(sum(gpa_list) / len(gpa_list), 2) if gpa_list else 0.0

    risk_distribution = [
        {"name": "Low Risk", "value": low_risk_count, "color": "#10B981"},       # Emerald Green
        {"name": "Moderate Risk", "value": moderate_risk_count, "color": "#F59E0B"}, # Amber
        {"name": "High Risk", "value": high_risk_count, "color": "#EF4444"}        # Rose Red
    ]

    if unpredicted_count > 0:
        risk_distribution.append({"name": "Unpredicted", "value": unpredicted_count, "color": "#9CA3AF"})

    # Subject alerts: count students falling below critical thresholds
    critical_attendance_count = sum(1 for a in attendance_list if a < 75.0)
    critical_internals_count = sum(1 for i in internals_list if i < 50.0)
    critical_gpa_count = sum(1 for g in gpa_list if g < 6.0)

    subject_alerts = [
        {
            "category": "Attendance Deficit (<75%)",
            "count": critical_attendance_count,
            "percentage": round((critical_attendance_count / max(1, len(attendance_list))) * 100, 1),
            "severity": "critical" if critical_attendance_count > (len(attendance_list) * 0.2) else "warning"
        },
        {
            "category": "Internal Test Failure (<50)",
            "count": critical_internals_count,
            "percentage": round((critical_internals_count / max(1, len(internals_list))) * 100, 1),
            "severity": "critical" if critical_internals_count > (len(internals_list) * 0.15) else "warning"
        },
        {
            "category": "Low Prior GPA (<6.0)",
            "count": critical_gpa_count,
            "percentage": round((critical_gpa_count / max(1, len(gpa_list))) * 100, 1),
            "severity": "warning"
        }
    ]

    # Semester performance trends
    semester_query = db.query(
        Assessment.semester,
        func.avg(Assessment.attendance_percentage).label("avg_attendance"),
        func.avg(Assessment.internal_test_marks).label("avg_internals"),
        func.avg(Assessment.prev_semester_gpa).label("avg_gpa"),
        func.count(Assessment.id).label("record_count")
    ).group_by(Assessment.semester).order_by(Assessment.semester).all()

    semester_trends = []
    for sem in semester_query:
        semester_trends.append({
            "semester": f"Sem {sem.semester}",
            "attendance": round(float(sem.avg_attendance or 0), 1),
            "internal_marks": round(float(sem.avg_internals or 0), 1),
            "gpa": round(float(sem.avg_gpa or 0) * 10, 1),  # scale to 100 for visual comparison
            "record_count": sem.record_count
        })

    # If no semester query data, provide empty list
    return DashboardSummaryResponse(
        total_students=total_students,
        total_assessments=total_assessments,
        evaluated_students=evaluated_students,
        high_risk_count=high_risk_count,
        moderate_risk_count=moderate_risk_count,
        low_risk_count=low_risk_count,
        avg_attendance=avg_attendance,
        avg_internals=avg_internals,
        avg_gpa=avg_gpa,
        risk_distribution=risk_distribution,
        subject_alerts=subject_alerts,
        scatter_data=scatter_data[:120],  # sample points for smooth UI rendering
        semester_trends=semester_trends
    )

