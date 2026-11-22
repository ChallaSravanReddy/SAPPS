from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.user import UserRole
from app.schemas.assessment import AssessmentResponse
from app.schemas.prediction import PredictionRecordResponse


# Authentication schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: str
    email: str
    name: str
    student_id: Optional[str] = None
    faculty_id: Optional[str] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Student schemas
class StudentBase(BaseModel):
    roll_number: str = Field(..., description="Unique university roll number")
    name: str = Field(..., min_length=2, max_length=255)
    department: str = Field(..., min_length=2, max_length=255)
    current_semester: int = Field(..., ge=1, le=12)


class StudentCreate(StudentBase):
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    current_semester: Optional[int] = None


class StudentResponse(StudentBase):
    id: str
    user_id: Optional[str] = None
    latest_risk_tier: Optional[str] = None
    latest_confidence: Optional[float] = None
    latest_attendance: Optional[float] = None
    latest_internals: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class FacultyResponse(BaseModel):
    id: str
    user_id: str
    name: str
    department: str

    model_config = ConfigDict(from_attributes=True)


class StudentProfileInfo(BaseModel):
    id: str
    roll_number: str
    name: str
    department: str
    current_semester: int
    email: Optional[str] = None
    user_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StudentSelfProfileResponse(BaseModel):
    student: StudentProfileInfo
    latest_prediction: Optional[PredictionRecordResponse] = None
    assessments: List[AssessmentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class StudentDetailResponse(BaseModel):
    student: StudentProfileInfo
    assessments: List[AssessmentResponse] = []
    predictions: List[PredictionRecordResponse] = []

    model_config = ConfigDict(from_attributes=True)

