import pytest
from app.services.ml_engine import ml_engine
from app.services.xai_explainer import compute_xai_and_recommendations


def test_ml_engine_loaded():
    assert ml_engine is not None
    assert ml_engine.model is not None
    assert len(ml_engine.classes) == 3


def test_ml_prediction_high_risk():
    # Vulnerable student features
    features = {
        "attendance_percentage": 48.0,
        "internal_test_marks": 35.0,
        "assignment_score": 45.0,
        "quiz_score": 42.0,
        "prev_semester_gpa": 4.8
    }
    result = ml_engine.predict(features)
    assert result["risk_tier"] == "High Risk"
    assert result["confidence_score"] >= 0.50
    assert "probabilities" in result
    assert result["probabilities"]["High Risk"] > result["probabilities"]["Low Risk"]


def test_ml_prediction_low_risk():
    # Strong student features
    features = {
        "attendance_percentage": 92.0,
        "internal_test_marks": 88.0,
        "assignment_score": 90.0,
        "quiz_score": 85.0,
        "prev_semester_gpa": 9.1
    }
    result = ml_engine.predict(features)
    assert result["risk_tier"] == "Low Risk"
    assert result["confidence_score"] >= 0.50
    assert result["probabilities"]["Low Risk"] > result["probabilities"]["High Risk"]


def test_xai_explainer_deficits_and_interventions():
    features = {
        "attendance_percentage": 62.0,   # Deficit (<75%)
        "internal_test_marks": 45.0,     # Deficit (<50)
        "assignment_score": 75.0,
        "quiz_score": 70.0,
        "prev_semester_gpa": 6.5
    }
    importances = ml_engine.feature_importances
    xai = compute_xai_and_recommendations(features, "High Risk", importances)

    factors = xai["top_negative_factors"]
    assert len(factors) == 5

    # Check that attendance and internal marks are marked as Deficit or Borderline
    att_factor = next(f for f in factors if f["feature"] == "attendance_percentage")
    assert att_factor["status"] in ["Deficit", "Borderline"]
    assert att_factor["contribution_pct"] > 0
    assert "Attendance" in att_factor["reason"]

    # Check that 2 to 3 interventions are generated
    recs = xai["actionable_recommendations"]
    assert 2 <= len(recs) <= 3
    assert any("attendance" in r.lower() or "counseling" in r.lower() for r in recs)

