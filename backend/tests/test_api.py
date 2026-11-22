import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_auth_login_success():
    res = client.post("/api/v1/auth/login", json={
        "email": "faculty@sapp.edu",
        "password": "Faculty@123"
    })
    assert res.status_code == 200
    payload = res.json()
    assert "access_token" in payload
    assert payload["role"] == "FACULTY"
    assert payload["token_type"] == "bearer"


def test_auth_login_invalid_password():
    res = client.post("/api/v1/auth/login", json={
        "email": "faculty@sapp.edu",
        "password": "WrongPassword!99"
    })
    assert res.status_code == 401


def test_get_students_requires_auth():
    res = client.get("/api/v1/students")
    assert res.status_code == 401


def test_get_students_faculty():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "faculty@sapp.edu",
        "password": "Faculty@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/students", headers=headers)
    assert res.status_code == 200
    students = res.json()
    assert isinstance(students, list)
    assert len(students) > 0


def test_dashboard_summary():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@sapp.edu",
        "password": "Admin@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/analytics/dashboard-summary", headers=headers)
    assert res.status_code == 200
    summary = res.json()
    assert "total_students" in summary
    assert "risk_distribution" in summary
    assert "scatter_data" in summary
    assert summary["total_students"] > 0


def test_evaluate_prediction():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "faculty@sapp.edu",
        "password": "Faculty@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    students_res = client.get("/api/v1/students", headers=headers)
    student_id = students_res.json()[0]["id"]

    eval_res = client.post(f"/api/v1/predictions/evaluate/{student_id}", headers=headers)
    assert eval_res.status_code == 200
    pred = eval_res.json()
    assert pred["risk_tier"] in ["High Risk", "Moderate Risk", "Low Risk"]
    assert 0.0 <= pred["confidence_score"] <= 1.0
    assert len(pred["top_negative_factors"]) == 5
    assert len(pred["actionable_recommendations"]) >= 2


def test_student_self_profile():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@sapp.edu",
        "password": "Student@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    prof_res = client.get("/api/v1/students/me/profile", headers=headers)
    assert prof_res.status_code == 200
    data = prof_res.json()
    assert "student" in data
    assert data["student"]["roll_number"] == "2024CS1001"
    assert "latest_prediction" in data
    assert "assessments" in data


def test_simulation_endpoint():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@sapp.edu",
        "password": "Student@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sim_res = client.post("/api/v1/predictions/simulate", headers=headers, json={
        "attendance_percentage": 92.0,
        "internal_test_marks": 88.0,
        "assignment_score": 90.0,
        "quiz_score": 85.0,
        "prev_semester_gpa": 9.0
    })
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["risk_tier"] == "Low Risk"
    assert sim_data["confidence_score"] > 0.50
    assert "probabilities" in sim_data

