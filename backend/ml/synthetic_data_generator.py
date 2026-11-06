"""
Synthetic Student Data Generator for SAPPS (Student Academic Performance Prediction System)
Generates 1,500 realistic student academic records with strict separation to prevent data leakage.
"""

import numpy as np
import pandas as pd
import os

FIRST_NAMES = [
    "Aarav", "Aditi", "Ananya", "Arjun", "Deepak", "Divya", "Ishaan", "Kavya",
    "Manish", "Neha", "Pooja", "Rahul", "Riya", "Rohan", "Sanjay", "Shreya",
    "Sneha", "Tarun", "Varun", "Vikas", "Liam", "Emma", "Noah", "Olivia",
    "James", "Sophia", "Benjamin", "Isabella", "Lucas", "Mia", "Alexander", "Charlotte"
]

LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Gupta", "Mehta",
    "Joshi", "Bhat", "Kumar", "Singh", "Rao", "Das", "Chopra", "Kulkarni",
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson"
]

DEPARTMENTS = [
    "Computer Science and Engineering",
    "Information Technology",
    "Electronics and Communication",
    "Mechanical Engineering",
    "Electrical Engineering"
]

FEATURE_COLS = [
    "attendance_percentage",
    "internal_test_marks",
    "assignment_score",
    "quiz_score",
    "prev_semester_gpa"
]


def generate_synthetic_data(num_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)

    # Latent academic engagement and baseline competence: 3 clusters with spread
    # 0: struggling (25%), 1: average/borderline (40%), 2: high performing (35%)
    cluster_choices = np.random.choice([0, 1, 2], size=num_samples, p=[0.25, 0.40, 0.35])

    data = []

    for i in range(num_samples):
        cluster = cluster_choices[i]

        if cluster == 0:  # Struggling tier
            base_attendance = np.random.normal(55, 12)
            base_internals = np.random.normal(42, 11)
            base_assignment = np.random.normal(48, 12)
            base_quiz = np.random.normal(45, 12)
            base_gpa = np.random.normal(5.2, 1.0)
        elif cluster == 1:  # Borderline tier
            base_attendance = np.random.normal(74, 8)
            base_internals = np.random.normal(62, 9)
            base_assignment = np.random.normal(68, 10)
            base_quiz = np.random.normal(65, 10)
            base_gpa = np.random.normal(6.9, 0.8)
        else:  # High-performing tier
            base_attendance = np.random.normal(88, 6)
            base_internals = np.random.normal(82, 8)
            base_assignment = np.random.normal(86, 7)
            base_quiz = np.random.normal(84, 8)
            base_gpa = np.random.normal(8.7, 0.7)

        # Add individual idiosyncratic noise to prevent artificial perfection
        attendance = float(np.clip(base_attendance + np.random.normal(0, 4), 30.0, 100.0))
        internals = float(np.clip(base_internals + np.random.normal(0, 4), 20.0, 100.0))
        assignment = float(np.clip(base_assignment + np.random.normal(0, 5), 20.0, 100.0))
        quiz = float(np.clip(base_quiz + np.random.normal(0, 5), 20.0, 100.0))
        prev_gpa = float(np.clip(base_gpa + np.random.normal(0, 0.25), 3.0, 10.0))

        # Academic Composite Performance Index (CPI) to assign realistic risk
        # Note: CPI uses strictly ongoing semester in-course indicators + historical GPA.
        # No final exam marks are involved (zero leakage).
        attendance_norm = attendance / 100.0
        internals_norm = internals / 100.0
        assignment_norm = assignment / 100.0
        quiz_norm = quiz / 100.0
        gpa_norm = prev_gpa / 10.0

        cpi = (
            0.30 * internals_norm +
            0.25 * attendance_norm +
            0.20 * assignment_norm +
            0.15 * quiz_norm +
            0.10 * gpa_norm
        )

        # Severe penalty condition rules (institutional academic warning criteria)
        is_attendance_critical = attendance < 65.0
        is_internals_failing = internals < 40.0

        if is_attendance_critical and is_internals_failing:
            risk_tier = "High Risk"
        elif cpi < 0.52 or (internals < 45.0 and attendance < 72.0):
            risk_tier = "High Risk"
        elif cpi < 0.70 or attendance < 75.0 or internals < 55.0 or prev_gpa < 5.8:
            risk_tier = "Moderate Risk"
        else:
            risk_tier = "Low Risk"

        # Inject 3% stochastic edge cases (e.g., student with high attendance who had health emergency during internal tests)
        if np.random.rand() < 0.03:
            if risk_tier == "Low Risk":
                risk_tier = "Moderate Risk"
            elif risk_tier == "Moderate Risk":
                risk_tier = np.random.choice(["Low Risk", "High Risk"])

        roll_prefix = "2024" + np.random.choice(["CS", "IT", "EC", "ME", "EE"])
        roll_number = f"{roll_prefix}{1000 + i}"
        name = f"{np.random.choice(FIRST_NAMES)} {np.random.choice(LAST_NAMES)}"
        department = np.random.choice(DEPARTMENTS)
        semester = int(np.random.choice([3, 4, 5, 6, 7]))

        data.append({
            "roll_number": roll_number,
            "student_name": name,
            "department": department,
            "semester": semester,
            "attendance_percentage": round(attendance, 2),
            "internal_test_marks": round(internals, 2),
            "assignment_score": round(assignment, 2),
            "quiz_score": round(quiz, 2),
            "prev_semester_gpa": round(prev_gpa, 2),
            "risk_tier": risk_tier
        })

    df = pd.DataFrame(data)
    return df


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(current_dir, "artifacts", "student_academic_records.csv")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print("Generating 1,500 synthetic student academic records...")
    df = generate_synthetic_data(num_samples=1500)
    df.to_csv(output_path, index=False)
    print(f"Data saved to {output_path}")
    print("\nClass distribution:")
    print(df["risk_tier"].value_counts(normalize=True).map(lambda n: f"{n:.2%}"))
    print("\nSample records:")
    print(df.head(3))

