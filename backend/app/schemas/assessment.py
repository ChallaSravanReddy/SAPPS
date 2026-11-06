from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class AssessmentBase(BaseModel):
    semester: int = Field(..., ge=1, le=12, description="Current academic semester")
    attendance_percentage: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0 - 100)")
    internal_test_marks: float = Field(..., ge=0.0, le=100.0, description="Internal examination marks (0 - 100)")
    assignment_score: float = Field(..., ge=0.0, le=100.0, description="Assignment score (0 - 100)")
    quiz_score: float = Field(..., ge=0.0, le=100.0, description="Periodic quiz score (0 - 100)")
    prev_semester_gpa: float = Field(..., ge=0.0, le=10.0, description="Previous semester CGPA/GPA (0 - 10.0)")


class AssessmentCreate(AssessmentBase):
    student_id: str


class AssessmentResponse(AssessmentBase):
    id: str
    student_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentBatchRow(AssessmentBase):
    roll_number: str
    student_name: Optional[str] = None
    department: Optional[str] = None


class BatchUploadResult(BaseModel):
    total_processed: int
    successful_records: int
    failed_records: int
    errors: List[str]
    inserted_students_count: int
    inserted_assessments_count: int

