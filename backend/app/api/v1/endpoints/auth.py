from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, create_access_token
from app.models.user import User, UserRole
from app.schemas.student import Token, UserLogin, UserResponse

router = APIRouter()


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)) -> Any:
    """Authenticate user with email and password, returning a JWT token with claims."""
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Determine profile identifier
    student_id = user.student_profile.id if user.student_profile else None
    faculty_id = user.faculty_profile.id if user.faculty_profile else None
    name = (
        user.student_profile.name if user.student_profile
        else (user.faculty_profile.name if user.faculty_profile else "Administrator")
    )

    claims = {
        "role": user.role.value,
        "email": user.email,
        "user_id": user.id,
        "name": name,
        "student_id": student_id,
        "faculty_id": faculty_id
    }

    access_token = create_access_token(subject=user.id, claims=claims)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "name": name,
        "student_id": student_id,
        "faculty_id": faculty_id
    }


@router.post("/login/oauth2", response_model=Token)
def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Any:
    """OAuth2 compatible login endpoint for Swagger UI."""
    user = db.query(User).filter(User.email == form_data.username.lower().strip()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    student_id = user.student_profile.id if user.student_profile else None
    faculty_id = user.faculty_profile.id if user.faculty_profile else None
    name = (
        user.student_profile.name if user.student_profile
        else (user.faculty_profile.name if user.faculty_profile else "Administrator")
    )

    claims = {
        "role": user.role.value,
        "email": user.email,
        "user_id": user.id,
        "name": name,
        "student_id": student_id,
        "faculty_id": faculty_id
    }

    access_token = create_access_token(subject=user.id, claims=claims)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "name": name,
        "student_id": student_id,
        "faculty_id": faculty_id
    }


@router.get("/me")
def read_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve details of the authenticated user."""
    student_info = None
    if current_user.student_profile:
        student_info = {
            "id": current_user.student_profile.id,
            "roll_number": current_user.student_profile.roll_number,
            "name": current_user.student_profile.name,
            "department": current_user.student_profile.department,
            "current_semester": current_user.student_profile.current_semester,
        }

    faculty_info = None
    if current_user.faculty_profile:
        faculty_info = {
            "id": current_user.faculty_profile.id,
            "name": current_user.faculty_profile.name,
            "department": current_user.faculty_profile.department,
        }

    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value,
        "student_profile": student_info,
        "faculty_profile": faculty_info,
        "created_at": current_user.created_at
    }

