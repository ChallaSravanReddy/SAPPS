"""
Explainable AI (XAI) and Contextual Academic Recommendation Engine
Evaluates individual feature weights and deficits against institutional thresholds.
Generates human-readable attributions and targeted 2-3 academic interventions.
"""

from typing import Dict, Any, List
from app.schemas.prediction import FeatureAttributionItem

THRESHOLDS = {
    "attendance_percentage": {
        "label": "Attendance",
        "threshold": 75.0,
        "critical": 65.0,
        "unit": "%",
        "max": 100.0,
        "direction": "higher_is_better"
    },
    "internal_test_marks": {
        "label": "Internal Test Marks",
        "threshold": 50.0,
        "critical": 40.0,
        "unit": "marks",
        "max": 100.0,
        "direction": "higher_is_better"
    },
    "assignment_score": {
        "label": "Assignment Score",
        "threshold": 60.0,
        "critical": 50.0,
        "unit": "marks",
        "max": 100.0,
        "direction": "higher_is_better"
    },
    "quiz_score": {
        "label": "Quiz Performance",
        "threshold": 60.0,
        "critical": 45.0,
        "unit": "marks",
        "max": 100.0,
        "direction": "higher_is_better"
    },
    "prev_semester_gpa": {
        "label": "Prior Semester GPA",
        "threshold": 6.0,
        "critical": 5.0,
        "unit": "GPA",
        "max": 10.0,
        "direction": "higher_is_better"
    }
}


def compute_xai_and_recommendations(
    features: Dict[str, float],
    risk_tier: str,
    feature_importances: Dict[str, float]
) -> Dict[str, Any]:
    """
    Computes feature-level attributions and actionable academic interventions.
    """
    attributions: List[FeatureAttributionItem] = []
    deficit_scores = {}
    total_weighted_deficit = 0.0

    # Step 1: Calculate raw deficit and importance-weighted deficit for each metric
    for feat_name, meta in THRESHOLDS.items():
        val = float(features.get(feat_name, meta["threshold"]))
        threshold = meta["threshold"]
        weight = float(feature_importances.get(feat_name, 0.20))

        # Deficit calculation: how far below benchmark/threshold
        if val < meta["critical"]:
            status = "Deficit"
            gap_ratio = (threshold - val) / threshold
            raw_deficit = max(0.0, gap_ratio * 1.5)  # amplify critical deficits
        elif val < threshold:
            status = "Borderline"
            gap_ratio = (threshold - val) / threshold
            raw_deficit = max(0.0, gap_ratio)
        else:
            status = "Satisfactory"
            raw_deficit = 0.0

        weighted_deficit = raw_deficit * weight
        deficit_scores[feat_name] = {
            "val": val,
            "threshold": threshold,
            "status": status,
            "weight": weight,
            "weighted_deficit": weighted_deficit
        }
        total_weighted_deficit += weighted_deficit

    # Step 2: Compute percentage contribution toward the risk assessment
    for feat_name, meta in THRESHOLDS.items():
        item = deficit_scores[feat_name]
        val = item["val"]
        thresh = item["threshold"]
        weight = item["weight"]
        w_def = item["weighted_deficit"]

        if total_weighted_deficit > 0:
            contribution_pct = round((w_def / total_weighted_deficit) * 100.0, 1)
        else:
            # When student has no deficits (Low Risk), distribute contribution by model feature importance
            contribution_pct = round(weight * 100.0, 1)

        # Generate human-readable reason
        if item["status"] == "Deficit":
            reason = (
                f"{meta['label']} is critically low at {val:.1f}{meta['unit']} "
                f"(below mandatory threshold of {thresh:.1f}{meta['unit']}), "
                f"contributing {contribution_pct}% toward the {risk_tier} classification."
            )
        elif item["status"] == "Borderline":
            reason = (
                f"{meta['label']} is borderline at {val:.1f}{meta['unit']} "
                f"(threshold {thresh:.1f}{meta['unit']}), "
                f"accounting for {contribution_pct}% of the performance vulnerability."
            )
        else:
            reason = (
                f"{meta['label']} is satisfactory at {val:.1f}{meta['unit']} "
                f"(exceeds {thresh:.1f}{meta['unit']} benchmark), stabilizing academic standing."
            )

        attributions.append(FeatureAttributionItem(
            feature=feat_name,
            feature_label=meta["label"],
            value=round(val, 2),
            standard_threshold=thresh,
            status=item["status"],
            importance_weight=round(weight, 4),
            contribution_pct=contribution_pct,
            reason=reason
        ))

    # Sort attributions: Deficits first, then highest contribution
    attributions.sort(key=lambda x: (0 if x.status == "Deficit" else (1 if x.status == "Borderline" else 2), -x.contribution_pct))

    # Step 3: Formulate 2 to 3 contextual academic interventions based on specific deficit signals
    recommendations = generate_contextual_interventions(features, deficit_scores, risk_tier)

    return {
        "top_negative_factors": [item.model_dump() for item in attributions],
        "actionable_recommendations": recommendations
    }


def generate_contextual_interventions(
    features: Dict[str, float],
    deficit_scores: Dict[str, Any],
    risk_tier: str
) -> List[str]:
    """Generates 2 to 3 tailored academic interventions for faculty, advisor, and student."""
    interventions = []

    att_val = features.get("attendance_percentage", 75.0)
    int_val = features.get("internal_test_marks", 60.0)
    asg_val = features.get("assignment_score", 70.0)
    quiz_val = features.get("quiz_score", 70.0)
    gpa_val = features.get("prev_semester_gpa", 7.0)

    # 1. Attendance Interventions
    if att_val < 65.0:
        interventions.append(
            f"Issue immediate Attendance Warning (currently {att_val:.1f}%) and schedule mandatory counseling "
            "with Academic Advisor to resolve transportation or personal barriers."
        )
    elif att_val < 75.0:
        interventions.append(
            f"Establish a weekly attendance tracking agreement to recover above the 75% university eligibility requirement."
        )

    # 2. Internal Marks Interventions
    if int_val < 50.0:
        interventions.append(
            "Schedule mandatory faculty doubt-clearing sessions and enroll student in structured midterm remedial tutorials."
        )
    elif int_val < 60.0 and len(interventions) < 3:
        interventions.append(
            "Provide chapter-wise concept summaries and targeted practice mock tests prior to upcoming evaluations."
        )

    # 3. Assignment Interventions
    if asg_val < 60.0 and len(interventions) < 3:
        interventions.append(
            "Assign TA-monitored lab practice hours and permit a submission window for re-worked assignment modules."
        )

    # 4. Quiz Interventions
    if quiz_val < 60.0 and len(interventions) < 3:
        interventions.append(
            "Assign makeup quizzes on LMS Modules 1 & 2 to reinforce rapid conceptual recall and active review."
        )

    # 5. Prior GPA Deficit
    if gpa_val < 6.0 and len(interventions) < 3:
        interventions.append(
            "Pair student with a high-performing peer mentor for weekly structured study circles and foundational review."
        )

    # Fallback recommendations if student is in Low Risk or has few deficits
    if risk_tier == "Low Risk":
        interventions = [
            "Maintain current high study cadence; recommend enrollment in departmental advanced honors or research seminar.",
            "Encourage peer-tutoring leadership or participation in upcoming technical hackathons and competitive certifications.",
            "Schedule semester check-in to explore competitive internship opportunities and capstone project ideation."
        ]
    elif len(interventions) < 2:
        interventions.append(
            "Conduct a bi-weekly mentor review to maintain consistent performance and avoid pre-exam burnout."
        )
        if len(interventions) < 2:
            interventions.append(
                "Encourage active participation in collaborative study groups and interactive classroom Q&A."
            )

    # Ensure strictly 2 to 3 interventions
    return interventions[:3]

