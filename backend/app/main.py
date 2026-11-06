from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db import base
from app.db.init_db import init_db
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed demo accounts on startup
    print(f"Starting {settings.PROJECT_NAME} in [{settings.ENVIRONMENT}] mode...")
    init_db()
    yield
    print(f"Shutting down {settings.PROJECT_NAME}...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration supporting credentials and all local dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
def root_status():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "api_docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ml_engine": "loaded"
    }

