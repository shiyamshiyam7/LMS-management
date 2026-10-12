import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Star,
  Users,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Filter,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const {
    courses,
    setSelectedCourse,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    enrollInCourse,
    enrolledCourseIds,
  } = useApp();

  const categories = [
    'All Categories',
    'System Architecture',
    'Event-Driven Systems',
    'Cloud Networking',
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || c.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
          
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production-Grade Engineering Masterclasses</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Build Mission-Critical, Fault-Tolerant Distributed Software.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Accelerate your engineering journey with curated curricula taught by staff architects from Google, Netflix, and Apache Foundation contributors. Real repos, zero fluff.
            </p>

            {/* Search Input in Hero */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search architecture courses, Kafka, Raft, Envoy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-inner"
                />
              </div>
              <button
                onClick={() => {}}
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
              >
                <span>Find Masterclasses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Accredited Certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>45,000+ Enrolled Tech Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Turnkey Docker Sandboxes</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Category Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Categories:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredCourses.length}</strong> available masterclasses
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            return (
              <div
                key={course.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 overflow-hidden flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:shadow-blue-900/10"
              >
                <div>
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveTab('detail');
                    }}
                    className="relative aspect-video overflow-hidden bg-slate-950 cursor-pointer"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-slate-900/90 backdrop-blur text-emerald-400 border border-slate-700">
                        {course.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/90 text-slate-300 border border-slate-800">
                      {course.previewDuration}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-blue-400">{course.category}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white font-bold">{course.rating}</span>
                        <span>({course.reviewCount})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveTab('detail');
                      }}
                      className="text-base font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-2"
                    >
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.shortDescription}
                    </p>

                    {/* Instructor Info */}
                    <div className="pt-2 flex items-center gap-2.5">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-slate-200">{course.instructor.name}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{course.instructor.role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Price & Buttons */}
                <div className="p-5 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-white">
                      ${course.price.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400 line-through">
                      ${course.originalPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveTab('detail');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        if (isEnrolled) {
                          setActiveTab('learn');
                        } else {
                          enrollInCourse(course.id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isEnrolled
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                      }`}
                    >
                      {isEnrolled ? 'Open Player' : 'Enroll Now'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
