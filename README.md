# 💪 MN Fitness – Health & Fitness Web Application

**Client:** Naved Shaikh | **Company:** MN Fitness

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- MySQL 8.0+

### Step 1 – Database Setup
Open MySQL and run:
```sql
CREATE DATABASE IF NOT EXISTS mn_fitness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Or run the provided script: `setup_database.sql`

### Step 2 – Configure Environment
Edit `backend/.env`:
```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/mn_fitness
```

### Step 3 – Install & Run
Double-click **`install.bat`** (first time only), then **`start.bat`**

Or manually:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 4 – Open the App
- **Frontend:** http://localhost:8000
- **API Docs:** http://localhost:8000/api/docs

---

## 🔑 Default Accounts

| Role    | Username   | Password     |
|---------|------------|--------------|
| Admin   | `admin`    | `admin123`   |
| Trainer | `trainer1` | `trainer123` |

---

## 📁 Project Structure

```
Project/
├── backend/
│   ├── app/
│   │   ├── routers/        # API route handlers
│   │   │   ├── auth.py     # Login / Register
│   │   │   ├── workout.py  # Workout plans & logs
│   │   │   ├── diet.py     # Diet plans & logs
│   │   │   ├── progress.py # Progress tracking
│   │   │   ├── trainer.py  # Trainer plan assignment
│   │   │   ├── articles.py # Health articles
│   │   │   ├── feedback.py # User feedback
│   │   │   └── admin.py    # Admin management
│   │   ├── models.py       # SQLAlchemy DB models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # JWT authentication
│   │   ├── database.py     # DB connection
│   │   ├── config.py       # App settings
│   │   └── seed_data.py    # Default data seeder
│   ├── main.py             # FastAPI app entry point
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── index.html          # Home page
│   ├── login.html          # Login page
│   ├── register.html       # Registration (3-step)
│   ├── dashboard.html      # User dashboard
│   ├── admin.html          # Admin panel
│   └── assets/
│       ├── css/            # Stylesheets
│       └── js/             # JavaScript modules
├── setup_database.sql
├── install.bat
├── start.bat
└── README.md
```

---

## ✨ Features

| Module | Features |
|--------|----------|
| **Auth** | JWT login/register, password hashing, role-based access |
| **Dashboard** | Overview stats, charts, recent activity |
| **Workouts** | 6 predefined plans (beginner→advanced), workout logging, history |
| **Diet** | 5 diet plans per goal, meal logging, macro tracking |
| **Progress** | Weight tracking, BMI calculation, progress charts |
| **Nutrition** | Macro breakdown, daily totals, doughnut chart |
| **Articles** | 6 health articles, search, category filter |
| **Trainer Plans** | Trainers assign custom plans to users |
| **Admin Panel** | User management, role promotion, feedback resolution |
| **Feedback** | Star rating, submit/view feedback |

---

## 🎯 Goals Supported
- 🔥 **Weight Loss** – Cardio plans + calorie deficit diets
- 💪 **Weight Gain** – Strength plans + calorie surplus diets  
- 🏆 **Bodybuilding** – Split training + precision nutrition

---

## 🛠 Tech Stack
- **Backend:** Python FastAPI + SQLAlchemy + MySQL
- **Auth:** JWT (python-jose) + bcrypt (passlib)
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Charts:** Chart.js 4.4
- **Icons:** Font Awesome 6.5
