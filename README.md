# Student Academic Performance Prediction System (SAPPS)

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18%2B%20%2F%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)

**SAPPS (Student Academic Performance Prediction System)** is a modular, production-ready full-stack machine learning web application engineered for educational institutions. It provides early academic risk detection, multi-model benchmarking, Explainable AI (XAI) feature attribution, and prescriptive pedagogical interventions.

---

## 1. Technology Stack

- **Frontend**:
  - React 18+ / 19 with Vite
  - Tailwind CSS with modern responsive design
  - Lucide React icons
  - Recharts for data visualizations (Scatter, Donut, Multi-line, Horizontal Bar)
  - Axios with JWT token interceptors
  - React Router DOM v7 for role-based route guarding
- **Backend**:
  - Python 3.11+
  - FastAPI with async lifespan management
  - Pydantic v2 & Pydantic-Settings
  - SQLAlchemy 2.0 ORM (PostgreSQL ready with SQLite fallback)
  - Uvicorn ASGI Server
  - JWT Authentication via `python-jose` and password hashing via `passlib` / `bcrypt`
- **Machine Learning**:
  - Scikit-Learn (Logistic Regression, Decision Tree, Random Forest)
  - Pandas & NumPy for matrix operations and synthetic generation
  - Joblib for model artifact serialization
  - Zero Data Leakage architecture (strictly in-course indicators)

---

## 2. Architecture & File Structure

```text
Gradix/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                      # RBAC & OAuth2 token validation
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py              # Login, token issuance, user profile
│   │   │       │   ├── students.py          # Student directory & personal profile
│   │   │       │   ├── assessments.py       # Single & batch CSV ingestion
│   │   │       │   ├── predictions.py       # Real-time inference & XAI endpoints
│   │   │       │   └── analytics.py         # Cohort metrics, scatter data, trends
│   │   │       └── router.py                # Aggregated API v1 router
│   │   ├── core/
│   │   │   ├── config.py                    # Environment & application settings
│   │   │   └── security.py                  # Bcrypt hashing & JWT signing/decoding
│   │   ├── db/
│   │   │   ├── base.py                      # Metadata aggregator for ORM models
│   │   │   ├── session.py                   # Engine & scoped sessionmaker
│   │   │   └── init_db.py                   # Auto-migration & seed data loader
│   │   ├── models/
│   │   │   ├── user.py                      # User model with role enumeration
│   │   │   ├── student.py                   # Student & Faculty profiles
│   │   │   ├── academic.py                  # Assessment examination records
│   │   │   └── prediction.py                # Inference history & XAI attributions
│   │   ├── schemas/
│   │   │   ├── student.py                   # Pydantic schemas for auth & students
│   │   │   ├── assessment.py                # Pydantic schemas for assessments
│   │   │   └── prediction.py                # XAI, inference, and analytics schemas
│   │   ├── services/
│   │   │   ├── ml_engine.py                 # Joblib model loader & inference engine
│   │   │   └── xai_explainer.py             # Feature attribution & recommendations
│   │   └── main.py                          # FastAPI application factory
│   ├── ml/
│   │   ├── synthetic_data_generator.py      # 1,500 realistic records (zero leakage)
│   │   ├── train_models.py                  # 3-model benchmark & artifact persistence
│   │   └── artifacts/
│   │       ├── rf_student_predictor.joblib  # Serialized best Random Forest model
│   │       └── student_academic_records.csv # Generated dataset
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx                   # Global navbar, role badge, footer
│   │   │   ├── ProtectedRoute.jsx           # Role-based route guard
│   │   │   ├── RiskBadge.jsx                # Color-coded risk status pill
│   │   │   └── FeatureImportanceChart.jsx   # XAI horizontal bar chart & breakdown
│   │   ├── pages/
│   │   │   ├── Login.jsx                    # 1-click demo logins & JWT auth
│   │   │   ├── AdminDashboard.jsx           # Scatter plot, Donut, Trend lines
│   │   │   ├── FacultyDashboard.jsx         # Searchable roster, 1-click predict, modal
│   │   │   ├── StudentDashboard.jsx         # Personal academic card & interventions
│   │   │   └── BatchUpload.jsx              # CSV dropzone, live preview, bulk upload
│   │   ├── services/
│   │   │   └── api.js                       # Axios client with JWT interceptor
│   │   ├── App.jsx                          # Route provider
│   │   ├── index.css                        # Tailwind CSS styles
│   │   └── main.jsx                         # React entrypoint
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── run_backend.bat                          # 1-click Windows startup for backend
├── run_frontend.bat                         # 1-click Windows startup for frontend
└── README.md
```

---

## 3. Database Schema (SQLAlchemy 2.0 Models)

| Model | Table | Fields | Relationships |
|---|---|---|---|
| **User** | `users` | `id` (UUID), `email` (unique), `hashed_password`, `role` (`ADMIN`, `FACULTY`, `STUDENT`), `created_at` | 1-to-1 `Student`, 1-to-1 `Faculty` |
| **Student** | `students` | `id` (UUID), `user_id` (FK), `roll_number` (unique), `name`, `department`, `current_semester` | Belongs to `User`, 1-to-N `Assessment`, 1-to-N `PredictionRecord` |
| **Faculty** | `faculty` | `id` (UUID), `user_id` (FK), `name`, `department` | Belongs to `User` |
| **Assessment** | `assessments` | `id` (UUID), `student_id` (FK), `semester`, `attendance_percentage`, `internal_test_marks`, `assignment_score`, `quiz_score`, `prev_semester_gpa`, `created_at` | Belongs to `Student` |
| **PredictionRecord** | `prediction_records` | `id` (UUID), `student_id` (FK), `risk_tier`, `confidence_score`, `top_negative_factors` (JSON), `actionable_recommendations` (JSON), `model_version`, `created_at` | Belongs to `Student` |

---

## 4. Machine Learning Pipeline & Benchmark Results

The pipeline generates 1,500 synthetic records with realistic multimodal distributions representing three student engagement clusters: Struggling, Borderline, and High-Performing. Features are strictly bounded to prevent data leakage (no final exam marks in feature sets).

### Benchmark Comparison (Test Split = 300 records)

| Model Algorithm | Accuracy | Macro Precision | Macro F1 | High-Risk Recall |
|---|---|---|---|---|
| **Logistic Regression (Baseline)** | 90.67% | 90.24% | 90.71% | **95.45%** |
| **Decision Tree Classifier** | 93.33% | 93.72% | 93.17% | 89.39% |
| **Random Forest Classifier (Optimized)** | **95.67%** | **95.85%** | **95.62%** | **93.94%** |

*Note: While Logistic Regression achieved strong recall, the Optimized Random Forest achieved the highest overall macro F1 score (95.62%), precision (95.85%), and robust non-linear boundaries. It was saved as the primary estimator.*

### Random Forest Feature Importances

```text
• attendance_percentage : 33.70%
• internal_test_marks   : 32.59%
• prev_semester_gpa     : 13.36%
• assignment_score      : 13.01%
• quiz_score            :  7.34%
```

---

## 5. Explainable AI (XAI) & Recommendation Engine

When a prediction is requested, the system computes feature-level attributions and weights against institutional benchmarks:
- **Attendance**: Standard threshold **75%** (Critical deficit: &lt;65%)
- **Internal Test Marks**: Standard threshold **50 / 100** (Critical deficit: &lt;40)
- **Assignment Score**: Standard threshold **60 / 100**
- **Quiz Performance**: Standard threshold **60 / 100**
- **Previous GPA**: Standard threshold **6.0 / 10.0**

### Sample Generated Attributions & Interventions
- **Attribution**: *"Attendance is critically low at 62.0% (below mandatory threshold of 75.0%), contributing 41.2% toward the High Risk classification."*
- **Action Plan**:
  1. *"Issue immediate Attendance Warning (currently 62.0%) and schedule mandatory counseling with Academic Advisor to resolve transportation or personal barriers."*
  2. *"Schedule mandatory faculty doubt-clearing sessions and enroll student in structured midterm remedial tutorials."*
  3. *"Assign TA-monitored lab practice hours and permit a submission window for re-worked assignment modules."*

---

## 6. Pre-seeded Demo Accounts

The application automatically seeds three role accounts upon database initialization. The Login page includes **1-Click Demo Fill buttons**:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Faculty** | `faculty@sapp.edu` | `Faculty@123` | Student roster, 1-click real-time ML inference, XAI modal, CSV batch upload |
| **Admin** | `admin@sapp.edu` | `Admin@123` | Institutional analytics, scatter plot, risk donut chart, semester trend lines |
| **Student** | `student@sapp.edu` | `Student@123` | Personal academic scorecard, standing badge, personalized guidance plan |

---

## 7. Quickstart & Installation Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Step 1: Clone Repository & Setup Backend
```bash
# Clone the repository
cd c:\code\Gradix

# Install Python requirements
pip install -r backend/requirements.txt
```

### Step 2: Generate Synthetic Data & Train ML Models
```bash
# Train baseline models, benchmark algorithms, and serialize Random Forest artifact
python backend/ml/train_models.py
```
*Output: Saves artifact to `backend/ml/artifacts/rf_student_predictor.joblib`.*

### Step 3: Initialize Database & Seed Cohort Data
```bash
# Creates SQLite tables and seeds Admin, Faculty, Student, and 50 student records
set PYTHONPATH=backend
python backend/app/db/init_db.py
```

### Step 4: Setup & Run Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
The frontend starts at `http://localhost:5173`.

### Step 5: Run Backend API Server
In a separate terminal:
```bash
set PYTHONPATH=backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI / Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### Convenience Windows Batch Scripts
- Double-click `run_backend.bat` to start the FastAPI server.
- Double-click `run_frontend.bat` to launch the Vite development server.

---

## 8. API Endpoints Reference (`/api/v1`)

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticates user; returns signed JWT with claims |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieves current authenticated profile |
| `GET` | `/api/v1/students` | Admin / Faculty | Searchable & filterable directory with live risk tiers |
| `POST` | `/api/v1/students` | Admin / Faculty | Register new student profile |
| `GET` | `/api/v1/students/me/profile` | Student | Personal academic dashboard data & history |
| `GET` | `/api/v1/students/{id}` | Authenticated | Detailed student record with assessment history |
| `POST` | `/api/v1/assessments` | Admin / Faculty | Add single academic assessment |
| `POST` | `/api/v1/assessments/batch-csv` | Admin / Faculty | Bulk CSV ingestion with schema validation & auto-inference |
| `POST` | `/api/v1/predictions/evaluate/{student_id}` | Admin / Faculty | Evaluates student against ML model, returns XAI breakdown |
| `GET` | `/api/v1/predictions/student/{student_id}` | Authenticated | Historical prediction timeline for student |
| `GET` | `/api/v1/analytics/dashboard-summary` | Admin / Faculty | Macro analytics, risk donut, scatter plot, and trend lines |

---

## 9. License & Attribution
Developed for educational institutional research and early academic performance intervention. Built with FastAPI, React, and Scikit-Learn.

