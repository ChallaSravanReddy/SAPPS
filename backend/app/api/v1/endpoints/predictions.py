from typing import Any, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, require_roles
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.academic import Assessment
from app.models.prediction import PredictionRecord
from app.schemas.prediction import (
    PredictionResponse,
    PredictionRecordResponse,
    SimulationRequest,
    SimulationResponse,
)
from app.services.ml_engine import ml_engine
from app.services.xai_explainer import compute_xai_and_recommendations

router = APIRouter()


@router.post("/evaluate/{student_id}", response_model=PredictionResponse)
def evaluate_student_prediction(
    student_id: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY])),
    db: Session = Depends(get_db)
) -> Any:
    """
    Pulls the most recent academic assessment record for student, runs inference
    against the ML Random Forest model, stores the prediction record, and returns
    explainable AI feature attributions and actionable interventions.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' does not exist."
        )

    # Pull latest assessment
    latest_assessment = db.query(Assessment).filter(
        Assessment.student_id == student_id
    ).order_by(desc(Assessment.semester), desc(Assessment.created_at)).first()

    if not latest_assessment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No academic assessment records found for this student. Please add assessment data first."
        )

    features = {
        "attendance_percentage": float(latest_assessment.attendance_percentage),
        "internal_test_marks": float(latest_assessment.internal_test_marks),
        "assignment_score": float(latest_assessment.assignment_score),
        "quiz_score": float(latest_assessment.quiz_score),
        "prev_semester_gpa": float(latest_assessment.prev_semester_gpa)
    }

    # Run inference
    inference_result = ml_engine.predict(features)
    risk_tier = inference_result["risk_tier"]
    confidence = inference_result["confidence_score"]
    probabilities = inference_result["probabilities"]
    model_version = inference_result["model_version"]

    # Compute XAI & Interventions
    xai_result = compute_xai_and_recommendations(
        features=features,
        risk_tier=risk_tier,
        feature_importances=inference_result["feature_importances"]
    )

    # Persist prediction record into DB
    record = PredictionRecord(
        student_id=student.id,
        risk_tier=risk_tier,
        confidence_score=confidence,
        top_negative_factors=xai_result["top_negative_factors"],
        actionable_recommendations=xai_result["actionable_recommendations"],
        model_version=model_version
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return PredictionResponse(
        id=record.id,
        student_id=student.id,
        student_name=student.name,
        roll_number=student.roll_number,
        department=student.department,
        semester=latest_assessment.semester,
        risk_tier=risk_tier,
        confidence_score=confidence,
        probabilities=probabilities,
        top_negative_factors=xai_result["top_negative_factors"],
        actionable_recommendations=xai_result["actionable_recommendations"],
        model_version=model_version,
        academic_snapshot=features,
        created_at=record.created_at
    )


@router.post("/simulate", response_model=SimulationResponse)
def simulate_academic_indicators(
    sim_data: SimulationRequest,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT]))
) -> Any:
    """Simulates risk outcome for what-if academic scenarios without altering DB records."""
    feats = {
        "attendance_percentage": float(sim_data.attendance_percentage),
        "internal_test_marks": float(sim_data.internal_test_marks),
        "assignment_score": float(sim_data.assignment_score),
        "quiz_score": float(sim_data.quiz_score),
        "prev_semester_gpa": float(sim_data.prev_semester_gpa)
    }
    pred = ml_engine.predict(feats)
    xai = compute_xai_and_recommendations(feats, pred["risk_tier"], pred["feature_importances"])
    return {
        "risk_tier": pred["risk_tier"],
        "confidence_score": pred["confidence_score"],
        "probabilities": pred["probabilities"],
        "top_negative_factors": xai["top_negative_factors"],
        "actionable_recommendations": xai["actionable_recommendations"],
        "model_version": pred["model_version"],
        "inputs": feats
    }


@router.get("/student/{student_id}", response_model=List[PredictionRecordResponse])
def get_student_prediction_history(
    student_id: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT])),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve historical prediction records for a student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found."
        )

    if current_user.role == UserRole.STUDENT and student.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to access this student's predictions."
        )

    records = db.query(PredictionRecord).filter(
        PredictionRecord.student_id == student_id
    ).order_by(desc(PredictionRecord.created_at)).all()

    return records

