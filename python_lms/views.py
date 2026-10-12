from flask import Blueprint, render_template, request, jsonify, redirect, url_for, session, flash
from models import db, User, Course, Module, Lesson, Enrollment, LessonProgress, Quiz, QuizQuestion, QuizResult, Certificate
import json
import uuid

views_bp = Blueprint('views', __name__)
api_bp = Blueprint('api', __name__)

# -------------------------------------------------------------
# HTML PAGE TEMPLATE ROUTES (Jinja2)
# -------------------------------------------------------------

@views_bp.route('/')
def home():
    """1. Home & Course Catalog Page"""
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
        current_user=current_user,
        enrolled_ids=enrolled_ids
    )

@views_bp.route('/courses/<course_id>')
def course_detail(course_id):
    """2. Course Details & Enrollment Page"""
    course = Course.query.get_or_404(course_id)
    current_user = getattr(request, 'current_user', None)

    is_enrolled = False
    if current_user:
        is_enrolled = Enrollment.query.filter_by(user_id=current_user.id, course_id=course.id).first() is not None

    return render_template(
        'course_detail.html',
        course=course,
        current_user=current_user,
        is_enrolled=is_enrolled
    )

@views_bp.route('/courses/<course_id>/learn/<lesson_id>')
def student_player(course_id, lesson_id):
    """3. Student Learning & Video Player Page"""
    course = Course.query.get_or_404(course_id)
    lesson = Lesson.query.get_or_404(lesson_id)
    current_user = getattr(request, 'current_user', None)

    # Gather user's completed lessons for this course
    completed_lesson_ids = []
    if current_user:
        progress_entries = LessonProgress.query.filter_by(user_id=current_user.id, completed=True).all()
        completed_lesson_ids = [p.lesson_id for p in progress_entries]

    # Calculate overall progress %
    all_lessons = [les for mod in course.modules for les in mod.lessons]
    total_count = len(all_lessons)
    completed_count = sum(1 for les in all_lessons if les.id in completed_lesson_ids)
    progress_percentage = int((completed_count / total_count) * 100) if total_count > 0 else 0

    return render_template(
        'learn.html',
        course=course,
        active_lesson=lesson,
        completed_lesson_ids=completed_lesson_ids,
        progress_percentage=progress_percentage,
        current_user=current_user
    )

@views_bp.route('/courses/<course_id>/quiz')
def quiz_page(course_id):
    """4. Quiz & Certificate Page"""
    course = Course.query.get_or_404(course_id)
    quiz = Quiz.query.filter_by(course_id=course_id).first()
    current_user = getattr(request, 'current_user', None)

    user_result = None
    certificate = None
    if current_user and quiz:
        user_result = QuizResult.query.filter_by(user_id=current_user.id, quiz_id=quiz.id).order_by(QuizResult.submitted_at.desc()).first()
        certificate = Certificate.query.filter_by(user_id=current_user.id, course_id=course.id).first()

    return render_template(
        'quiz.html',
        course=course,
        quiz=quiz,
        user_result=user_result,
        certificate=certificate,
        current_user=current_user
    )

@views_bp.route('/admin')
def admin_dashboard():
    """5. Admin & User Dashboard Page"""
    current_user = getattr(request, 'current_user', None)
    courses = Course.query.order_by(Course.created_at.desc()).all()
    enrollments = Enrollment.query.all()
    users = User.query.filter_by(role='student').all()

    # Build student roster with progress calculation
    students_roster = []
    for u in users:
        for enr in u.enrollments:
            c = enr.course
            all_c_lessons = [les.id for mod in c.modules for les in mod.lessons]
            completed = LessonProgress.query.filter(
                LessonProgress.user_id == u.id,
                LessonProgress.lesson_id.in_(all_c_lessons),
                LessonProgress.completed == True
            ).count()
            total = len(all_c_lessons)
            pct = int((completed / total) * 100) if total > 0 else 0
            quiz = Quiz.query.filter_by(course_id=c.id).first()
            q_res = QuizResult.query.filter_by(user_id=u.id, quiz_id=quiz.id).order_by(QuizResult.submitted_at.desc()).first() if quiz else None
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
        total_students=len(users),
        total_courses=len(courses),
        current_user=current_user
    )

# -------------------------------------------------------------
# REST & AJAX API ENDPOINTS
# -------------------------------------------------------------

@api_bp.route('/enroll/<course_id>', methods=['POST'])
def api_enroll(course_id):
    current_user = getattr(request, 'current_user', None)
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 401

    existing = Enrollment.query.filter_by(user_id=current_user.id, course_id=course_id).first()
    if not existing:
        new_enrollment = Enrollment(user_id=current_user.id, course_id=course_id)
        db.session.add(new_enrollment)
        db.session.commit()

    return jsonify({'success': True, 'message': 'Enrolled successfully', 'course_id': course_id})

@api_bp.route('/lessons/<lesson_id>/toggle-complete', methods=['POST'])
def api_toggle_complete(lesson_id):
    """AJAX endpoint for marking lesson as complete / incomplete"""
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

@api_bp.route('/quiz/<quiz_id>/submit', methods=['POST'])
def api_submit_quiz(quiz_id):
    """Python endpoint evaluating MCQ score and unlocking certificate"""
    quiz = Quiz.query.get_or_404(quiz_id)
    current_user = getattr(request, 'current_user', None)
    if not current_user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    user_answers = data.get('answers', {})  # { question_id: option_id }

    questions = quiz.questions
    correct_count = 0
    total = len(questions)

    for q in questions:
        if user_answers.get(str(q.id)) == q.correct_option_id:
            correct_count += 1

    score = int((correct_count / total) * 100) if total > 0 else 0
    passed = score >= quiz.passing_score

    result = QuizResult(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=score,
        passed=passed
    )
    db.session.add(result)

    certificate_code = None
    if passed:
        existing_cert = Certificate.query.filter_by(user_id=current_user.id, course_id=quiz.course_id).first()
        if not existing_cert:
            certificate_code = f"CL-{uuid.uuid4().hex[:8].upper()}-ARCH"
            new_cert = Certificate(
                certificate_code=certificate_code,
                user_id=current_user.id,
                course_id=quiz.course_id,
                instructor_signature='Dr. Sarah Chen'
            )
            db.session.add(new_cert)
        else:
            certificate_code = existing_cert.certificate_code

    db.session.commit()

    return jsonify({
        'success': True,
        'score': score,
        'passed': passed,
        'correct_count': correct_count,
        'total': total,
        'certificate_code': certificate_code
    })

@api_bp.route('/admin/courses/create', methods=['POST'])
def api_create_course():
    """Admin endpoint to create a new course with initial module and lesson"""
    current_user = getattr(request, 'current_user', None)
    data = request.form if request.form else (request.get_json() or {})

    course_id = f"course-{uuid.uuid4().hex[:8]}"
    title = data.get('title')
    description = data.get('description')
    category = data.get('category', 'System Architecture')
    price = float(data.get('price', 94.0))
    video_url = data.get('video_url', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
    pdf_material = data.get('pdf_material', 'Lecture Slides & Architecture Blueprint.pdf')

    new_course = Course(
        id=course_id,
        title=title,
        badge='New Release',
        category=category,
        price=price,
        original_price=price * 1.5,
        short_description=description,
        full_description=description,
        preview_video_url=video_url,
        instructor_name=current_user.name if current_user else 'Dr. Sarah Chen'
    )
    db.session.add(new_course)

    # Add default module & lesson
    mod = Module(
        id=f"mod-{uuid.uuid4().hex[:8]}",
        course_id=course_id,
        module_number=1,
        title='Module 1: Production Core Architecture',
        duration='2 lessons • 1h 15m'
    )
    db.session.add(mod)

    les = Lesson(
        id=f"les-{uuid.uuid4().hex[:8]}",
        module_id=mod.id,
        title='1.1 System Architecture Overview',
        subtitle='Lecture & slides included',
        duration='35:00',
        video_url=video_url,
        pdf_title=pdf_material,
        is_free_preview=True
    )
    db.session.add(les)
    db.session.commit()

    if request.is_json:
        return jsonify({'success': True, 'course_id': course_id})
    return redirect(url_for('views.course_detail', course_id=course_id))
