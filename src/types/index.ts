export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title?: string;
  joinedDate: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  durationSeconds: number;
  type: 'lecture' | 'lab' | 'quiz' | 'reading';
  subtitle: string;
  videoUrl?: string;
  isFreePreview?: boolean;
  isLocked?: boolean;
  completed?: boolean;
  pdfUrl?: string;
  pdfTitle?: string;
  notes?: string;
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  badge?: string;
  duration: string;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  content: string;
  avatar: string;
}

export interface CourseOutcome {
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  badge: string;
  rating: number;
  reviewCount: number;
  updatedTag: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  shortDescription: string;
  fullDescription: string;
  thumbnail: string;
  previewVideoUrl: string;
  previewDuration: string;
  instructor: {
    id: string;
    name: string;
    role: string;
    credentials: string;
    bio: string;
    avatar: string;
    rating: number;
    studentsCount: number;
    frameworksCount: number;
  };
  outcomes: CourseOutcome[];
  features: string[];
  modules: CourseModule[];
  prerequisites: {
    whoIsItFor: string;
    requirements: string;
  };
  reviews: Review[];
  ratingBreakdown: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

export interface QuizQuestion {
  id: number;
  question: string;
  explanation: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
}

export interface StudentProgress {
  userId: string;
  studentName: string;
  email: string;
  avatar: string;
  courseId: string;
  courseTitle: string;
  enrolledAt: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercentage: number;
  quizScore?: number;
  quizPassed?: boolean;
  certificateEarned?: boolean;
  certificateId?: string;
  lastActive: string;
}
