from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

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

    enrollments = db.relationship('Enrollment', backref='user', lazy=True)
    quiz_results = db.relationship('QuizResult', backref='user', lazy=True)
    certificates = db.relationship('Certificate', backref='user', lazy=True)

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
    quizzes = db.relationship('Quiz', backref='course', lazy=True)
    enrollments = db.relationship('Enrollment', backref='course', lazy=True)

class Module(db.Model):
    __tablename__ = 'modules'

    id = db.Column(db.String(50), primary_key=True)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id'), nullable=False)
    module_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    badge = db.Column(db.String(50), nullable=True)
    duration = db.Column(db.String(50), nullable=True)

    lessons = db.relationship('Lesson', backref='module', cascade='all, delete-orphan', lazy=True)

class Lesson(db.Model):
    __tablename__ = 'lessons'

    id = db.Column(db.String(50), primary_key=True)
    module_id = db.Column(db.String(50), db.ForeignKey('modules.id'), nullable=False)
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

class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)

class LessonProgress(db.Model):
    __tablename__ = 'lesson_progress'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.String(50), db.ForeignKey('lessons.id'), nullable=False)
    completed = db.Column(db.Boolean, default=True)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

class Quiz(db.Model):
    __tablename__ = 'quizzes'

    id = db.Column(db.String(50), primary_key=True)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    passing_score = db.Column(db.Integer, default=80)

    questions = db.relationship('QuizQuestion', backref='quiz', cascade='all, delete-orphan', lazy=True)

class QuizQuestion(db.Model):
    __tablename__ = 'quiz_questions'

    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.String(50), db.ForeignKey('quizzes.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text, nullable=True)
    options_json = db.Column(db.Text, nullable=False)  # JSON string of options [{id: 'a', text: '...'}]
    correct_option_id = db.Column(db.String(10), nullable=False)

    def get_options(self):
        return json.loads(self.options_json)

class QuizResult(db.Model):
    __tablename__ = 'quiz_results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.String(50), db.ForeignKey('quizzes.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    passed = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

class Certificate(db.Model):
    __tablename__ = 'certificates'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    certificate_code = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(db.String(50), db.ForeignKey('courses.id'), nullable=False)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    instructor_signature = db.Column(db.String(100), default='Dr. Sarah Chen')
