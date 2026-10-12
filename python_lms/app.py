"""
================================================================================
CLARITY LMS - Production-Ready 5-Page Flask & PostgreSQL Application
================================================================================
File: app.py
Description: Main application entry point containing PostgreSQL configuration,
             SQLAlchemy database models (User, Course, Module, Lesson,
             Enrollment, LessonProgress, Quiz, QuizQuestion, QuizResult, Certificate),
             HTML5 Jinja2 route handlers for all 5 core pages, and AJAX REST APIs.

Database Connection:
  PostgreSQL URI: postgresql://username:password@localhost:5432/lms_db
  Fallback: SQLite (sqlite:///clarity_lms.db) if DATABASE_URL is not provided.

Run Command:
  python app.py
================================================================================
"""

import os
import json
import uuid
from datetime import datetime
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    redirect,
    url_for,
    session,
    flash
)
from flask_sqlalchemy import SQLAlchemy

# ------------------------------------------------------------------------------
# 1. APPLICATION & POSTGRESQL DATABASE CONFIGURATION
# ------------------------------------------------------------------------------

app = Flask(__name__)

# Application Secret Key for Sessions & Flash Messages
app.config['SECRET_KEY'] = os.environ.get(
    'SECRET_KEY', 
    'clarity-lms-super-production-secret-key-2026'
)

# PostgreSQL Connection String format: postgresql://username:password@localhost:5432/lms_db
# In SQLAlchemy 2.0+, psycopg2 is the standard driver.
raw_db_url = os.environ.get(
    'DATABASE_URL', 
    'postgresql://postgres:postgres@localhost:5432/lms_db'
)

# Handle platform-specific prefixes (e.g. postgres:// -> postgresql+psycopg2://)
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+psycopg2://"):
    raw_db_url = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = raw_db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True,
}

db = SQLAlchemy(app)

# ------------------------------------------------------------------------------
# 2. SQLALCHEMY DATABASE MODELS
# ------------------------------------------------------------------------------

class User(db.Model):
    """Registered students, instructors, and system administrators."""
    __tablename__ = 'users'

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), default='student')  # 'student', 'instructor', 'admin'
    avatar = db.Column(db.String(255), nullable=True)
    title = db.Column(db.String(150), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    enrollments = db.relationship('Enrollment', backref='user', lazy=True, cascade='all, delete-orphan')
    lesson_progresses = db.relationship('LessonProgress', backref='user', lazy=True, cascade='all, delete-orphan')
    quiz_results = db.relationship('QuizResult', backref='user', lazy=True, cascade='all, delete-orphan')
    certificates = db.relationship('Certificate', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"


class Course(db.Model):
    """Course catalog listing with curriculum metadata."""
    __tablename__ = 'courses'

    id = db.Column(db.String(50), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    badge = db.Column(db.String(50), default='Masterclass')
    rating = db.Column(db.Float, default=4.95)
    review_count = db.Column(db.Integer, default=0)
    category = db.Column(db.String(100), default='System Architecture')
    price = db.Column(db.Float, default=94.00)
    original_price = db.Column(db.Float, default=149.00)
    short_description = db.Column(db.Text, nullable=False)
    full_description = db.Column(db.Text, nullable=True)
    thumbnail = db.Column(db.String(255), nullable=True)
    preview_video_url = db.Column(db.String(255), nullable=True)
    preview_duration = db.Column(db.String(20), default='3m 45s')
    instructor_name = db.Column(db.String(100), default='Dr. Sarah Chen')
    instructor_bio = db.Column(db.Text, nullable=True)
    instructor_avatar = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    modules = db.relationship('Module', backref='course', cascade='all, delete-orphan', lazy=True, order_by='Module.module_number')
    quizzes = db.relationship('Quiz', backref='course', cascade='all, delete-orphan', lazy=True)
    enrollments = db.relationship('Enrollment', backref='course', cascade='all, delete-orphan', lazy=True)
    certificates = db.relationship('Certificate', backref='course', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f"<Course {self.title}>"


class Module(db.Model):
    """Course curriculum module grouping multiple lessons."""
    __tablename__ = 'modules'

    id = db.Column(db.String(50), primary_key=True)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    module_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    badge = db.Column(db.String(50), nullable=True)
    duration = db.Column(db.String(50), nullable=True)

    # Relationships
    lessons = db.relationship('Lesson', backref='module', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f"<Module {self.module_number}: {self.title}>"


class Lesson(db.Model):
    """Individual learning unit with video player stream and downloadable PDF."""
    __tablename__ = 'lessons'

    id = db.Column(db.String(50), primary_key=True)
    module_id = db.Column(db.String(50), db.ForeignKey('modules.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255), nullable=True)
    duration = db.Column(db.String(50), nullable=True)
    lesson_type = db.Column(db.String(20), default='lecture')  # 'lecture', 'lab', 'quiz'
    video_url = db.Column(db.String(255), nullable=True)
    is_free_preview = db.Column(db.Boolean, default=False)
    is_locked = db.Column(db.Boolean, default=False)
    pdf_url = db.Column(db.String(255), nullable=True)
    pdf_title = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)

    # Relationships
    progress_entries = db.relationship('LessonProgress', backref='lesson', cascade='all, delete-orphan', lazy=True)

    def __repr__(self):
        return f"<Lesson {self.title}>"


class Enrollment(db.Model):
    """Student course enrollment record."""
    __tablename__ = 'enrollments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'course_id', name='uq_user_course_enrollment'),
    )


class LessonProgress(db.Model):
    """Tracks whether a student has completed a specific lesson."""
    __tablename__ = 'lesson_progress'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    lesson_id = db.Column(db.String(50), db.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False)
    completed = db.Column(db.Boolean, default=True)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'lesson_id', name='uq_user_lesson_progress'),
    )


class Quiz(db.Model):
    """Assessment quiz associated with a course."""
    __tablename__ = 'quizzes'

    id = db.Column(db.String(50), primary_key=True)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    passing_score = db.Column(db.Integer, default=80)

    # Relationships
    questions = db.relationship('QuizQuestion', backref='quiz', cascade='all, delete-orphan', lazy=True, order_by='QuizQuestion.id')
    results = db.relationship('QuizResult', backref='quiz', cascade='all, delete-orphan', lazy=True)


class QuizQuestion(db.Model):
    """Multiple choice question with JSON serialized options."""
    __tablename__ = 'quiz_questions'

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.String(50), db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    options_json = db.Column(db.Text, nullable=False)  # JSON string: [{"id": "a", "text": "..."}]
    correct_option_id = db.Column(db.String(10), nullable=False)

    def get_options(self):
        """Parses options_json safely into a Python list of dicts."""
        try:
            return json.loads(self.options_json)
        except Exception:
            return []


class QuizResult(db.Model):
    """Student submission score record for a quiz."""
    __tablename__ = 'quiz_results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    quiz_id = db.Column(db.String(50), db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    passed = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)


class Certificate(db.Model):
    """Accredited completion certificate issued upon passing score."""
    __tablename__ = 'certificates'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    certificate_code = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    instructor_signature = db.Column(db.String(100), default='Dr. Sarah Chen')


# ------------------------------------------------------------------------------
# 3. REQUEST HOOKS & CURRENT USER HELPERS
# ------------------------------------------------------------------------------

@app.before_request
def load_current_user():
    """Attaches current active user to the request context."""
    user_id = session.get('user_id')
    if user_id:
        request.current_user = User.query.get(user_id)
    else:
        # Turnkey development default: Student 'Alex Morgan'
        default_user = User.query.filter_by(email='alex.morgan@systems.eng').first()
        request.current_user = default_user

@app.context_processor
def inject_global_template_vars():
    """Injects user object into all Jinja2 templates."""
    return {
        'current_user': getattr(request, 'current_user', None),
        'now': datetime.utcnow()
    }


# ------------------------------------------------------------------------------
# 4. PAGE ROUTES (THE 5 CORE PAGES)
# ------------------------------------------------------------------------------

# --- PAGE 1: Home & Course Catalog Page ---
@app.route('/')
def home():
    """
    Page 1: Home & Course Catalog
    Features: Hero banner, course search query, category filters, and card grid.
    """
    search_query = request.args.get('q', '').strip()
    category = request.args.get('category', 'All Categories')

    query = Course.query
    if search_query:
        query = query.filter(Course.title.ilike(f'%{search_query}%'))
    if category and category != 'All Categories':
        query = query.filter_by(category=category)

    courses = query.order_by(Course.created_at.desc()).all()
    categories = ['All Categories', 'System Architecture', 'Event-Driven Systems', 'Cloud Networking']

    current_user = getattr(request, 'current_user', None)
    enrolled_ids = []
    if current_user:
        enrolled_ids = [e.course_id for e in current_user.enrollments]

    return render_template(
        'index.html',
        courses=courses,
        categories=categories,
        selected_category=category,
        search_query=search_query,
        enrolled_ids=enrolled_ids
    )


# --- PAGE 2: Course Details & Enrollment Page ---
@app.route('/courses/<course_id>')
def course_detail(course_id):
    """
    Page 2: Course Details & Enrollment Page
    Features: Syllabus accordion, instructor bio, outcomes, and 'Enroll Now' button.
    """
    course = Course.query.get_or_404(course_id)
    current_user = getattr(request, 'current_user', None)

    is_enrolled = False
    if current_user:
        is_enrolled = Enrollment.query.filter_by(
            user_id=current_user.id, 
            course_id=course.id
        ).first() is not None

    # Get first lesson ID for quick resume
    first_lesson_id = None
    if course.modules and course.modules[0].lessons:
        first_lesson_id = course.modules[0].lessons[0].id

    return render_template(
        'course_detail.html',
        course=course,
        is_enrolled=is_enrolled,
        first_lesson_id=first_lesson_id
    )


# --- PAGE 3: Student Video Learning Page ---
@app.route('/courses/<course_id>/learn/<lesson_id>')
def learn(course_id, lesson_id):
    """
    Page 3: Student Video Learning Page
    Features: Left sidebar lesson checklist, right HTML5 video player,
              downloadable PDF resource links, and AJAX progress tracking.
    """
    course = Course.query.get_or_404(course_id)
    lesson = Lesson.query.get_or_404(lesson_id)
    current_user = getattr(request, 'current_user', None)

    # Gather completed lesson IDs for current user
    completed_lesson_ids = []
    if current_user:
        progress_entries = LessonProgress.query.filter_by(
            user_id=current_user.id, 
            completed=True
        ).all()
        completed_lesson_ids = [p.lesson_id for p in progress_entries]

    # Calculate overall course completion %
    all_lessons = [les for mod in course.modules for les in mod.lessons]
    total_count = len(all_lessons)
    completed_count = sum(1 for les in all_lessons if les.id in completed_lesson_ids)
    progress_percentage = int((completed_count / total_count) * 100) if total_count > 0 else 0

    return render_template(
        'learn.html',
        course=course,
        active_lesson=lesson,
        completed_lesson_ids=completed_lesson_ids,
        progress_percentage=progress_percentage
    )


# --- PAGE 4: Interactive MCQ Quiz & Certificate Page ---
@app.route('/courses/<course_id>/quiz')
def quiz(course_id):
    """
    Page 4: Interactive MCQ Quiz & Certificate Page
    Features: Multi-question MCQ assessment, backend score evaluation,
              and dynamic 'Download Certificate' modal unlocking upon >=80%.
    """
    course = Course.query.get_or_404(course_id)
    quiz_obj = Quiz.query.filter_by(course_id=course_id).first()
    current_user = getattr(request, 'current_user', None)

    user_result = None
    certificate = None
    if current_user and quiz_obj:
        user_result = QuizResult.query.filter_by(
            user_id=current_user.id, 
            quiz_id=quiz_obj.id
        ).order_by(QuizResult.submitted_at.desc()).first()

        certificate = Certificate.query.filter_by(
            user_id=current_user.id, 
            course_id=course.id
        ).first()

    return render_template(
        'quiz.html',
        course=course,
        quiz=quiz_obj,
        user_result=user_result,
        certificate=certificate
    )


# --- PAGE 5: Admin & Instructor Dashboard ---
@app.route('/admin')
def admin_dashboard():
    """
    Page 5: Admin & Instructor Dashboard
    Features: Tab 1 - Add New Course / Video URL / PDF Material,
              Tab 2 - Registered Students Progress Table & Analytics.
    """
    courses = Course.query.order_by(Course.created_at.desc()).all()
    students = User.query.filter_by(role='student').all()

    # Build student roster with detailed completion analytics
    students_roster = []
    for u in students:
        for enr in u.enrollments:
            c = enr.course
            all_c_lessons = [les.id for mod in c.modules for les in mod.lessons]
            completed = LessonProgress.query.filter(
                LessonProgress.user_id == u.id,
                LessonProgress.lesson_id.in_(all_c_lessons),
                LessonProgress.completed == True
            ).count() if all_c_lessons else 0
            total = len(all_c_lessons)
            pct = int((completed / total) * 100) if total > 0 else 0

            q_obj = Quiz.query.filter_by(course_id=c.id).first()
            q_res = QuizResult.query.filter_by(
                user_id=u.id, 
                quiz_id=q_obj.id
            ).order_by(QuizResult.submitted_at.desc()).first() if q_obj else None

            cert = Certificate.query.filter_by(user_id=u.id, course_id=c.id).first()

            students_roster.append({
                'user': u,
                'course': c,
                'completed_count': completed,
                'total_count': total,
                'progress_percentage': pct,
                'quiz_result': q_res,
                'certificate': cert
            })

    return render_template(
        'admin_dashboard.html',
        courses=courses,
        students_roster=students_roster,
        total_students=len(students),
        total_courses=len(courses)
    )


# ------------------------------------------------------------------------------
# 5. ACTION & AJAX REST API ENDPOINTS
# ------------------------------------------------------------------------------

@app.route('/enroll/<course_id>', methods=['POST'])
def enroll(course_id):
    """Handles course enrollment action."""
    current_user = getattr(request, 'current_user', None)
    if not current_user:
        flash('Please sign in to enroll in this course.', 'warning')
        return redirect(url_for('home'))

    existing = Enrollment.query.filter_by(
        user_id=current_user.id, 
        course_id=course_id
    ).first()

    if not existing:
        new_enr = Enrollment(user_id=current_user.id, course_id=course_id)
        db.session.add(new_enr)
        db.session.commit()
        flash('Successfully enrolled! Welcome to the masterclass.', 'success')

    # If requested via AJAX/fetch
    if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True, 'message': 'Enrolled successfully', 'course_id': course_id})

    return redirect(url_for('course_detail', course_id=course_id))


@app.route('/lessons/<lesson_id>/toggle-complete', methods=['POST'])
def toggle_lesson_complete(lesson_id):
    """AJAX endpoint for toggling lesson completion checklist in student player."""
    current_user = getattr(request, 'current_user', None)
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 401

    progress = LessonProgress.query.filter_by(
        user_id=current_user.id, 
        lesson_id=lesson_id
    ).first()

    if progress:
        progress.completed = not progress.completed
        is_completed = progress.completed
    else:
        progress = LessonProgress(user_id=current_user.id, lesson_id=lesson_id, completed=True)
        db.session.add(progress)
        is_completed = True

    db.session.commit()
    return jsonify({'success': True, 'completed': is_completed, 'lesson_id': lesson_id})


@app.route('/quiz/<quiz_id>/submit', methods=['POST'])
def submit_quiz(quiz_id):
    """
    Evaluates MCQ answers, calculates score %, records QuizResult,
    and dynamically creates accredited Certificate if score >= 80%.
    """
    quiz_obj = Quiz.query.get_or_404(quiz_id)
    current_user = getattr(request, 'current_user', None)
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    user_answers = data.get('answers', {})

    total_q = len(quiz_obj.questions)
    if total_q == 0:
        return jsonify({'error': 'Quiz contains no questions'}), 400

    correct_count = 0
    for q in quiz_obj.questions:
        ans = user_answers.get(str(q.id))
        if ans == q.correct_option_id:
            correct_count += 1

    score = int((correct_count / total_q) * 100)
    passed = score >= quiz_obj.passing_score

    # Save Quiz Result
    result = QuizResult(
        user_id=current_user.id,
        quiz_id=quiz_obj.id,
        score=score,
        passed=passed
    )
    db.session.add(result)

    # Issue Certificate if passed
    cert_code = None
    if passed:
        existing_cert = Certificate.query.filter_by(
            user_id=current_user.id, 
            course_id=quiz_obj.course_id
        ).first()

        if not existing_cert:
            cert_code = f"CL-{uuid.uuid4().hex[:8].upper()}-ARCH"
            cert = Certificate(
                certificate_code=cert_code,
                user_id=current_user.id,
                course_id=quiz_obj.course_id
            )
            db.session.add(cert)
        else:
            cert_code = existing_cert.certificate_code

    db.session.commit()

    return jsonify({
        'success': True,
        'score': score,
        'passed': passed,
        'certificate_code': cert_code,
        'passing_score': quiz_obj.passing_score
    })


@app.route('/admin/course/create', methods=['POST'])
def create_course():
    """Tab 1 form submission: Publishes new course, module, video URL & PDF material."""
    title = request.form.get('title', '').strip()
    category = request.form.get('category', 'System Architecture')
    price = float(request.form.get('price', 94.00))
    description = request.form.get('description', '').strip()
    video_url = request.form.get('video_url', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
    pdf_material = request.form.get('pdf_material', 'Lecture Slides & Architecture Blueprint.pdf')

    if not title:
        flash('Course title is required.', 'danger')
        return redirect(url_for('admin_dashboard'))

    course_id = f"course-{uuid.uuid4().hex[:6]}"
    new_course = Course(
        id=course_id,
        title=title,
        category=category,
        price=price,
        original_price=price * 1.5,
        short_description=description[:180],
        full_description=description,
        thumbnail='https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        instructor_name='Dr. Sarah Chen'
    )
    db.session.add(new_course)

    # Scaffold initial module and lesson with video & PDF
    mod_id = f"mod-{uuid.uuid4().hex[:6]}"
    mod = Module(
        id=mod_id,
        course_id=course_id,
        module_number=1,
        title='Foundations & Core Principles',
        duration='45m'
    )
    db.session.add(mod)

    les_id = f"les-{uuid.uuid4().hex[:6]}"
    les = Lesson(
        id=les_id,
        module_id=mod_id,
        title=f"Introduction to {title}",
        subtitle='Core lecture & architectural invariants',
        duration='18m',
        video_url=video_url,
        pdf_title=pdf_material,
        pdf_url='#',
        notes='Welcome to the course. Review the video lecture and study the downloadable PDF.'
    )
    db.session.add(les)

    # Scaffold initial assessment quiz
    q_id = f"quiz-{uuid.uuid4().hex[:6]}"
    q = Quiz(
        id=q_id,
        course_id=course_id,
        title=f"{title} Validation Assessment",
        passing_score=80
    )
    db.session.add(q)

    # Sample Question
    qq = QuizQuestion(
        id=int(uuid.uuid4().int % 1000000),
        quiz_id=q_id,
        question_text='Which property defines an idempotent distributed operation?',
        options_json=json.dumps([
            {'id': 'a', 'text': 'Executing the request multiple times produces the identical outcome as once.'},
            {'id': 'b', 'text': 'The request requires a two-phase locking commit across all clusters.'},
            {'id': 'c', 'text': 'The payload is encrypted with asymmetric TLS 1.3 certificates.'},
            {'id': 'd', 'text': 'Network timeout thresholds are reduced to less than 50 milliseconds.'}
        ]),
        correct_option_id='a'
    )
    db.session.add(qq)

    db.session.commit()
    flash(f"Course '{title}' published successfully with video lecture and PDF resources!", 'success')
    return redirect(url_for('admin_dashboard'))


# ------------------------------------------------------------------------------
# 6. SEED DATABASE FUNCTION
# ------------------------------------------------------------------------------

def seed_database():
    """Populates the database with default users, courses, modules, and quiz questions."""
    # 1. Users
    student = User(
        id='usr-student-01',
        name='Alex Morgan',
        email='alex.morgan@systems.eng',
        role='student',
        avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        title='Senior Backend Engineer'
    )
    instructor = User(
        id='usr-instructor-01',
        name='Dr. Sarah Chen',
        email='sarah.chen@clarity.edu',
        role='instructor',
        avatar='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        title='Staff Systems Architect & ex-Google Principal'
    )
    db.session.add_all([student, instructor])

    # 2. Main Course: Microservices Architecture
    c1 = Course(
        id='arch-microservices-101',
        title='Modern System Architecture & Fault-Tolerant Microservices',
        badge='Featured Masterclass',
        rating=4.95,
        review_count=1420,
        category='System Architecture',
        price=94.00,
        original_price=149.00,
        short_description='Master high-throughput event meshes, distributed consensus algorithms (Raft/Paxos), CQRS, and zero-downtime microservice orchestration.',
        full_description='This course is designed for engineers moving from monolithic applications to resilient distributed platforms operating at multi-region scale.',
        thumbnail='https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        preview_video_url='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        instructor_name='Dr. Sarah Chen',
        instructor_bio='16+ years designing distributed engines powering millions of queries per second at Google and Netflix.',
        instructor_avatar='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
    )

    # 3. Additional Courses for Catalog Grid
    c2 = Course(
        id='kafka-event-mesh-201',
        title='Kafka Event Mesh & High-Velocity Partitioning at Scale',
        badge='Advanced',
        rating=4.92,
        review_count=880,
        category='Event-Driven Systems',
        price=89.00,
        original_price=139.00,
        short_description='Scale event backbones to 100,000+ msgs/sec with idempotent consumers, schema registries, and exactly-once semantics.',
        thumbnail='https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
        instructor_name='Marcus Vance'
    )

    c3 = Course(
        id='cloud-networking-301',
        title='Cloud Networking, Envoy Proxies & Resilient Service Meshes',
        badge='Popular',
        rating=4.88,
        review_count=640,
        category='Cloud Networking',
        price=79.00,
        original_price=119.00,
        short_description='Implement mutual TLS (mTLS), circuit breaker thresholds, and real-time observability telemetry using Envoy and Istio.',
        thumbnail='https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
        instructor_name='Elena Rostova'
    )

    db.session.add_all([c1, c2, c3])

    # 4. Modules & Lessons for c1
    m1 = Module(
        id='mod-1',
        course_id=c1.id,
        module_number=1,
        title='Distributed Consensus, Invariants & The CAP Frontier',
        badge='Module 1',
        duration='2h 15m'
    )
    m2 = Module(
        id='mod-2',
        course_id=c1.id,
        module_number=2,
        title='Event Streaming, Idempotency & Saga Orchestration',
        badge='Module 2',
        duration='3h 40m'
    )
    db.session.add_all([m1, m2])

    l1_1 = Lesson(
        id='les-1-1',
        module_id=m1.id,
        title='1.1 Consensus Algorithms: Raft Leader Election & Quorums',
        subtitle='Understanding heartbeat timeouts, term indices, and vote splitting',
        duration='14m 20s',
        video_url='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        pdf_title='Raft Consensus State Machine Diagram.pdf',
        pdf_url='#',
        notes='In distributed state machines, safety requires that if any server has applied a particular log entry to its state machine, no other server may apply a different log entry for the same log index.'
    )
    l1_2 = Lesson(
        id='les-1-2',
        module_id=m1.id,
        title='1.2 Log Replication & Handling Split-Brain Scenarios',
        subtitle='Analyzing network partitions and majority quorum barriers',
        duration='18m 05s',
        video_url='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        pdf_title='Split-Brain Resolution Cheat Sheet.pdf',
        pdf_url='#',
        notes='When network partitions divide a cluster into two disjoint subnets, only the partition containing a strict majority (N/2 + 1) can commit state changes.'
    )
    l1_3 = Lesson(
        id='les-1-3',
        module_id=m1.id,
        title='1.3 Hands-on Fault Injection Lab with Toxiproxy',
        subtitle='Simulating upstream latency spikes and blackhole drops',
        duration='24m 10s',
        video_url='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        pdf_title='Toxiproxy Chaos Engineering Configuration.pdf',
        pdf_url='#',
        notes='This lab uses Toxiproxy to simulate 500ms packet delays and 15% random packet loss against gRPC downstream services.'
    )
    l2_1 = Lesson(
        id='les-2-1',
        module_id=m2.id,
        title='2.1 Distributed Transactions via Saga Orchestrators',
        subtitle='Temporal choreography vs central state-machine coordinators',
        duration='21m 45s',
        video_url='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        pdf_title='Saga Pattern Compensating Transactions Guide.pdf',
        pdf_url='#',
        notes='Two-phase commit is notoriously slow across microservice boundaries. The Saga pattern replaces distributed locks with forward steps and compensating transactions.'
    )
    db.session.add_all([l1_1, l1_2, l1_3, l2_1])

    # 5. Quiz & Assessment for c1
    q1 = Quiz(
        id='quiz-arch-101',
        course_id=c1.id,
        title='Architecture Scenario Validation & Consensus Assessment',
        passing_score=80
    )
    db.session.add(q1)

    qq1 = QuizQuestion(
        id=1,
        quiz_id=q1.id,
        question_text='In the Raft consensus protocol, what happens when a follower server receives no heartbeats from the leader before its election timer expires?',
        options_json=json.dumps([
            {'id': 'a', 'text': 'It drops all state, shuts down, and requests an operator reboot.'},
            {'id': 'b', 'text': 'It transitions to candidate state, increments its current term, votes for itself, and broadcasts RequestVote RPCs.'},
            {'id': 'c', 'text': 'It automatically promotes itself directly to leader and begins transmitting log commits.'},
            {'id': 'd', 'text': 'It queues incoming HTTP client traffic in volatile RAM until the network repairs itself.'}
        ]),
        correct_option_id='b'
    )
    qq2 = QuizQuestion(
        id=2,
        quiz_id=q1.id,
        question_text='Under the CAP Theorem, why cannot a distributed partition-tolerant system guarantee both strict Consistency (Linearizability) and 100% Availability simultaneously during a network partition?',
        options_json=json.dumps([
            {'id': 'a', 'text': 'Hardware storage disks are limited by physical SATA read/write heads.'},
            {'id': 'b', 'text': 'Nodes on the isolated side of the partition must either refuse writes (sacrificing Availability) or accept stale/divergent writes (sacrificing Consistency).'},
            {'id': 'c', 'text': 'PostgreSQL and MySQL drivers reject multi-node connection pools without SSL certificates.'},
            {'id': 'd', 'text': 'TCP checksums automatically drop payloads larger than 64 kilobytes.'}
        ]),
        correct_option_id='b'
    )
    qq3 = QuizQuestion(
        id=3,
        quiz_id=q1.id,
        question_text='What is the primary role of a Compensating Transaction in the Saga distributed transaction design pattern?',
        options_json=json.dumps([
            {'id': 'a', 'text': 'To automatically roll back already committed local transactions by semantically undoing their business effects upon downstream failure.'},
            {'id': 'b', 'text': 'To lock database rows across all microservices until an API gateway approves the invoice.'},
            {'id': 'c', 'text': 'To double the CPU allocation on Kubernetes pods during peak black Friday traffic.'},
            {'id': 'd', 'text': 'To cache static assets in Cloudflare CDN edge nodes.'}
        ]),
        correct_option_id='a'
    )
    qq4 = QuizQuestion(
        id=4,
        quiz_id=q1.id,
        question_text='Which architectural mechanism guarantees idempotent message consumption in a Kafka event consumer?',
        options_json=json.dumps([
            {'id': 'a', 'text': 'Increasing the consumer group thread pool to 128 concurrent workers.'},
            {'id': 'b', 'text': 'Storing processed message UUIDs in an atomic deduplication store or relational unique constraint before processing.'},
            {'id': 'c', 'text': 'Disabling TCP KeepAlive packets on the Kafka broker.'},
            {'id': 'd', 'text': 'Sending messages only during off-peak weekend hours.'}
        ]),
        correct_option_id='b'
    )
    qq5 = QuizQuestion(
        id=5,
        quiz_id=q1.id,
        question_text='When configuring circuit breaker patterns with Envoy Proxy, what is the purpose of the "Half-Open" state?',
        options_json=json.dumps([
            {'id': 'a', 'text': 'To immediately reject 100% of all incoming requests with HTTP 503.'},
            {'id': 'b', 'text': 'To permit a limited probe volume of requests through to test whether the downstream service has recovered.'},
            {'id': 'c', 'text': 'To enable debug log verbosity on the Linux kernel.'},
            {'id': 'd', 'text': 'To encrypt socket traffic with ephemeral Diffie-Hellman keys.'}
        ]),
        correct_option_id='b'
    )
    db.session.add_all([qq1, qq2, qq3, qq4, qq5])

    # 6. Default Student Enrollment & Progress
    enr1 = Enrollment(user_id=student.id, course_id=c1.id)
    prog1 = LessonProgress(user_id=student.id, lesson_id=l1_1.id, completed=True)
    db.session.add_all([enr1, prog1])

    db.session.commit()
    print("[CLARITY LMS] Database successfully seeded with production curriculum!")


# ------------------------------------------------------------------------------
# 7. MAIN ENTRY POINT & AUTOMATIC DATABASE INITIALIZATION
# ------------------------------------------------------------------------------

if __name__ == '__main__':
    with app.app_context():
        try:
            # Create all PostgreSQL tables
            db.create_all()
            # If courses table is empty, auto-seed initial dataset
            if not Course.query.first():
                seed_database()
        except Exception as ex:
            print(f"[CLARITY LMS] Notice: Could not connect to PostgreSQL ({ex}).")
            print("[CLARITY LMS] Falling back to local SQLite database 'sqlite:///clarity_lms.db' for instant turnkey execution.")
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///clarity_lms.db'
            db.init_app(app)
            db.create_all()
            if not Course.query.first():
                seed_database()

    port = int(os.environ.get('PORT', 5000))
    print(f"[CLARITY LMS] Server active on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
