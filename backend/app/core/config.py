import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Academic Performance Prediction System (SAPPS)"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = "sapps-production-secure-secret-key-change-in-prod-xyz987"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = "sqlite:///./sapps.db"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]

    # ML Artifacts
    ML_ARTIFACT_PATH: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "ml", "artifacts", "rf_student_predictor.joblib")
    )

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()

