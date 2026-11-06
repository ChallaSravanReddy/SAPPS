import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship

from app.db.session import Base


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    risk_tier = Column(String(50), nullable=False)  # "Low Risk", "Moderate Risk", "High Risk"
    confidence_score = Column(Float, nullable=False)  # 0.0 - 1.0 (or 0-100%)
    top_negative_factors = Column(JSON, nullable=False, default=list)
    actionable_recommendations = Column(JSON, nullable=False, default=list)
    model_version = Column(String(50), nullable=False, default="v1.0.0-rf-optimized")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="predictions")

