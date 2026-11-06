from app.db.session import Base
from app.models.user import User, UserRole
from app.models.student import Student, Faculty
from app.models.academic import Assessment
from app.models.prediction import PredictionRecord

__all__ = ["Base", "User", "UserRole", "Student", "Faculty", "Assessment", "PredictionRecord"]

