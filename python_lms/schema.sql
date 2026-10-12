-- =============================================================================
-- CLARITY LMS - PostgreSQL DDL Database Schema
-- Database: lms_db
-- Run with: psql -U lms_user -d lms_db -f schema.sql
-- =============================================================================

-- Drop tables if re-initializing (reverse order of foreign keys)
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table (Students, Instructors, Administrators)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'student', -- 'student', 'instructor', 'admin'
    avatar VARCHAR(255),
    title VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses Table
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

-- 3. Modules Table
CREATE TABLE modules (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    badge VARCHAR(50),
    duration VARCHAR(50)
);

-- 4. Lessons Table
CREATE TABLE lessons (
    id VARCHAR(50) PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    duration VARCHAR(50),
    lesson_type VARCHAR(20) DEFAULT 'lecture', -- 'lecture', 'lab', 'quiz'
    video_url VARCHAR(255),
    is_free_preview BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    pdf_url VARCHAR(255),
    pdf_title VARCHAR(255),
    notes TEXT
);

-- 5. Student Course Enrollments Table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_course_enrollment UNIQUE(user_id, course_id)
);

-- 6. Lesson Progress Table
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_lesson_progress UNIQUE(user_id, lesson_id)
);

-- 7. Assessment Quizzes Table
CREATE TABLE quizzes (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score INTEGER DEFAULT 80
);

-- 8. Quiz Questions Table
CREATE TABLE quiz_questions (
    id INTEGER PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    explanation TEXT,
    options_json TEXT NOT NULL,
    correct_option_id VARCHAR(10) NOT NULL
);

-- 9. Quiz Results Table
CREATE TABLE quiz_results (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Certificates Table
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    instructor_signature VARCHAR(100) DEFAULT 'Dr. Sarah Chen'
);

-- Helpful Indexing for High-Performance Querying
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_progress_user ON lesson_progress(user_id);
