@echo off
echo =========================================================================
echo Starting Student Academic Performance Prediction System (SAPPS) Backend
echo FastAPI API Server running at http://127.0.0.1:8000 (Swagger: /docs)
echo =========================================================================
set PYTHONPATH=%~dp0backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

