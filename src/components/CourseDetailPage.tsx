import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Breadcrumbs } from './Breadcrumbs';
import {
  Star,
  Clock,
  Award,
  CheckCircle,
  PlayCircle,
  Lock,
  Code,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Zap,
  Heart,
  Calendar,
  ShieldCheck,
  Video,
  FileCode,
  MessageSquare,
  Repeat,
  Share2,
  Users,
  Building,
  Info,
  Check,
  Play,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const CourseDetailPage: React.FC = () => {
  const {
    selectedCourse,
    enrollInCourse,
    enrolledCourseIds,
    setActiveTab,
    setSelectedLessonId,
    showToast,
  } = useApp();

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
  });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isEnrolled = enrolledCourseIds.includes(selectedCourse.id);

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    selectedCourse.modules.forEach((m) => {
      all[m.id] = true;
    });
    setExpandedModules(all);
  };

  const handleLessonClick = (lessonId: string, isLocked?: boolean) => {
    if (isLocked && !isEnrolled) {
      showToast('This lesson is locked. Enroll to unlock the complete syllabus.', 'warn');
      return;
    }
    setSelectedLessonId(lessonId);
    setActiveTab('learn');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          <Breadcrumbs currentCategory={selectedCourse.category} currentPage="COURSE OVERVIEW" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Course Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Badges strip */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  {selectedCourse.badge}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-white">{selectedCourse.rating} Rating</span>
                  <span className="text-slate-400">· {selectedCourse.reviewCount.toLocaleString()} verified reviews</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {selectedCourse.updatedTag}
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  Official Certificate
                </span>
              </div>

              {/* Course Title & Summary */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                  {selectedCourse.title}
                </h1>
                <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
                  {selectedCourse.shortDescription}
                </p>
              </div>

              {/* Instructor Card */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={selectedCourse.instructor.avatar}
                  alt={selectedCourse.instructor.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-white">
                      {selectedCourse.instructor.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <Check className="w-3 h-3" />
                      Staff Systems Architect & ex-Google Principal
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    {selectedCourse.instructor.bio}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <strong className="text-slate-200">{selectedCourse.instructor.rating}</strong> Instructor Rating
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-400" />
                      <strong className="text-slate-200">{selectedCourse.instructor.studentsCount.toLocaleString()}</strong> Students Taught
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Code className="w-3 h-3 text-indigo-400" />
                      <strong className="text-slate-200">{selectedCourse.instructor.frameworksCount}</strong> Published Frameworks
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Course Outcomes Box */}
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Key Course Outcomes
                  </h3>
                  <span className="text-xs text-slate-400">Hands-on Production Readiness</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCourse.outcomes.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Pricing & Video Card (Sticky) */}
            <div className="lg:col-span-4">
              <div className="sticky top-20 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                
                {/* Video Preview Thumbnail */}
                <div className="relative group cursor-pointer aspect-video overflow-hidden bg-slate-950" onClick={() => setIsVideoModalOpen(true)}>
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur text-xs font-medium text-slate-200 flex items-center gap-1.5 border border-slate-700">
                    <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                    Preview Course ({selectedCourse.previewDuration})
                  </div>
                </div>

                {/* Pricing & CTA Body */}
                <div className="p-6 space-y-5">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-extrabold text-white">
                        ${selectedCourse.price.toFixed(2)}
                      </span>
                      <span className="text-base text-slate-400 line-through">
                        ${selectedCourse.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {selectedCourse.discountPercentage}% OFF
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-rose-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Special Cohort Price ends in <strong>18 hours</strong></span>
                  </div>

                  {/* Primary CTA */}
                  <button
                    onClick={() => enrollInCourse(selectedCourse.id)}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    {isEnrolled ? 'Continue Learning' : 'Enroll Now / Start Learning'}
                  </button>

                  {/* Secondary CTAs */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setIsWishlisted(!isWishlisted);
                        showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️', 'info');
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isWishlisted
                          ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-400 text-rose-400' : ''}`} />
                      Add to Wishlist
                    </button>
                    <button
                      onClick={() => showToast('Team demo consultation booked! Our solutions architect will contact you.', 'success')}
                      className="py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      Schedule Team Demo
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>30-Day Unconditional Money-Back Guarantee</span>
                  </div>

                  {/* Feature inclusions */}
                  <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-300">
                    <p className="font-bold text-white text-xs uppercase tracking-wider">This course includes:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <Video className="w-4 h-4 text-blue-400 shrink-0" />
                        <span><strong>24 hours</strong> on-demand HD video</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span><strong>18</strong> downloadable code templates</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Verified certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>1-on-1 Discord mentor access</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Repeat className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Full lifetime access & updates</span>
                      </div>
                    </div>
                  </div>

                  {/* Share & licenses links */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Course link copied to clipboard!', 'info');
                      }}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share Course
                    </button>
                    <button
                      onClick={() => showToast('Enterprise volume licenses request submitted.', 'info')}
                      className="flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <Building className="w-3.5 h-3.5" />
                      Team Licenses
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Content Area: Curriculum & Right Widgets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Syllabus & Prerequisites */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Course Curriculum & Syllabus
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  6 Modules · 42 Lessons · 24h 15m Total Duration
                </p>
              </div>
              <button
                onClick={expandAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 py-1.5 px-3 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-colors self-start sm:self-auto"
              >
                Expand All Modules
              </button>
            </div>

            {/* Accordion Modules */}
            <div className="space-y-4">
              {selectedCourse.modules.map((module) => {
                const isOpen = !!expandedModules[module.id];
                return (
                  <div
                    key={module.id}
                    className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden transition-all"
                  >
                    {/* Module Accordion Header */}
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 font-bold text-white flex items-center justify-center text-sm shadow-sm">
                          {module.moduleNumber}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            {module.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            {module.duration}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {module.badge && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {module.badge}
                          </span>
                        )}
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Lesson Items */}
                    {isOpen && (
                      <div className="divide-y divide-slate-800/80 bg-slate-950/60">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson.id, lesson.isLocked)}
                            className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {lesson.type === 'lecture' && (
                                  <PlayCircle className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                )}
                                {lesson.type === 'lab' && (
                                  <Code className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                                )}
                                {lesson.type === 'quiz' && (
                                  <FileQuestion className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                )}
                              </div>
                              <div>
                                <h5 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                                  {lesson.title}
                                </h5>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {lesson.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {lesson.isFreePreview && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Free Preview
                                </span>
                              )}
                              {lesson.isLocked && !isEnrolled && (
                                <Lock className="w-3.5 h-3.5 text-slate-500" />
                              )}
                              <span className="text-xs font-mono text-slate-400">
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Prerequisites & Who This Course Is For Box */}
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">
                  Prerequisites & Who This Course Is For
                </h4>
                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-slate-100">Who it's for:</strong>{' '}
                    {selectedCourse.prerequisites.whoIsItFor}
                  </p>
                  <p>
                    <strong className="text-slate-100">Prerequisites:</strong>{' '}
                    {selectedCourse.prerequisites.requirements}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Accredited Certificate preview & Enterprise card */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Accredited Certificate Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Accredited Certificate
                  </h4>
                  <p className="text-[11px] text-slate-400">Shareable on LinkedIn & Resumes</p>
                </div>
              </div>

              {/* Certificate Mockup Preview Card */}
              <div
                onClick={() => setActiveTab('quiz')}
                className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 shadow-inner cursor-pointer hover:border-slate-700 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Award className="w-4 h-4 text-blue-400" />
                    CLARITY LMS
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>

                <div className="text-center py-2 space-y-1">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Certificate of Excellence
                  </p>
                  <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    Distinguished Systems Architect
                  </p>
                  <p className="text-[11px] italic text-slate-400">
                    Presented to Verified Graduate
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <div>
                    <span>Instructor Signature</span>
                    <p className="font-sans font-semibold text-slate-200">Dr. Sarah Chen</p>
                  </div>
                  <div className="text-right">
                    <span>ID: CL-89241-ARCH</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Each credential comes with a unique cryptographic hash and permanent public verification URL.
              </p>
            </div>

            {/* Enterprise Training Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Enterprise Training
              </span>
              <h4 className="text-base font-bold text-white">
                Upskilling an engineering team?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Get seat management, unified invoicing, team progress tracking, and dedicated instructor Q&A sessions for teams of 5 or more.
              </p>
              <button
                onClick={() => showToast('Team proposal request sent to enterprise sales team.', 'success')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 pt-1"
              >
                <span>Request Team Proposal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Student Feedback & Reviews Section */}
        <div className="mt-16 pt-12 border-t border-slate-800 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Student Feedback & Reviews
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Real testimonials from verified engineering leads and distributed systems practitioners.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Rating Number Box */}
            <div className="md:col-span-4 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
              <div className="text-5xl font-extrabold text-white">4.95</div>
              <div className="flex items-center justify-center md:justify-start gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                ))}
              </div>
              <p className="text-xs font-semibold text-white">Course Rating</p>
              <p className="text-[11px] text-slate-400">Based on 2,340 verified reviews</p>
            </div>

            {/* Rating Bars */}
            <div className="md:col-span-8 space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-12 text-slate-400 text-right">5 stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                </div>
                <span className="w-10 text-slate-400 text-right font-mono">92%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-slate-400 text-right">4 stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[6%]" />
                </div>
                <span className="w-10 text-slate-400 text-right font-mono">6%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-slate-400 text-right">3 stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[1.5%]" />
                </div>
                <span className="w-10 text-slate-400 text-right font-mono">1.5%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-slate-400 text-right">2 stars</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[0.5%]" />
                </div>
                <span className="w-10 text-slate-400 text-right font-mono">&lt;1%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-12 text-slate-400 text-right">1 star</span>
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[0.2%]" />
                </div>
                <span className="w-10 text-slate-400 text-right font-mono">&lt;1%</span>
              </div>
            </div>

          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {selectedCourse.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.date}</span>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{rev.content}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white">{rev.author}</h5>
                    <p className="text-[10px] text-slate-400">{rev.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Video Modal Preview */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-800 flex items-center justify-between border-b border-slate-700">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-blue-400" />
                Free Course Preview: {selectedCourse.title}
              </span>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-700"
              >
                Close ✕
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                controls
                autoPlay
                className="w-full h-full"
                src={selectedCourse.previewVideoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
