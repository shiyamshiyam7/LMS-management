import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  RotateCcw,
  BookOpen,
  Award,
  HelpCircle,
  ExternalLink,
  Code,
  Share2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const LearnPage: React.FC = () => {
  const {
    selectedCourse,
    selectedLessonId,
    setSelectedLessonId,
    selectedLesson,
    completedLessonIds,
    toggleLessonComplete,
    setActiveTab,
    courseProgressPercentage,
    showToast,
  } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<'notes' | 'resources' | 'discussion'>('notes');
  const [userNote, setUserNote] = useState(
    'Key takeaway: Fencing tokens must be monotonically increasing integers issued by the consensus store. The storage server rejects any write containing a token lower than the highest seen token.'
  );
  const [isSavedNote, setIsSavedNote] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isCurrentCompleted = selectedLesson ? completedLessonIds.includes(selectedLesson.id) : false;

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleDownloadResource = (title?: string) => {
    showToast(`Downloading "${title || 'Resource'}..."`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Top Banner with Progress & Quick Switcher */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('detail')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Course Overview
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
            {selectedCourse.title}
          </span>
        </div>

        {/* Live Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400">Course Progress:</span>
            <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${courseProgressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {courseProgressPercentage}%
            </span>
          </div>

          {courseProgressPercentage >= 80 && (
            <button
              onClick={() => setActiveTab('quiz')}
              className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              Claim Certificate
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar: Collapsible Modules & Lessons */}
        <div
          className={`${
            isSidebarCollapsed ? 'lg:w-14' : 'lg:w-80 xl:w-96'
          } bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-200 z-10`}
        >
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            {!isSidebarCollapsed && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Course Syllabus
                </h3>
                <p className="text-[10px] text-slate-400">
                  {completedLessonIds.length} of{' '}
                  {selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} completed
                </p>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
              title={isSidebarCollapsed ? 'Expand syllabus' : 'Collapse syllabus'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Module & Lesson List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {selectedCourse.modules.map((module) => (
              <div key={module.id} className="p-2 space-y-1">
                {!isSidebarCollapsed && (
                  <div className="px-2 py-1 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="truncate">Module {module.moduleNumber}: {module.title}</span>
                  </div>
                )}

                <div className="space-y-0.5">
                  {module.lessons.map((lesson) => {
                    const isSelected = lesson.id === selectedLessonId;
                    const isDone = completedLessonIds.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (lesson.type === 'quiz') {
                            setActiveTab('quiz');
                          } else {
                            setSelectedLessonId(lesson.id);
                          }
                        }}
                        className={`p-2.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {/* Completion Toggle button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonComplete(lesson.id);
                            }}
                            className="shrink-0 focus:outline-none"
                            title="Toggle completed state"
                          >
                            {isDone ? (
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  isSelected ? 'text-white' : 'text-emerald-400'
                                }`}
                              />
                            ) : (
                              <Circle
                                className={`w-4 h-4 ${
                                  isSelected ? 'text-white/70' : 'text-slate-600'
                                }`}
                              />
                            )}
                          </button>

                          {!isSidebarCollapsed && (
                            <div className="truncate text-left">
                              <p className="truncate leading-tight">{lesson.title}</p>
                              <span
                                className={`text-[10px] ${
                                  isSelected ? 'text-blue-200' : 'text-slate-400'
                                }`}
                              >
                                {lesson.duration}
                              </span>
                            </div>
                          )}
                        </div>

                        {!isSidebarCollapsed && lesson.type === 'quiz' && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            Quiz
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Quiz Card at bottom of sidebar */}
          {!isSidebarCollapsed && (
            <div className="p-3 bg-slate-950 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('quiz')}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <Award className="w-3.5 h-3.5" />
                Take Course Exam (Quiz)
              </button>
            </div>
          )}
        </div>

        {/* Main Right Area: Video Player & Lesson Content */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* HTML5 Video Player Container */}
          <div className="rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl relative">
            <div className="aspect-video relative bg-slate-950 flex items-center justify-center">
              <video
                ref={videoRef}
                src={selectedLesson?.videoUrl || selectedCourse.previewVideoUrl}
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
              >
                Your browser does not support the video player.
              </video>
            </div>

            {/* Video Action Bar */}
            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 font-semibold"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                {/* Speed selector */}
                <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-md text-[11px] font-mono">
                  {[1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`px-2 py-0.5 rounded ${
                        playbackSpeed === s
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* AJAX "Mark as Complete" Button */}
              {selectedLesson && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLessonComplete(selectedLesson.id)}
                    className={`py-1.5 px-3.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
                      isCurrentCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCurrentCompleted ? 'Completed ✓ (Click to Undo)' : 'Mark as Complete'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Lesson Header & Outcomes */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold mb-1">
                  <span>Lesson {selectedLesson?.title.split(' ')[0]}</span>
                  <span>·</span>
                  <span>Duration: {selectedLesson?.duration}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedLesson?.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedLesson?.subtitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const all = selectedCourse.modules.flatMap((m) => m.lessons);
                    const idx = all.findIndex((l) => l.id === selectedLessonId);
                    if (idx < all.length - 1) {
                      setSelectedLessonId(all[idx + 1].id);
                    } else {
                      setActiveTab('quiz');
                    }
                  }}
                  className="py-2 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-tabs: Notes, PDF Resources, Discussion */}
            <div className="pt-2">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTabSub('notes')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTabSub === 'notes'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Lesson Notes
                </button>
                <button
                  onClick={() => setActiveTabSub('resources')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTabSub === 'resources'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Materials & Lab Files
                </button>
                <button
                  onClick={() => setActiveTabSub('discussion')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    activeTabSub === 'discussion'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Cohort Q&A
                </button>
              </div>

              {/* Tab 1: Notes Content */}
              {activeTabSub === 'notes' && (
                <div className="pt-4 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                    <p className="font-semibold text-white">Lecture Overview:</p>
                    <p>{selectedLesson?.notes || 'No lecture notes provided for this unit.'}</p>
                  </div>

                  {/* Student Scratchpad */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Your Personal Scratchpad:</span>
                      <button
                        onClick={() => {
                          setIsSavedNote(true);
                          showToast('Personal notes saved!', 'success');
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Save Notes
                      </button>
                    </div>
                    <textarea
                      value={userNote}
                      onChange={(e) => {
                        setUserNote(e.target.value);
                        setIsSavedNote(false);
                      }}
                      rows={4}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      placeholder="Write your personal notes and architecture diagrams here..."
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: PDF Resources & Lab files */}
              {activeTabSub === 'resources' && (
                <div className="pt-4 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {selectedLesson?.pdfTitle || 'Architecture Slides & Lecture Diagrams (PDF)'}
                        </p>
                        <p className="text-[10px] text-slate-400">PDF Document · 8.4 MB · High Resolution</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadResource(selectedLesson?.pdfTitle)}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <Code className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Toxiproxy & Docker Compose Lab Repo
                        </p>
                        <p className="text-[10px] text-slate-400">ZIP Archive · 1.2 MB · Turnkey Sandbox</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadResource('Toxiproxy Lab Sandbox')}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Lab</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Discussion */}
              {activeTabSub === 'discussion' && (
                <div className="pt-4 space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                          alt="Marcus"
                          className="w-5 h-5 rounded-full"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-bold text-slate-200">Marcus Vance</span>
                        <span className="text-[10px] text-slate-500">2 days ago</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Instructor Answered
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      When using Raft in a multi-datacenter deployment, how do you handle round-trip latency for heartbeats?
                    </p>
                    <div className="pl-4 border-l-2 border-slate-800 pt-1 text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">Dr. Sarah Chen: </span>
                      Tune heartbeat intervals to at least 150-300ms, and pin the leader to the primary region using leader lease extensions.
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
