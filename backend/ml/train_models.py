"""
Model Training and Benchmarking Pipeline for SAPPS
Trains Logistic Regression, Decision Tree, and Random Forest models.
Evaluates Accuracy, Precision, Macro F1, and High-Risk Recall.
Saves the optimized Random Forest model and metadata into artifacts/rf_student_predictor.joblib.
"""

import os
import sys
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# Ensure local imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synthetic_data_generator import FEATURE_COLS, generate_synthetic_data


def train_and_benchmark():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    artifacts_dir = os.path.join(current_dir, "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)
    dataset_csv = os.path.join(artifacts_dir, "student_academic_records.csv")

    if not os.path.exists(dataset_csv):
        print("Synthetic dataset not found. Generating fresh records...")
        df = generate_synthetic_data(num_samples=1500)
        df.to_csv(dataset_csv, index=False)
    else:
        print(f"Loading dataset from: {dataset_csv}")
        df = pd.read_csv(dataset_csv)

    X = df[FEATURE_COLS]
    y = df["risk_tier"]

    # Stratified split to preserve class ratios
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    target_classes = ["High Risk", "Moderate Risk", "Low Risk"]

    print(f"\nDataset size: {len(df)} records")
    print(f"Train split: {len(X_train)} | Test split: {len(X_test)}")
    print(f"Features: {FEATURE_COLS}")
    print(f"Target distribution:\n{y.value_counts()}")

    # Define the 3 models
    models = {
        "Logistic Regression (Baseline)": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                random_state=42
            ))
        ]),
        "Decision Tree Classifier": DecisionTreeClassifier(
            max_depth=6,
            min_samples_split=10,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=42
        ),
        "Random Forest Classifier (Optimized)": RandomForestClassifier(
            n_estimators=150,
            max_depth=8,
            min_samples_split=6,
            min_samples_leaf=3,
            class_weight="balanced",
            random_state=42
        )
    }

    results = {}
    fitted_models = {}

    print("\n" + "=" * 70)
    print("MODEL BENCHMARKING & EVALUATION")
    print("=" * 70)

    for name, model in models.items():
        print(f"\nTraining [{name}]...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        macro_prec = precision_score(y_test, y_pred, average="macro", zero_division=0)
        macro_f1 = f1_score(y_test, y_pred, average="macro", zero_division=0)
        # Recall specifically for the "High Risk" class
        high_risk_recall = recall_score(
            y_test, y_pred, labels=["High Risk"], average="micro", zero_division=0
        )

        results[name] = {
            "accuracy": float(acc),
            "macro_precision": float(macro_prec),
            "macro_f1": float(macro_f1),
            "high_risk_recall": float(high_risk_recall)
        }
        fitted_models[name] = model

        print(f"--- Classification Report: {name} ---")
        print(classification_report(y_test, y_pred, digits=4))

        print(f"--- Confusion Matrix ({target_classes}) ---")
        cm = confusion_matrix(y_test, y_pred, labels=target_classes)
        cm_df = pd.DataFrame(cm, index=[f"Actual {c}" for c in target_classes],
                             columns=[f"Pred {c}" for c in target_classes])
        print(cm_df)

    # Benchmark summary table
    print("\n" + "=" * 75)
    print("BENCHMARK COMPARISON TABLE")
    print("=" * 75)
    summary_df = pd.DataFrame(results).T
    summary_df = summary_df[["accuracy", "macro_precision", "macro_f1", "high_risk_recall"]]
    summary_df.columns = ["Accuracy", "Macro Precision", "Macro F1", "High-Risk Recall"]
    print(summary_df.to_string(formatters={
        "Accuracy": "{:.2%}".format,
        "Macro Precision": "{:.2%}".format,
        "Macro F1": "{:.2%}".format,
        "High-Risk Recall": "{:.2%}".format
    }))
    print("=" * 75)

    best_model_name = "Random Forest Classifier (Optimized)"
    best_estimator = fitted_models[best_model_name]

    # Save artifact
    artifact_path = os.path.join(artifacts_dir, "rf_student_predictor.joblib")
    artifact_payload = {
        "model": best_estimator,
        "model_version": "v1.0.0-rf-optimized",
        "model_name": best_model_name,
        "feature_names": FEATURE_COLS,
        "classes": list(best_estimator.classes_),
        "feature_importances": dict(zip(FEATURE_COLS, best_estimator.feature_importances_)),
        "metrics": results[best_model_name],
        "all_benchmarks": results,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    joblib.dump(artifact_payload, artifact_path)
    print(f"\nBest model successfully persisted to:\n  -> {artifact_path}")
    print(f"Random Forest Feature Importances:")
    for feat, imp in sorted(artifact_payload["feature_importances"].items(), key=lambda x: x[1], reverse=True):
        print(f"  • {feat:25s}: {imp:.4f} ({imp * 100:.2f}%)")

    return artifact_payload


if __name__ == "__main__":
    train_and_benchmark()
