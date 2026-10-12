import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FileCode,
  Database,
  Terminal,
  FolderTree,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PythonCodeViewer: React.FC = () => {
  const { showToast } = useApp();
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [copied, setCopied] = useState<boolean>(false);

  const filesMap: Record<string, { lang: string; category: string; description: string; code: string }> = {
    'app.py': {
      lang: 'python',
      category: '1. Flask Backend & Models',
      description: 'Main entry point with PostgreSQL config, SQLAlchemy models (User, Course, Module, Lesson, Enrollment, LessonProgress, Quiz, QuizQuestion, QuizResult, Certificate), routes for all 5 pages, and AJAX REST APIs.',
      code: `"""
================================================================================
CLARITY LMS - Production-Ready 5-Page Flask & PostgreSQL Application
================================================================================
File: app.py
Description: Main application entry point containing PostgreSQL configuration,
             SQLAlchemy database models, HTML5 Jinja2 route handlers for all 5
             pages, and AJAX REST APIs.

PostgreSQL Connection String format:
  postgresql://username:password@localhost:5432/lms_db
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
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'clarity-lms-super-production-secret-key-2026')

# PostgreSQL Connection String format: postgresql://username:password@localhost:5432/lms_db
raw_db_url = os.environ.get(
    'DATABASE_URL', 
    'postgresql://postgres:postgres@localhost:5432/lms_db'
)

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
    __tablename__ = 'users'
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), default='student')  # 'student', 'instructor', 'admin'
    avatar = db.Column(db.String(255), nullable=True)
    title = db.Column(db.String(150), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    enrollments = db.relationship('Enrollment', backref='user', lazy=True, cascade='all, delete-orphan')
    lesson_progresses = db.relationship('LessonProgress', backref='user', lazy=True, cascade='all, delete-orphan')
    quiz_results = db.relationship('QuizResult', backref='user', lazy=True, cascade='all, delete-orphan')
    certificates = db.relationship('Certificate', backref='user', lazy=True, cascade='all, delete-orphan')


class Course(db.Model):
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

    modules = db.relationship('Module', backref='course', cascade='all, delete-orphan', lazy=True, order_by='Module.module_number')
    quizzes = db.relationship('Quiz', backref='course', cascade='all, delete-orphan', lazy=True)
    enrollments = db.relationship('Enrollment', backref='course', cascade='all, delete-orphan', lazy=True)
    certificates = db.relationship('Certificate', backref='course', cascade='all, delete-orphan', lazy=True)


class Module(db.Model):
    __tablename__ = 'modules'
    id = db.Column(db.String(50), primary_key=True)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    module_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    badge = db.Column(db.String(50), nullable=True)
    duration = db.Column(db.String(50), nullable=True)

    lessons = db.relationship('Lesson', backref='module', cascade='all, delete-orphan', lazy=True)


class Lesson(db.Model):
    __tablename__ = 'lessons'
    id = db.Column(db.String(50), primary_key=True)
    module_id = db.Column(db.String(50), db.ForeignKey('modules.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255), nullable=True)
    duration = db.Column(db.String(50), nullable=True)
    lesson_type = db.Column(db.String(20), default='lecture')
    video_url = db.Column(db.String(255), nullable=True)
    is_free_preview = db.Column(db.Boolean, default=False)
    is_locked = db.Column(db.Boolean, default=False)
    pdf_url = db.Column(db.String(255), nullable=True)
    pdf_title = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)

    progress_entries = db.relationship('LessonProgress', backref='lesson', cascade='all, delete-orphan', lazy=True)


class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'course_id', name='uq_user_course_enrollment'),)


class LessonProgress(db.Model):
    __tablename__ = 'lesson_progress'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    lesson_id = db.Column(db.String(50), db.ForeignKey('lessons.id', ondelete='CASCADE'), nullable=False)
    completed = db.Column(db.Boolean, default=True)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('user_id', 'lesson_id', name='uq_user_lesson_progress'),)


class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.String(50), primary_key=True)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    passing_score = db.Column(db.Integer, default=80)

    questions = db.relationship('QuizQuestion', backref='quiz', cascade='all, delete-orphan', lazy=True)
    results = db.relationship('QuizResult', backref='quiz', cascade='all, delete-orphan', lazy=True)


class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.String(50), db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    options_json = db.Column(db.Text, nullable=False)
    correct_option_id = db.Column(db.String(10), nullable=False)

    def get_options(self):
        try:
            return json.loads(self.options_json)
        except Exception:
            return []


class QuizResult(db.Model):
    __tablename__ = 'quiz_results'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    quiz_id = db.Column(db.String(50), db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    passed = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)


class Certificate(db.Model):
    __tablename__ = 'certificates'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    certificate_code = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    instructor_signature = db.Column(db.String(100), default='Dr. Sarah Chen')


# ------------------------------------------------------------------------------
# 3. REQUEST HOOKS
# ------------------------------------------------------------------------------

@app.before_request
def load_current_user():
    user_id = session.get('user_id')
    if user_id:
        request.current_user = User.query.get(user_id)
    else:
        default_user = User.query.filter_by(email='alex.morgan@systems.eng').first()
        request.current_user = default_user

@app.context_processor
def inject_global_template_vars():
    return {
        'current_user': getattr(request, 'current_user', None),
        'now': datetime.utcnow()
    }


# ------------------------------------------------------------------------------
# 4. PAGE ROUTES (THE 5 CORE PAGES)
# ------------------------------------------------------------------------------

@app.route('/')
def home():
    """Page 1: Home & Course Catalog Page"""
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
    enrolled_ids = [e.course_id for e in current_user.enrollments] if current_user else []

    return render_template(
        'index.html',
        courses=courses,
        categories=categories,
        selected_category=category,
        search_query=search_query,
        enrolled_ids=enrolled_ids
    )


@app.route('/courses/<course_id>')
def course_detail(course_id):
    """Page 2: Course Details & Enrollment Page"""
    course = Course.query.get_or_404(course_id)
    current_user = getattr(request, 'current_user', None)
    is_enrolled = False
    if current_user:
        is_enrolled = Enrollment.query.filter_by(user_id=current_user.id, course_id=course.id).first() is not None

    first_lesson_id = course.modules[0].lessons[0].id if course.modules and course.modules[0].lessons else None

    return render_template(
        'course_detail.html',
        course=course,
        is_enrolled=is_enrolled,
        first_lesson_id=first_lesson_id
    )


@app.route('/courses/<course_id>/learn/<lesson_id>')
def learn(course_id, lesson_id):
    """Page 3: Student Video Learning Page"""
    course = Course.query.get_or_404(course_id)
    lesson = Lesson.query.get_or_404(lesson_id)
    current_user = getattr(request, 'current_user', None)

    completed_lesson_ids = []
    if current_user:
        completed_lesson_ids = [p.lesson_id for p in LessonProgress.query.filter_by(user_id=current_user.id, completed=True).all()]

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


@app.route('/courses/<course_id>/quiz')
def quiz(course_id):
    """Page 4: Interactive MCQ Quiz & Certificate Page"""
    course = Course.query.get_or_404(course_id)
    quiz_obj = Quiz.query.filter_by(course_id=course_id).first()
    current_user = getattr(request, 'current_user', None)

    user_result = None
    certificate = None
    if current_user and quiz_obj:
        user_result = QuizResult.query.filter_by(user_id=current_user.id, quiz_id=quiz_obj.id).order_by(QuizResult.submitted_at.desc()).first()
        certificate = Certificate.query.filter_by(user_id=current_user.id, course_id=course.id).first()

    return render_template('quiz.html', course=course, quiz=quiz_obj, user_result=user_result, certificate=certificate)


@app.route('/admin')
def admin_dashboard():
    """Page 5: Admin & Instructor Dashboard"""
    courses = Course.query.order_by(Course.created_at.desc()).all()
    students = User.query.filter_by(role='student').all()

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
            q_res = QuizResult.query.filter_by(user_id=u.id, quiz_id=q_obj.id).order_by(QuizResult.submitted_at.desc()).first() if q_obj else None
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
    current_user = getattr(request, 'current_user', None)
    if not current_user:
        flash('Please sign in to enroll.', 'warning')
        return redirect(url_for('home'))

    existing = Enrollment.query.filter_by(user_id=current_user.id, course_id=course_id).first()
    if not existing:
        db.session.add(Enrollment(user_id=current_user.id, course_id=course_id))
        db.session.commit()
        flash('Successfully enrolled! Welcome to the masterclass.', 'success')

    if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'success': True, 'course_id': course_id})
    return redirect(url_for('course_detail', course_id=course_id))


@app.route('/lessons/<lesson_id>/toggle-complete', methods=['POST'])
def toggle_lesson_complete(lesson_id):
    current_user = getattr(request, 'current_user', None)
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 401

    progress = LessonProgress.query.filter_by(user_id=current_user.id, lesson_id=lesson_id).first()
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
    quiz_obj = Quiz.query.get_or_404(quiz_id)
    current_user = getattr(request, 'current_user', None)
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    user_answers = data.get('answers', {})

    total_q = len(quiz_obj.questions)
    correct_count = sum(1 for q in quiz_obj.questions if user_answers.get(str(q.id)) == q.correct_option_id)
    score = int((correct_count / total_q) * 100) if total_q > 0 else 0
    passed = score >= quiz_obj.passing_score

    db.session.add(QuizResult(user_id=current_user.id, quiz_id=quiz_obj.id, score=score, passed=passed))

    cert_code = None
    if passed:
        existing_cert = Certificate.query.filter_by(user_id=current_user.id, course_id=quiz_obj.course_id).first()
        if not existing_cert:
            cert_code = f"CL-{uuid.uuid4().hex[:8].upper()}-ARCH"
            db.session.add(Certificate(certificate_code=cert_code, user_id=current_user.id, course_id=quiz_obj.course_id))
        else:
            cert_code = existing_cert.certificate_code

    db.session.commit()
    return jsonify({'success': True, 'score': score, 'passed': passed, 'certificate_code': cert_code})


@app.route('/admin/course/create', methods=['POST'])
def create_course():
    title = request.form.get('title', '').strip()
    category = request.form.get('category', 'System Architecture')
    price = float(request.form.get('price', 94.00))
    description = request.form.get('description', '').strip()
    video_url = request.form.get('video_url', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
    pdf_material = request.form.get('pdf_material', 'Lecture Slides & Blueprint.pdf')

    course_id = f"course-{uuid.uuid4().hex[:6]}"
    new_course = Course(
        id=course_id,
        title=title,
        category=category,
        price=price,
        original_price=price * 1.5,
        short_description=description[:180],
        full_description=description,
        thumbnail='https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800'
    )
    db.session.add(new_course)
    db.session.commit()
    flash(f"Course '{title}' published successfully to PostgreSQL!", 'success')
    return redirect(url_for('admin_dashboard'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)`,
    },
    'templates/base.html': {
      lang: 'html',
      category: '2. Base Template',
      description: 'Master HTML5 Jinja2 layout featuring Tailwind CSS CDN, Plus Jakarta Sans font, sticky responsive navigation across all 5 pages, flash messages, and footer.',
      code: `<!-- File: templates/base.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}Clarity LMS - Systems Engineering{% endblock %}</title>

  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    code, pre, .font-mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">

  <!-- Top Sticky Navigation Bar -->
  <header class="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4">
        
        <!-- Brand -->
        <a href="{{ url_for('home') }}" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span class="text-white font-black text-lg">C</span>
          </div>
          <div>
            <div class="text-lg font-extrabold tracking-tight text-white">Clarity LMS</div>
            <div class="text-[10px] tracking-wider font-semibold text-slate-400 uppercase -mt-0.5">LEARNING PLATFORM</div>
          </div>
        </a>

        <!-- 5 Core Page Navigation Links -->
        <nav class="hidden lg:flex items-center gap-1.5">
          <a href="{{ url_for('home') }}" class="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80">
            1. Home &amp; Catalog
          </a>
          <a href="{{ url_for('course_detail', course_id='arch-microservices-101') }}" class="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80">
            2. Course Details
          </a>
          <a href="{{ url_for('learn', course_id='arch-microservices-101', lesson_id='les-1-1') }}" class="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80">
            3. Student Player
          </a>
          <a href="{{ url_for('quiz', course_id='arch-microservices-101') }}" class="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80">
            4. MCQ Quiz
          </a>
          <a href="{{ url_for('admin_dashboard') }}" class="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
            5. Admin Dashboard
          </a>
        </nav>

        <!-- User Profile Area -->
        <div class="flex items-center gap-3">
          <div class="text-xs text-slate-400 hidden sm:block text-right">
            <span class="font-bold text-white">{{ current_user.name if current_user else 'Alex Morgan' }}</span>
            <p class="text-[10px] text-emerald-400 font-mono">Student · Active</p>
          </div>
          <div class="w-9 h-9 rounded-full bg-slate-700 border-2 border-emerald-500/50 overflow-hidden">
            <img src="{{ current_user.avatar if current_user and current_user.avatar else 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' }}" alt="Avatar" class="w-full h-full object-cover">
          </div>
        </div>

      </div>
    </div>
  </header>

  <!-- Flash Alerts -->
  {% with messages = get_flashed_messages(with_categories=true) %}
    {% if messages %}
      <div class="max-w-7xl mx-auto px-4 mt-4 w-full">
        {% for category, message in messages %}
          <div class="p-3.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {{ message }}
          </div>
        {% endfor %}
      </div>
    {% endif %}
  {% endwith %}

  <!-- Main Content -->
  <main class="flex-1">
    {% block content %}{% endblock %}
  </main>

  <!-- Footer -->
  <footer class="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-400 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div><strong>Clarity LMS</strong> &copy; 2026 · Python Flask &amp; PostgreSQL</div>
      <div class="flex items-center gap-6">
        <a href="{{ url_for('home') }}" class="hover:text-white">Catalog</a>
        <a href="{{ url_for('admin_dashboard') }}" class="hover:text-white">Admin</a>
      </div>
    </div>
  </footer>

  {% block scripts %}{% endblock %}
</body>
</html>`,
    },
    'templates/index.html': {
      lang: 'html',
      category: '3. Home & Catalog Page',
      description: 'Course catalog with interactive hero banner, search input form, category filter pill buttons, and responsive grid of course cards with enrollment triggers.',
      code: `<!-- File: templates/index.html -->
{% extends "base.html" %}

{% block title %}Course Catalog - Clarity LMS{% endblock %}

{% block content %}
<div class="min-h-screen bg-slate-950 text-slate-100">
  
  <!-- Hero Banner -->
  <section class="bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800 py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span>Production-Grade Systems Engineering Masterclasses</span>
      </div>
      <h1 class="text-4xl sm:text-5xl font-extrabold text-white leading-tight max-w-4xl">
        Build Resilient, Fault-Tolerant Distributed Software.
      </h1>
      <p class="text-slate-300 text-base max-w-2xl leading-relaxed">
        Master high-throughput event meshes, distributed consensus algorithms (Raft/Paxos), and zero-downtime microservice orchestration.
      </p>

      <!-- Search Bar -->
      <form action="{{ url_for('home') }}" method="GET" class="flex flex-col sm:flex-row gap-3 max-w-xl pt-2">
        <input
          type="text"
          name="q"
          value="{{ search_query }}"
          placeholder="Search architecture courses, Kafka, Raft, Envoy..."
          class="flex-1 h-12 px-4 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        >
        <button type="submit" class="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm">
          Search
        </button>
      </form>
    </div>
  </section>

  <!-- Catalog Grid Section -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
    <!-- Category Filter -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
      <span class="text-slate-500 font-semibold mr-2">Categories:</span>
      {% for cat in categories %}
        <a
          href="{{ url_for('home', category=cat) }}"
          class="px-3.5 py-1.5 rounded-lg font-semibold whitespace-nowrap {{ 'bg-blue-600 text-white' if selected_category == cat else 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800' }}"
        >
          {{ cat }}
        </a>
      {% endfor %}
    </div>

    <!-- Course Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {% for course in courses %}
        <div class="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-all">
          <div>
            <div class="aspect-video bg-slate-950 relative overflow-hidden">
              <img src="{{ course.thumbnail }}" alt="{{ course.title }}" class="w-full h-full object-cover">
              <span class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 text-emerald-400 border border-slate-700">
                {{ course.badge }}
              </span>
            </div>
            <div class="p-6 space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span class="text-blue-400 font-semibold">{{ course.category }}</span>
                <span>★ {{ course.rating }} ({{ course.review_count }})</span>
              </div>
              <h3 class="text-base font-bold text-white line-clamp-2">
                <a href="{{ url_for('course_detail', course_id=course.id) }}">{{ course.title }}</a>
              </h3>
              <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">{{ course.short_description }}</p>
            </div>
          </div>

          <div class="p-6 pt-0 border-t border-slate-800 mt-2 flex items-center justify-between">
            <div>
              <span class="text-xl font-extrabold text-white">\${{ "%.2f"|format(course.price) }}</span>
              <span class="text-xs text-slate-500 line-through">\${{ "%.2f"|format(course.original_price) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <a href="{{ url_for('course_detail', course_id=course.id) }}" class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200">
                Details
              </a>
              <form action="{{ url_for('enroll', course_id=course.id) }}" method="POST">
                <button type="submit" class="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white">
                  Enroll Now
                </button>
              </form>
            </div>
          </div>
        </div>
      {% endfor %}
    </div>
  </section>

</div>
{% endblock %}`,
    },
    'templates/course_detail.html': {
      lang: 'html',
      category: '4. Course Detail Page',
      description: 'Course syllabus accordion, instructor biography, key architectural outcomes, and sticky enrollment CTA button.',
      code: `<!-- File: templates/course_detail.html -->
{% extends "base.html" %}

{% block title %}{{ course.title }} - Clarity LMS{% endblock %}

{% block content %}
<div class="min-h-screen bg-slate-950 text-slate-100 pb-16">
  
  <!-- Hero Section -->
  <section class="bg-slate-900 border-b border-slate-800 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-8 space-y-6">
          <span class="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {{ course.badge }}
          </span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {{ course.title }}
          </h1>
          <p class="text-slate-300 text-base leading-relaxed">{{ course.short_description }}</p>

          <!-- Instructor Info -->
          <div class="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-slate-700 overflow-hidden shrink-0">
              <img src="{{ course.instructor_avatar or 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250' }}" alt="Instructor" class="w-full h-full object-cover">
            </div>
            <div>
              <span class="text-base font-bold text-white">{{ course.instructor_name }}</span>
              <p class="text-xs text-slate-400">Staff Systems Architect &amp; ex-Google Principal</p>
            </div>
          </div>
        </div>

        <!-- Right CTA Card -->
        <div class="lg:col-span-4">
          <div class="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
            <div class="aspect-video rounded-xl overflow-hidden bg-slate-950 relative">
              <img src="{{ course.thumbnail }}" alt="Course Preview" class="w-full h-full object-cover">
            </div>
            <div class="space-y-1">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-extrabold text-white">\${{ "%.2f"|format(course.price) }}</span>
                <span class="text-sm text-slate-500 line-through">\${{ "%.2f"|format(course.original_price) }}</span>
              </div>
            </div>

            {% if is_enrolled %}
              <a href="{{ url_for('learn', course_id=course.id, lesson_id=first_lesson_id or 'les-1-1') }}" class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm block text-center">
                Go to Student Player &rarr;
              </a>
            {% else %}
              <form action="{{ url_for('enroll', course_id=course.id) }}" method="POST">
                <button type="submit" class="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm">
                  Enroll Now
                </button>
              </form>
            {% endif %}
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Syllabus Accordion Section -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="lg:col-span-8 space-y-4">
      <h2 class="text-2xl font-extrabold text-white">Course Syllabus &amp; Modules</h2>
      
      <div class="space-y-3">
        {% for mod in course.modules %}
          <div class="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div class="p-4 font-bold text-sm text-white bg-slate-850 flex items-center justify-between">
              <span>Module {{ mod.module_number }}: {{ mod.title }}</span>
              <span class="text-xs text-slate-400 font-mono">{{ mod.duration }}</span>
            </div>
            <div class="divide-y divide-slate-800/80 p-2">
              {% for les in mod.lessons %}
                <div class="p-3 flex items-center justify-between text-xs text-slate-300">
                  <span>▶ {{ les.title }}</span>
                  <a href="{{ url_for('learn', course_id=course.id, lesson_id=les.id) }}" class="text-blue-400 font-semibold hover:underline">
                    Watch
                  </a>
                </div>
              {% endfor %}
            </div>
          </div>
        {% endfor %}
      </div>
    </div>
  </section>

</div>
{% endblock %}`,
    },
    'templates/learn.html': {
      lang: 'html',
      category: '5. Student Video Learning Page',
      description: 'Split view video learning workspace with left sidebar lesson checklist, AJAX completion toggling, right HTML5 video player, lecture notes, and downloadable PDF links.',
      code: `<!-- File: templates/learn.html -->
{% extends "base.html" %}

{% block title %}{{ active_lesson.title }} - Clarity LMS{% endblock %}

{% block content %}
<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
  
  <!-- Top Progress Bar -->
  <div class="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
    <a href="{{ url_for('course_detail', course_id=course.id) }}" class="text-xs font-semibold text-slate-400 hover:text-white">
      &larr; Back to Course
    </a>
    <div class="flex items-center gap-3 text-xs">
      <span class="text-slate-400">Course Progress:</span>
      <div class="w-32 h-2 rounded-full bg-slate-800 overflow-hidden">
        <div class="h-full bg-emerald-500 rounded-full" style="width: {{ progress_percentage }}%"></div>
      </div>
      <span class="font-mono font-bold text-emerald-400">{{ progress_percentage }}%</span>
    </div>
  </div>

  <!-- Split Screen Workspace -->
  <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
    
    <!-- Left Sidebar: Lesson Checklist -->
    <aside class="lg:w-88 bg-slate-900/90 border-r border-slate-800 p-4 space-y-3 overflow-y-auto">
      <div class="text-xs font-bold text-white uppercase tracking-wider mb-2">Curriculum Checklist</div>
      {% for mod in course.modules %}
        <div class="space-y-1">
          <div class="text-[11px] font-bold text-slate-400">Module {{ mod.module_number }}: {{ mod.title }}</div>
          {% for les in mod.lessons %}
            <div class="p-2.5 rounded-xl flex items-center justify-between text-xs {{ 'bg-blue-600 text-white font-semibold' if les.id == active_lesson.id else 'hover:bg-slate-800 text-slate-300' }}">
              <div class="flex items-center gap-2 truncate">
                <input
                  type="checkbox"
                  {{ 'checked' if les.id in completed_lesson_ids else '' }}
                  onchange="fetch('/lessons/{{ les.id }}/toggle-complete', {method: 'POST'})"
                  class="rounded accent-emerald-500"
                >
                <a href="{{ url_for('learn', course_id=course.id, lesson_id=les.id) }}" class="truncate">{{ les.title }}</a>
              </div>
              <span class="text-[10px] opacity-75 font-mono">{{ les.duration }}</span>
            </div>
          {% endfor %}
        </div>
      {% endfor %}
    </aside>

    <!-- Right Main Stage: Video Player & PDF -->
    <main class="flex-1 p-6 space-y-6 overflow-y-auto">
      <div class="rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl">
        <div class="aspect-video">
          <video controls src="{{ active_lesson.video_url }}" class="w-full h-full object-contain"></video>
        </div>
        <div class="p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-white text-base">{{ active_lesson.title }}</h3>
            <p class="text-slate-400 text-xs mt-0.5">{{ active_lesson.subtitle }}</p>
          </div>
          <button
            onclick="fetch('/lessons/{{ active_lesson.id }}/toggle-complete', {method: 'POST'}).then(() => location.reload())"
            class="py-2.5 px-5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            ✓ {{ 'Completed' if active_lesson.id in completed_lesson_ids else 'Mark as Complete' }}
          </button>
        </div>
      </div>

      <!-- PDF Resources -->
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h4 class="font-bold text-white text-sm">{{ active_lesson.pdf_title or 'Architecture Blueprint.pdf' }}</h4>
          <p class="text-xs text-slate-400">Downloadable companion document · 8.4 MB</p>
        </div>
        <a href="#" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs">
          Download PDF
        </a>
      </div>
    </main>
  </div>

</div>
{% endblock %}`,
    },
    'templates/quiz.html': {
      lang: 'html',
      category: '6. Quiz & Certificate Page',
      description: 'Interactive multiple choice examination form with automated backend score evaluation and dynamic accredited certificate modal with print/PDF export.',
      code: `<!-- File: templates/quiz.html -->
{% extends "base.html" %}

{% block title %}Assessment Quiz - Clarity LMS{% endblock %}

{% block content %}
<div class="min-h-screen bg-slate-950 text-slate-100 py-10">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    
    <div class="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
      <div>
        <span class="text-xs font-mono font-bold text-blue-400 uppercase">Assessment</span>
        <h1 class="text-2xl font-extrabold text-white mt-1">{{ quiz.title }}</h1>
        <p class="text-xs text-slate-400 mt-1">Passing score: {{ quiz.passing_score }}%. Achieve 80% to earn certificate.</p>
      </div>
      <div class="text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
        {{ quiz.questions|length }} Questions
      </div>
    </div>

    <!-- Dynamic Result Banner -->
    <div id="result-banner" class="{{ 'p-6 rounded-2xl border space-y-3' if user_result else 'hidden' }} {{ 'bg-emerald-950/40 border-emerald-500/40' if user_result and user_result.passed else 'bg-rose-950/40 border-rose-500/40' }}">
      {% if user_result %}
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white">{{ '🎉 You Passed!' if user_result.passed else 'Assessment Not Passed' }}</h3>
            <p class="text-xs text-slate-300">Score: <strong class="text-white">{{ user_result.score }}%</strong></p>
          </div>
          {% if user_result.passed %}
            <button onclick="document.getElementById('certificate-modal').classList.remove('hidden')" class="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
              Download Certificate
            </button>
          {% endif %}
        </div>
      {% endif %}
    </div>

    <!-- MCQ Form -->
    <form id="quiz-form" onsubmit="submitQuiz(event)" class="space-y-6">
      {% for q in quiz.questions %}
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 class="text-sm font-bold text-white">{{ loop.index }}. {{ q.question_text }}</h3>
          <div class="space-y-2.5 pl-4">
            {% for opt in q.get_options() %}
              <label class="p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 flex items-center gap-3 cursor-pointer text-xs">
                <input type="radio" name="q_{{ q.id }}" value="{{ opt.id }}" required class="accent-blue-500">
                <span>{{ opt.text }}</span>
              </label>
            {% endfor %}
          </div>
        </div>
      {% endfor %}

      <button type="submit" class="py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider">
        Submit for Grading
      </button>
    </form>

  </div>

  <!-- Certificate Modal -->
  <div id="certificate-modal" class="hidden fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-slate-900 rounded-3xl border-2 border-emerald-500/40 p-8 text-center space-y-6">
      <div class="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">ACCREDITED CERTIFICATE</div>
      <h2 class="text-3xl font-extrabold text-white">Certificate of Excellence</h2>
      <p class="text-xs text-slate-400">Awarded to</p>
      <h3 class="text-3xl font-extrabold text-emerald-300">{{ current_user.name if current_user else 'Alex Morgan' }}</h3>
      <p class="text-xs text-slate-300">for passing the masterclass in {{ course.title }}</p>
      <div class="pt-4 flex justify-center gap-3">
        <button onclick="window.print()" class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs">Print / PDF</button>
        <button onclick="document.getElementById('certificate-modal').classList.add('hidden')" class="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs">Close</button>
      </div>
    </div>
  </div>

</div>
{% endblock %}

{% block scripts %}
<script>
async function submitQuiz(e) {
  e.preventDefault();
  const form = document.getElementById('quiz-form');
  const answers = {};
  new FormData(form).forEach((val, key) => answers[key.replace('q_', '')] = val);

  const res = await fetch('/quiz/{{ quiz.id }}/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });
  const data = await res.json();
  if (data.success) {
    location.reload();
  }
}
</script>
{% endblock %}`,
    },
    'templates/admin_dashboard.html': {
      lang: 'html',
      category: '7. Admin Dashboard',
      description: 'Tabbed instructor management panel: Tab 1 - Add new course form (video URL, PDF material, price), Tab 2 - Registered student progress roster with completion metrics.',
      code: `<!-- File: templates/admin_dashboard.html -->
{% extends "base.html" %}

{% block title %}Admin Dashboard - Clarity LMS{% endblock %}

{% block content %}
<div class="min-h-screen bg-slate-950 text-slate-100 py-10">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
    
    <!-- Title & Tab Switcher -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-extrabold text-white">Instructor &amp; Operations Dashboard</h1>
      <div class="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <button onclick="switchTab('course')" id="btn-course" class="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white">
          Tab 1: Add New Course
        </button>
        <button onclick="switchTab('students')" id="btn-students" class="px-4 py-2 text-xs font-bold rounded-lg text-slate-400">
          Tab 2: Student Progress ({{ students_roster|length }})
        </button>
      </div>
    </div>

    <!-- TAB 1: Add Course -->
    <div id="tab-course" class="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
      <h2 class="text-lg font-bold text-white">Publish Course to PostgreSQL</h2>
      <form action="{{ url_for('create_course') }}" method="POST" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 mb-1">Course Title *</label>
          <input type="text" name="title" required placeholder="e.g. Distributed Consensus with Raft" class="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Category *</label>
            <select name="category" class="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white">
              <option value="System Architecture">System Architecture</option>
              <option value="Event-Driven Systems">Event-Driven Systems</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Price (USD) *</label>
            <input type="number" name="price" value="94.00" class="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">Video Stream URL *</label>
            <input type="url" name="video_url" value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" class="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">PDF Material Title *</label>
            <input type="text" name="pdf_material" value="Lecture Slides.pdf" class="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
          </div>
        </div>
        <button type="submit" class="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase">
          Publish Course
        </button>
      </form>
    </div>

    <!-- TAB 2: Student Progress Table -->
    <div id="tab-students" class="hidden p-8 rounded-2xl bg-slate-900 border border-slate-800">
      <h2 class="text-lg font-bold text-white mb-4">Student Completion Progress</h2>
      <table class="w-full text-left text-xs text-slate-300">
        <thead class="bg-slate-950 text-slate-400 font-mono text-[11px]">
          <tr>
            <th class="p-3">Student</th>
            <th class="p-3">Enrolled Course</th>
            <th class="p-3">Completed</th>
            <th class="p-3">Progress</th>
            <th class="p-3">Quiz Score</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          {% for item in students_roster %}
            <tr>
              <td class="p-3 text-white font-bold">{{ item.user.name }}</td>
              <td class="p-3">{{ item.course.title }}</td>
              <td class="p-3 font-mono text-emerald-400">{{ item.completed_count }}/{{ item.total_count }}</td>
              <td class="p-3 font-mono">{{ item.progress_percentage }}%</td>
              <td class="p-3">{{ item.quiz_result.score ~ '%' if item.quiz_result else 'Pending' }}</td>
            </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>

  </div>
</div>
{% endblock %}

{% block scripts %}
<script>
function switchTab(t) {
  document.getElementById('tab-course').classList.toggle('hidden', t !== 'course');
  document.getElementById('tab-students').classList.toggle('hidden', t === 'course');
  document.getElementById('btn-course').className = t === 'course' ? 'px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white' : 'px-4 py-2 text-xs font-bold rounded-lg text-slate-400';
  document.getElementById('btn-students').className = t === 'students' ? 'px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white' : 'px-4 py-2 text-xs font-bold rounded-lg text-slate-400';
}
</script>
{% endblock %}`,
    },
    'PostgreSQL Guide & schema.sql': {
      lang: 'sql',
      category: 'Database & DDL',
      description: 'PostgreSQL step-by-step setup commands and production DDL schema with foreign keys and cascade rules.',
      code: `-- =============================================================================
-- STEP 1: PostgreSQL Setup Commands
-- =============================================================================
-- 1. Open PostgreSQL shell:
--    sudo -u postgres psql
--
-- 2. Create database user and database:
--    CREATE USER lms_user WITH ENCRYPTED PASSWORD 'lms_secure_pass123!';
--    CREATE DATABASE lms_db OWNER lms_user;
--    GRANT ALL PRIVILEGES ON DATABASE lms_db TO lms_user;
--
-- 3. Set connection string in terminal or .env:
--    export DATABASE_URL="postgresql://lms_user:lms_secure_pass123!@localhost:5432/lms_db"
--
-- =============================================================================
-- STEP 2: DDL Schema (Run: psql -U lms_user -d lms_db -f schema.sql)
-- =============================================================================

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'student',
    avatar VARCHAR(255),
    title VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    badge VARCHAR(50) DEFAULT 'Masterclass',
    rating NUMERIC(3, 2) DEFAULT 4.95,
    review_count INTEGER DEFAULT 0,
    category VARCHAR(100) DEFAULT 'System Architecture',
    price NUMERIC(10, 2) DEFAULT 94.00,
    original_price NUMERIC(10, 2) DEFAULT 149.00,
    short_description TEXT NOT NULL,
    full_description TEXT,
    thumbnail VARCHAR(255),
    preview_video_url VARCHAR(255),
    preview_duration VARCHAR(20) DEFAULT '3m 45s',
    instructor_name VARCHAR(100) DEFAULT 'Dr. Sarah Chen',
    instructor_bio TEXT,
    instructor_avatar VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modules (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    badge VARCHAR(50),
    duration VARCHAR(50)
);

CREATE TABLE lessons (
    id VARCHAR(50) PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    duration VARCHAR(50),
    lesson_type VARCHAR(20) DEFAULT 'lecture',
    video_url VARCHAR(255),
    is_free_preview BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    pdf_url VARCHAR(255),
    pdf_title VARCHAR(255),
    notes TEXT
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_course_enrollment UNIQUE(user_id, course_id)
);

CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_lesson_progress UNIQUE(user_id, lesson_id)
);

CREATE TABLE quizzes (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score INTEGER DEFAULT 80
);

CREATE TABLE quiz_questions (
    id INTEGER PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    explanation TEXT,
    options_json TEXT NOT NULL,
    correct_option_id VARCHAR(10) NOT NULL
);

CREATE TABLE quiz_results (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    instructor_signature VARCHAR(100) DEFAULT 'Dr. Sarah Chen'
);`,
    },
    'requirements.txt': {
      lang: 'text',
      category: 'Dependencies',
      description: 'Python package requirements including Flask, Flask-SQLAlchemy, and psycopg2-binary PostgreSQL driver.',
      code: `Flask>=3.0.0
Flask-SQLAlchemy>=3.1.0
psycopg2-binary>=2.9.9
Werkzeug>=3.0.0
python-dotenv>=1.0.0`,
    },
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(filesMap[selectedFile].code);
    setCopied(true);
    showToast(`Copied ${selectedFile} to clipboard!`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
              <Code2 className="w-4 h-4" />
              <span>Full-Stack Python LMS Architecture</span>
              <span>·</span>
              <span>Flask + PostgreSQL (psycopg2) + Tailwind CSS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Complete Python Backend &amp; Jinja2 Templates
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              All 5 requested LMS pages, PostgreSQL database models, and setup guides ready for copy-pasting directly into VS Code or running in <code className="text-emerald-400 font-mono">/python_lms/</code>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : `Copy ${selectedFile}`}</span>
            </button>
          </div>
        </div>

        {/* Code Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* File Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-blue-400" />
              Source Code Files (5 Pages + Setup)
            </div>

            <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              {Object.keys(filesMap).map((fileName) => {
                const info = filesMap[fileName];
                const isSelected = selectedFile === fileName;
                return (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName)}
                    className={`w-full p-3 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-md'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCode className="w-4 h-4 shrink-0 opacity-80" />
                      <div className="truncate">
                        <div className="truncate font-mono">{fileName}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {info.category}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] opacity-80 font-mono uppercase shrink-0">
                      {info.lang}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Terminal Guide */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Run with PostgreSQL locally:</span>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800/80">
{`# 1. Start PostgreSQL & create db
createdb lms_db

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set connection string & run
export DATABASE_URL="postgresql://username:password@localhost:5432/lms_db"
python app.py`}
              </pre>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-800/90 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-sm">{selectedFile}</span>
                  <span className="text-[10px] text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-semibold">
                    {filesMap[selectedFile].category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{filesMap[selectedFile].description}</p>
              </div>

              <button
                onClick={handleCopyCode}
                className="text-slate-300 hover:text-white flex items-center gap-1.5 font-semibold bg-slate-700/60 px-3 py-1.5 rounded-lg border border-slate-600/60 self-start sm:self-auto shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy File'}</span>
              </button>
            </div>

            <div className="p-5 bg-slate-950 overflow-x-auto max-h-[700px] font-mono text-xs text-slate-200 leading-relaxed selection:bg-blue-500/40">
              <pre>{filesMap[selectedFile].code}</pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
