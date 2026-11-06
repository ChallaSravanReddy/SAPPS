from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class FeatureAttributionItem(BaseModel):
    feature: str
    feature_label: str
    value: float
    standard_threshold: float
    status: str  # "Deficit", "Borderline", "Satisfactory"
    importance_weight: float
    contribution_pct: float
    reason: str


class PredictionResponse(BaseModel):
    id: Optional[str] = None
    student_id: str
    student_name: str
    roll_number: str
    department: str
    semester: int
    risk_tier: str  # "High Risk", "Moderate Risk", "Low Risk"
    confidence_score: float  # e.g. 0.94 (94%)
    probabilities: Dict[str, float]
    top_negative_factors: List[FeatureAttributionItem]
    actionable_recommendations: List[str]
    model_version: str
    academic_snapshot: Dict[str, float]
    created_at: datetime


class PredictionRecordResponse(BaseModel):
    id: str
    student_id: str
    risk_tier: str
    confidence_score: float
    top_negative_factors: List[Any]
    actionable_recommendations: List[str]
    model_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardSummaryResponse(BaseModel):
    total_students: int
    total_assessments: int
    evaluated_students: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    avg_attendance: float
    avg_internals: float
    avg_gpa: float
    risk_distribution: List[Dict[str, Any]]
    subject_alerts: List[Dict[str, Any]]
    scatter_data: List[Dict[str, Any]]
    semester_trends: List[Dict[str, Any]]

