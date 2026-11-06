import os
import csv
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal, Base
from app.db.base import User, UserRole, Student, Faculty, Assessment, PredictionRecord
from app.core.security import get_password_hash
from app.services.ml_engine import ml_engine
from app.services.xai_explainer import compute_xai_and_recommendations


def init_db(db: Session = None):
    """Creates tables and seeds initial demo users and benchmark students."""
    Base.metadata.create_all(bind=engine)

    close_session_at_end = False
    if db is None:
        db = SessionLocal()
        close_session_at_end = True

    try:
        # 1. Seed Admin User
        admin_user = db.query(User).filter(User.email == "admin@sapp.edu").first()
        if not admin_user:
            admin_user = User(
                email="admin@sapp.edu",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN
            )
            db.add(admin_user)
            db.flush()
            print("[InitDB] Created default Admin user: admin@sapp.edu / Admin@123")

        # 2. Seed Faculty User
        faculty_user = db.query(User).filter(User.email == "faculty@sapp.edu").first()
        if not faculty_user:
            faculty_user = User(
                email="faculty@sapp.edu",
                hashed_password=get_password_hash("Faculty@123"),
                role=UserRole.FACULTY
            )
            db.add(faculty_user)
            db.flush()

            faculty = Faculty(
                user_id=faculty_user.id,
                name="Prof. Eleanor Vance",
                department="Computer Science and Engineering"
            )
            db.add(faculty)
            print("[InitDB] Created default Faculty user: faculty@sapp.edu / Faculty@123")

        # 3. Seed Demo Student User
        student_user = db.query(User).filter(User.email == "student@sapp.edu").first()
        demo_student = None
        if not student_user:
            student_user = User(
                email="student@sapp.edu",
                hashed_password=get_password_hash("Student@123"),
                role=UserRole.STUDENT
            )
            db.add(student_user)
            db.flush()

            demo_student = Student(
                user_id=student_user.id,
                roll_number="2024CS1001",
                name="Aarav Sharma",
                department="Computer Science and Engineering",
                current_semester=5
            )
            db.add(demo_student)
            db.flush()

            # Add demo assessments for the demo student
            assess = Assessment(
                student_id=demo_student.id,
                semester=5,
                attendance_percentage=68.5,
                internal_test_marks=54.0,
                assignment_score=62.0,
                quiz_score=58.0,
                prev_semester_gpa=6.4
            )
            db.add(assess)
            db.flush()

            # Generate initial prediction
            features = {
                "attendance_percentage": assess.attendance_percentage,
                "internal_test_marks": assess.internal_test_marks,
                "assignment_score": assess.assignment_score,
                "quiz_score": assess.quiz_score,
                "prev_semester_gpa": assess.prev_semester_gpa
            }
            pred = ml_engine.predict(features)
            xai = compute_xai_and_recommendations(features, pred["risk_tier"], pred["feature_importances"])

            pred_record = PredictionRecord(
                student_id=demo_student.id,
                risk_tier=pred["risk_tier"],
                confidence_score=pred["confidence_score"],
                top_negative_factors=xai["top_negative_factors"],
                actionable_recommendations=xai["actionable_recommendations"],
                model_version=pred["model_version"]
            )
            db.add(pred_record)
            print("[InitDB] Created default Student user: student@sapp.edu / Student@123")

        # 4. Check if student population exists; if < 10, seed from synthetic dataset
        student_count = db.query(Student).count()
        if student_count < 10:
            print("[InitDB] Populating initial cohort of students from synthetic dataset...")
            dataset_path = os.path.abspath(
                os.path.join(os.path.dirname(__file__), "..", "..", "ml", "artifacts", "student_academic_records.csv")
            )
            if os.path.exists(dataset_path):
                with open(dataset_path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    records_to_seed = []
                    for row in reader:
                        records_to_seed.append(row)
                        if len(records_to_seed) >= 50:  # seed first 50 records
                            break

                for r in records_to_seed:
                    roll = r["roll_number"].strip()
                    if db.query(Student).filter(Student.roll_number == roll).first():
                        continue

                    s = Student(
                        roll_number=roll,
                        name=r["student_name"].strip(),
                        department=r["department"].strip(),
                        current_semester=int(r["semester"])
                    )
                    db.add(s)
                    db.flush()

                    a = Assessment(
                        student_id=s.id,
                        semester=int(r["semester"]),
                        attendance_percentage=float(r["attendance_percentage"]),
                        internal_test_marks=float(r["internal_test_marks"]),
                        assignment_score=float(r["assignment_score"]),
                        quiz_score=float(r["quiz_score"]),
                        prev_semester_gpa=float(r["prev_semester_gpa"])
                    )
                    db.add(a)
                    db.flush()

                    feats = {
                        "attendance_percentage": a.attendance_percentage,
                        "internal_test_marks": a.internal_test_marks,
                        "assignment_score": a.assignment_score,
                        "quiz_score": a.quiz_score,
                        "prev_semester_gpa": a.prev_semester_gpa
                    }
                    pred_res = ml_engine.predict(feats)
                    xai_res = compute_xai_and_recommendations(feats, pred_res["risk_tier"], pred_res["feature_importances"])

                    pr = PredictionRecord(
                        student_id=s.id,
                        risk_tier=pred_res["risk_tier"],
                        confidence_score=pred_res["confidence_score"],
                        top_negative_factors=xai_res["top_negative_factors"],
                        actionable_recommendations=xai_res["actionable_recommendations"],
                        model_version=pred_res["model_version"]
                    )
                    db.add(pr)

                print(f"[InitDB] Seeded 50 students with live assessments and ML predictions.")

        db.commit()
        print("[InitDB] Database initialization completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"[InitDB] Error initializing database: {e}")
        raise
    finally:
        if close_session_at_end:
            db.close()


if __name__ == "__main__":
    init_db()

