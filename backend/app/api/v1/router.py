from fastapi import APIRouter
from app.api.v1.endpoints import auth, students, assessments, predictions, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions & XAI"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

