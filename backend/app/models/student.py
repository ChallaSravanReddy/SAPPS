import uuid
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.session import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, unique=True)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    current_semester = Column(Integer, nullable=False, default=1)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    assessments = relationship("Assessment", back_populates="student", cascade="all, delete-orphan", order_by="Assessment.semester.desc()")
    predictions = relationship("PredictionRecord", back_populates="student", cascade="all, delete-orphan", order_by="PredictionRecord.created_at.desc()")


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)

    # Relationships
    user = relationship("User", back_populates="faculty_profile")

