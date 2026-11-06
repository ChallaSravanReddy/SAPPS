import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.db.session import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    semester = Column(Integer, nullable=False)
    attendance_percentage = Column(Float, nullable=False)  # 0.0 - 100.0
    internal_test_marks = Column(Float, nullable=False)    # 0.0 - 100.0
    assignment_score = Column(Float, nullable=False)       # 0.0 - 100.0
    quiz_score = Column(Float, nullable=False)             # 0.0 - 100.0
    prev_semester_gpa = Column(Float, nullable=False)      # 0.0 - 10.0
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="assessments")

