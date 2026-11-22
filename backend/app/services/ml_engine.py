"""
Machine Learning Inference Engine for SAPPS
Loads the Random Forest classifier artifact and performs robust inference.
"""

import os
import warnings
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd
from app.core.config import settings

# Suppress minor scikit-learn version differences when unpickling across environments
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass

FEATURE_ORDER = [
    "attendance_percentage",
    "internal_test_marks",
    "assignment_score",
    "quiz_score",
    "prev_semester_gpa"
]


class MLEngine:
    _instance = None

    def __init__(self):
        self.artifact_path = settings.ML_ARTIFACT_PATH
        self.model = None
        self.feature_names = FEATURE_ORDER
        self.classes = ["High Risk", "Moderate Risk", "Low Risk"]
        self.feature_importances = {
            "attendance_percentage": 0.3370,
            "internal_test_marks": 0.3259,
            "prev_semester_gpa": 0.1336,
            "assignment_score": 0.1301,
            "quiz_score": 0.0734
        }
        self.model_version = "v1.0.0-rf-optimized"
        self.load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self):
        if os.path.exists(self.artifact_path):
            try:
                artifact = joblib.load(self.artifact_path)
                self.model = artifact.get("model")
                self.feature_names = artifact.get("feature_names", FEATURE_ORDER)
                self.classes = artifact.get("classes", self.classes)
                self.feature_importances = artifact.get("feature_importances", self.feature_importances)
                self.model_version = artifact.get("model_version", self.model_version)
                print(f"[MLEngine] Loaded artifact from {self.artifact_path} ({self.model_version})")
            except Exception as e:
                print(f"[MLEngine] Error loading model artifact: {e}. Will attempt fallback.")
        else:
            print(f"[MLEngine] Warning: Artifact {self.artifact_path} not found. Running on baseline fallback.")

    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Runs inference on student academic indicators.
        Returns predicted risk tier, confidence score, class probability distribution, and feature importances.
        """
        # Ensure all features exist with fallback defaults
        data = {
            "attendance_percentage": float(features.get("attendance_percentage", 75.0)),
            "internal_test_marks": float(features.get("internal_test_marks", 60.0)),
            "assignment_score": float(features.get("assignment_score", 70.0)),
            "quiz_score": float(features.get("quiz_score", 70.0)),
            "prev_semester_gpa": float(features.get("prev_semester_gpa", 7.0))
        }

        feature_df = pd.DataFrame([{f: data[f] for f in self.feature_names}])

        if self.model is not None:
            probabilities = self.model.predict_proba(feature_df)[0]
            class_indices = {cls: idx for idx, cls in enumerate(self.model.classes_)}

            prob_dict = {
                cls: round(float(probabilities[class_indices[cls]]), 4)
                for cls in self.model.classes_
            }

            predicted_class = self.model.predict(feature_df)[0]
            confidence = prob_dict[predicted_class]
        else:
            # Deterministic heuristic fallback if model file missing
            cpi = (
                0.30 * (data["internal_test_marks"] / 100.0) +
                0.25 * (data["attendance_percentage"] / 100.0) +
                0.20 * (data["assignment_score"] / 100.0) +
                0.15 * (data["quiz_score"] / 100.0) +
                0.10 * (data["prev_semester_gpa"] / 10.0)
            )
            if cpi < 0.50 or data["attendance_percentage"] < 65.0 or data["internal_test_marks"] < 40.0:
                predicted_class = "High Risk"
                confidence = 0.88
                prob_dict = {"High Risk": 0.88, "Moderate Risk": 0.10, "Low Risk": 0.02}
            elif cpi < 0.70 or data["attendance_percentage"] < 75.0 or data["internal_test_marks"] < 55.0:
                predicted_class = "Moderate Risk"
                confidence = 0.79
                prob_dict = {"High Risk": 0.12, "Moderate Risk": 0.79, "Low Risk": 0.09}
            else:
                predicted_class = "Low Risk"
                confidence = 0.92
                prob_dict = {"High Risk": 0.01, "Moderate Risk": 0.07, "Low Risk": 0.92}

        return {
            "risk_tier": predicted_class,
            "confidence_score": round(confidence, 4),
            "probabilities": prob_dict,
            "feature_importances": self.feature_importances,
            "features_evaluated": data,
            "model_version": self.model_version
        }


ml_engine = MLEngine.get_instance()
