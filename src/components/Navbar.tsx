import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bell,
  Code2,
  BookOpen,
  PlaySquare,
  Award,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  LogOut,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsCommandPaletteOpen,
    currentUser,
    switchRole,
    setIsAuthModalOpen,
    courseProgressPercentage,
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'Module 1 Assessment Unlocked',
      desc: 'You can now take the Architecture Scenario Validation Quiz.',
      time: '10m ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Instructor Q&A Session',
      desc: 'Dr. Sarah Chen replied to a question on Paxos vs Raft.',
      time: '1h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'New Lab Manifest Released',
      desc: 'Toxiproxy Docker Compose v2.4 configuration updated.',
      time: '1d ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-8 shrink-0">
            <button
              onClick={() => setActiveTab('detail')}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Clarity LMS
                </div>
                <div className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase -mt-0.5">
                  Learning Platform
                </div>
              </div>
            </button>

            {/* Nav Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'catalog'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Home & Catalog
              </button>

              <button
                onClick={() => setActiveTab('detail')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'detail'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Course Detail
              </button>

              <button
                onClick={() => setActiveTab('learn')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'learn'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>Student Player</span>
                {courseProgressPercentage > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {courseProgressPercentage}%
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'quiz'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Quiz & Certificate
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Admin Panel
              </button>

              {/* Python Full-Stack Source Viewer tab */}
              <button
                onClick={() => setActiveTab('python_code')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'python_code'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'text-blue-400/90 hover:text-blue-300 hover:bg-blue-900/20'
                }`}
                title="View production-ready Python backend code & Jinja2 templates"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Python Code</span>
              </button>
            </nav>
          </div>

          {/* Right Area: Search, Bell, User Profile */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="w-56 md:w-64 h-9 pl-9 pr-8 text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-400 flex items-center justify-between transition-colors text-left"
              >
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <span className="truncate">Search courses, lessons...</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-900 border border-slate-700 rounded">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileDropdownOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
              </button>

              {/* Notification Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                    <span className="text-xs font-semibold text-slate-200">Cohort Notifications</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">2 New</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700/50 text-left transition-colors cursor-pointer"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          if (item.id === '1') setActiveTab('quiz');
                        }}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                          <span>{item.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-800 transition-colors text-left focus:outline-none"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-600"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden md:block leading-tight text-left">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    {currentUser.name}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {currentUser.role === 'admin' ? 'Student / Admin' : currentUser.role}
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-700">
                    <p className="font-semibold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 capitalize">
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-slate-400">ID: #SYS-8924</span>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Switch Role Mode
                    </div>
                    <button
                      onClick={() => {
                        switchRole('student');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-700/60 text-left transition-colors ${
                        currentUser.role === 'student' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5" />
                        Student (Alex Morgan)
                      </span>
                      {currentUser.role === 'student' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        switchRole('instructor');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-700/60 text-left transition-colors ${
                        currentUser.role === 'instructor' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Instructor (Dr. Sarah Chen)
                      </span>
                      {currentUser.role === 'instructor' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        switchRole('admin');
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-slate-700/60 text-left transition-colors ${
                        currentUser.role === 'admin' ? 'text-emerald-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Administrator View
                      </span>
                      {currentUser.role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700/60 text-left transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-400" />
                      <span>Account Settings & Auth</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Nav strip */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 border-t border-slate-800 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'detail' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300'
            }`}
          >
            Course Detail
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'learn' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300'
            }`}
          >
            Player
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'quiz' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1 rounded whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setActiveTab('python_code')}
            className={`px-3 py-1 rounded whitespace-nowrap text-blue-400 ${
              activeTab === 'python_code' ? 'bg-blue-500/20' : ''
            }`}
          >
            Python Code
          </button>
        </div>

      </div>
    </header>
  );
};
