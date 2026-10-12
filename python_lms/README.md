# Production-Ready Python Flask LMS (Learning Management System)
**Built with Python 3, Flask, PostgreSQL (Flask-SQLAlchemy + psycopg2), Jinja2, and Tailwind CSS**

A complete 5-page enterprise-grade Learning Management System with PostgreSQL persistence, student course enrollment, interactive video player with lesson checklists, automated MCQ exam scoring with accredited certificate issuance, and instructor administrative dashboard.

---

## 1. Step-by-Step PostgreSQL Setup Guide

### Step 1.1: Install PostgreSQL
- **Ubuntu/Debian Linux**:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib libpq-dev python3-dev
  sudo systemctl start postgresql
  sudo systemctl enable postgresql
  ```
- **macOS (Homebrew)**:
  ```bash
  brew install postgresql@16
  brew services start postgresql@16
  ```
- **Windows**:
  Download and run the official installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/). Keep default port `5432`.

---

### Step 1.2: Create the Database & Dedicated User

Open PostgreSQL interactive shell (`psql`):
```bash
sudo -u postgres psql
```
*(On macOS/Windows, simply run `psql postgres` or open the SQL Shell)*

Execute the following SQL statements:
```sql
-- 1. Create a dedicated application user
CREATE USER lms_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- 2. Create the database owned by the user
CREATE DATABASE lms_db OWNER lms_user;

-- 3. Grant schema privileges
GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;

-- 4. Exit psql
\q
```

---

### Step 1.3: PostgreSQL Connection String Format

Configure your connection string according to standard URI syntax:
```
postgresql://username:password@localhost:5432/lms_db
```
For explicit psycopg2 driver specification in SQLAlchemy:
```
postgresql+psycopg2://username:password@localhost:5432/lms_db
```

Set the environment variable or create a `.env` file in your project directory:
```bash
# Linux / macOS
export DATABASE_URL="postgresql://lms_user:your_secure_password@localhost:5432/lms_db"
export SECRET_KEY="lms-super-production-secret-key-2026"

# Windows (Command Prompt)
set DATABASE_URL=postgresql://lms_user:your_secure_password@localhost:5432/lms_db
set SECRET_KEY=lms-super-production-secret-key-2026

# Windows (PowerShell)
$env:DATABASE_URL="postgresql://lms_user:your_secure_password@localhost:5432/lms_db"
$env:SECRET_KEY="lms-super-production-secret-key-2026"
```

*(Note: If `DATABASE_URL` is omitted, `app.py` safely defaults to a local SQLite database for zero-config testing).*

---

## 2. Project Directory Structure

```text
python_lms/
├── app.py                      # Main entry point with PostgreSQL config, models & all routes
├── requirements.txt            # Python dependencies (Flask, SQLAlchemy, psycopg2, etc.)
├── README.md                   # Complete documentation & PostgreSQL setup guide
└── templates/                  # Jinja2 templates styled with Tailwind CSS CDN
    ├── base.html               # Master layout with top navbar, flash alerts, and footer
    ├── index.html              # 1. Home & Course Catalog (hero banner, search, category filter, grid)
    ├── course_detail.html      # 2. Course Details & Enrollment (syllabus accordion, 'Enroll Now')
    ├── learn.html              # 3. Student Video Learning (sidebar checklist, player, PDF links)
    ├── quiz.html               # 4. Interactive MCQ Quiz (score evaluation, dynamic certificate)
    └── admin_dashboard.html    # 5. Admin Panel (Tab 1: Add Course/Video/PDF, Tab 2: Student roster)
```

---

## 3. Quick Start & Execution

```bash
# 1. Navigate to project folder
cd python_lms

# 2. Create & activate Python virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the application
python app.py
```

Visit **`http://localhost:5000`** in your browser.
Upon first boot, `app.py` automatically initializes all PostgreSQL tables (`db.create_all()`) and populates sample courses, lessons, quizzes, and enrolled students.
