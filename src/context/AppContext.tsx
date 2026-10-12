import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Lesson, QuizQuestion, StudentProgress, User } from '../types';
import {
  currentUserMock,
  initialStudentsMock,
  sampleCourses,
  sampleQuizQuestions,
} from '../data/mockData';
import confetti from 'canvas-confetti';

export type AppTab = 'catalog' | 'detail' | 'learn' | 'quiz' | 'admin' | 'python_code';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warn';
}

interface AppContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedCourse: Course;
  setSelectedCourse: (course: Course) => void;
  selectedLessonId: string;
  setSelectedLessonId: (lessonId: string) => void;
  selectedLesson: Lesson | undefined;
  enrolledCourseIds: string[];
  enrollInCourse: (courseId: string) => void;
  completedLessonIds: string[];
  toggleLessonComplete: (lessonId: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: 'student' | 'instructor' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  courses: Course[];
  addNewCourse: (course: Partial<Course>) => void;
  quizQuestions: QuizQuestion[];
  quizAnswers: Record<number, string>;
  setQuizAnswer: (questionId: number, optionId: string) => void;
  quizResult: { score: number; passed: boolean; submitted: boolean; details?: any } | null;
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
  students: StudentProgress[];
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warn') => void;
  courseProgressPercentage: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('detail');
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course>(sampleCourses[0]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('les-1-1');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(['arch-microservices-101']);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['les-1-1', 'les-1-2']);
  const [currentUser, setCurrentUser] = useState<User>(currentUserMock);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [quizQuestions] = useState<QuizQuestion[]>(sampleQuizQuestions);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    submitted: boolean;
    details?: any;
  } | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>(initialStudentsMock);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const enrollInCourse = (courseId: string) => {
    if (!enrolledCourseIds.includes(courseId)) {
      setEnrolledCourseIds((prev) => [...prev, courseId]);
      showToast('🎉 Successfully enrolled! Welcome to the cohort.', 'success');
      // Add to student roster
      setStudents((prev) => [
        {
          userId: currentUser.id,
          studentName: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar,
          courseId,
          courseTitle: selectedCourse.title,
          enrolledAt: new Date().toISOString().split('T')[0],
          completedLessonsCount: 0,
          totalLessonsCount: selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0),
          progressPercentage: 0,
          lastActive: 'Just now',
        },
        ...prev,
      ]);
    } else {
      showToast('You are already enrolled in this course.', 'info');
    }
    setActiveTab('learn');
  };

  const toggleLessonComplete = (lessonId: string) => {
    const isCompleted = completedLessonIds.includes(lessonId);
    if (isCompleted) {
      setCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
      showToast('Lesson marked as incomplete.', 'info');
    } else {
      setCompletedLessonIds((prev) => [...prev, lessonId]);
      showToast('✓ Lesson marked as complete! +25 XP', 'success');
    }
  };

  // Find active lesson across modules
  const allLessons = selectedCourse.modules.flatMap((m) => m.lessons);
  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId) || allLessons[0];

  // Course progress calculation
  const totalLessonsInSelectedCourse = allLessons.length;
  const completedInSelectedCourse = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const courseProgressPercentage = totalLessonsInSelectedCourse > 0
    ? Math.round((completedInSelectedCourse / totalLessonsInSelectedCourse) * 100)
    : 0;

  const setQuizAnswer = (questionId: number, optionId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const submitQuiz = async () => {
    // Backend evaluation logic simulation
    let correctCount = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctOptionId) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / quizQuestions.length) * 100);
    const passed = score >= 80;

    setQuizResult({
      score,
      passed,
      submitted: true,
      details: {
        correctCount,
        total: quizQuestions.length,
      },
    });

    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast(`🏆 Assessment Passed! Score: ${score}%. Certificate unlocked!`, 'success');
    } else {
      showToast(`Assessment submitted. Score: ${score}%. You need 80% to pass. Try again!`, 'warn');
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
  };

  const switchRole = (newRole: 'student' | 'instructor' | 'admin') => {
    if (newRole === 'instructor') {
      setCurrentUser({
        id: 'usr_sarah_chen',
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@clarity.edu',
        role: 'instructor',
        avatar: '/src/assets/images/instructor_sarah_chen_1791784905828.jpg',
        title: 'Staff Systems Architect & Instructor',
        joinedDate: 'Sep 2024',
      });
    } else if (newRole === 'admin') {
      setCurrentUser({
        id: 'usr_alex_admin',
        name: 'Alex Morgan',
        email: 'alex.morgan@clarity.lms',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        title: 'Platform Administrator',
        joinedDate: 'Jan 2026',
      });
    } else {
      setCurrentUser(currentUserMock);
    }
    showToast(`Switched active view profile to ${newRole.toUpperCase()}`, 'info');
  };

  const addNewCourse = (courseData: Partial<Course>) => {
    const newId = `course-${Date.now()}`;
    const newCourseObj: Course = {
      id: newId,
      title: courseData.title || 'Untitled Masterclass',
      badge: courseData.badge || 'New Masterclass',
      rating: 5.0,
      reviewCount: 1,
      updatedTag: 'Just Published',
      category: courseData.category || 'System Architecture',
      price: courseData.price || 99,
      originalPrice: (courseData.price || 99) * 1.5,
      discountPercentage: 33,
      shortDescription: courseData.shortDescription || 'Course overview and outcomes...',
      fullDescription: courseData.fullDescription || 'Full curriculum details...',
      thumbnail: courseData.thumbnail || '/src/assets/images/course_cloud_gateway_1791784933769.jpg',
      previewVideoUrl: courseData.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      previewDuration: '3m 30s',
      instructor: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.title || 'Lead Instructor',
        credentials: 'Staff Systems Architect',
        bio: 'Senior engineering educator with production experience.',
        avatar: currentUser.avatar,
        rating: 4.95,
        studentsCount: 120,
        frameworksCount: 4,
      },
      outcomes: [
        { title: 'Production Architecture', description: 'Real-world deployment patterns and resilience.' },
        { title: 'Fault-Tolerant Systems', description: 'Zero-downtime operations and monitoring.' },
      ],
      features: ['12 hours on-demand video', 'Turnkey code sandbox', 'Verified Certificate of Completion'],
      prerequisites: {
        whoIsItFor: 'Engineers looking to level up their architecture skills.',
        requirements: 'Familiarity with backend development.',
      },
      ratingBreakdown: { fiveStar: 100, fourStar: 0, threeStar: 0, twoStar: 0, oneStar: 0 },
      reviews: [],
      modules: courseData.modules || [
        {
          id: `mod-${Date.now()}-1`,
          moduleNumber: 1,
          title: 'Module 1: Architecture Core Foundations',
          duration: '3 lessons • 1h 45m',
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: '1.1 System Design Overview & High-Level Topology',
              subtitle: 'Introductory Lecture',
              duration: '25:00',
              durationSeconds: 1500,
              type: 'lecture',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              pdfTitle: 'System Design Overview Slides.pdf',
            },
          ],
        },
      ],
    };

    setCourses((prev) => [newCourseObj, ...prev]);
    setSelectedCourse(newCourseObj);
    showToast(`✓ Masterclass "${newCourseObj.title}" published successfully!`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedCourse,
        setSelectedCourse,
        selectedLessonId,
        setSelectedLessonId,
        selectedLesson,
        enrolledCourseIds,
        enrollInCourse,
        completedLessonIds,
        toggleLessonComplete,
        currentUser,
        setCurrentUser,
        switchRole,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        courses,
        addNewCourse,
        quizQuestions,
        quizAnswers,
        setQuizAnswer,
        quizResult,
        submitQuiz,
        resetQuiz,
        students,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        toasts,
        showToast,
        courseProgressPercentage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
