import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, BookOpen, PlayCircle, Award, ShieldCheck, X } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    courses,
    setSelectedCourse,
    setSelectedLessonId,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const allLessons = courses.flatMap((c) =>
    c.modules.flatMap((m) =>
      m.lessons.map((l) => ({ ...l, course: c }))
    )
  );

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLessons = allLessons.filter((l) =>
    l.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a course title, lesson, or command..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4 text-xs">
          
          {/* Quick Page Actions */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
              Navigation
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setActiveTab('catalog');
                  setIsCommandPaletteOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Course Catalog</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('learn');
                  setIsCommandPaletteOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
              >
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Player</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('quiz');
                  setIsCommandPaletteOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Accreditation Quiz</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsCommandPaletteOpen(false);
                }}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Console</span>
              </button>
            </div>
          </div>

          {/* Courses */}
          {filteredCourses.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Courses
              </span>
              {filteredCourses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCourse(c);
                    setActiveTab('detail');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full p-2.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between"
                >
                  <span className="font-semibold text-white truncate">{c.title}</span>
                  <span className="text-[10px] text-blue-400 shrink-0 font-mono">${c.price}</span>
                </button>
              ))}
            </div>
          )}

          {/* Lessons */}
          {filteredLessons.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Lessons &amp; Syllabus Units
              </span>
              {filteredLessons.slice(0, 5).map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setSelectedCourse(l.course);
                    setSelectedLessonId(l.id);
                    setActiveTab('learn');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full p-2.5 rounded-lg hover:bg-slate-800 text-left text-slate-200 flex items-center justify-between"
                >
                  <span className="truncate">{l.title}</span>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">{l.duration}</span>
                </button>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
