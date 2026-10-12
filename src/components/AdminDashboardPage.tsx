import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PlusCircle,
  Users,
  BookOpen,
  DollarSign,
  Award,
  CheckCircle,
  Clock,
  Video,
  FileText,
  Upload,
  ArrowUpRight,
  TrendingUp,
  Search,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { courses, addNewCourse, students, setActiveTab, setSelectedCourse, showToast } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'create_course' | 'students_roster'>('create_course');
  const [searchTerm, setSearchTerm] = useState('');

  // Course Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('System Architecture');
  const [price, setPrice] = useState('95');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [pdfMaterial, setPdfMaterial] = useState('Distributed Consensus Architecture Blueprint (PDF)');
  const [moduleTitle, setModuleTitle] = useState('Module 1: High-Performance Architecture Fundamentals');

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill in course title and description.', 'warn');
      return;
    }

    addNewCourse({
      title,
      shortDescription: description,
      fullDescription: description,
      category,
      price: parseFloat(price) || 89,
      previewVideoUrl: videoUrl,
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          moduleNumber: 1,
          title: moduleTitle || 'Module 1: Foundations',
          duration: '3 lessons • 1h 45m',
          lessons: [
            {
              id: `les-${Date.now()}-1`,
              title: '1.1 Architectural Blueprint Overview',
              subtitle: 'System design lecture with lecture slides',
              duration: '30:00',
              durationSeconds: 1800,
              type: 'lecture',
              videoUrl,
              pdfTitle: pdfMaterial,
            },
          ],
        },
      ],
    });

    // Reset form
    setTitle('');
    setDescription('');
    showToast('Course published! Redirecting to course detail view...', 'success');
    setActiveTab('detail');
  };

  const filteredStudents = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Dashboard Title & Quick Stats */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Management Console
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Admin & Instructor Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Monitor student cohorts, publish new video curricula, and track accreditation credentials.
              </p>
            </div>

            {/* Admin Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveAdminTab('create_course')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeAdminTab === 'create_course'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Upload Course
              </button>
              <button
                onClick={() => setActiveAdminTab('students_roster')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeAdminTab === 'students_roster'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Student Roster ({students.length})
              </button>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Active Students</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">45,820</div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +14% this month
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Masterclasses</span>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">{courses.length} Courses</div>
              <p className="text-[11px] text-slate-400">62 Modules Published</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Certificates Issued</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">3,892</div>
              <p className="text-[11px] text-emerald-400">98.2% verified on LinkedIn</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Cohort Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">$430,708</div>
              <p className="text-[11px] text-slate-400">Average price: $94.00</p>
            </div>
          </div>
        </div>

        {/* Tab 1: Upload / Add New Course Form */}
        {activeAdminTab === 'create_course' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-400" />
                  Upload & Publish New Masterclass
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Python backend route: <code className="font-mono text-emerald-400">POST /api/admin/courses/create</code>
                </p>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus & Raft Invariants at Scale"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Engineering Domain / Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="System Architecture">System Architecture</option>
                      <option value="Event-Driven Systems">Event-Driven Systems</option>
                      <option value="Cloud Networking">Cloud Networking</option>
                      <option value="Database Engineering">Database Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Enrollment Price (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="94.00"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Summary & Outcomes *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a deep description of the curriculum, hands-on labs, and real-world failure models..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      HTML5 Video Lecture Stream URL (MP4 / HLS) *
                    </label>
                    <input
                      type="url"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      PDF Reference Material Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={pdfMaterial}
                      onChange={(e) => setPdfMaterial(e.target.value)}
                      placeholder="e.g. Raft Consensus Specification.pdf"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    First Module Title
                  </label>
                  <input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('Database Sharding & Consistent Hashing Rings');
                      setDescription('Learn virtual nodes, cross-region replication lag mitigation, and hot spot key mitigation under millions of writes.');
                      setPrice('89');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Load Sample Preset
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/30 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Publish Course to Catalog</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Quick Preview */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Live Card Preview
                </span>
                <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <div className="aspect-video bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                    <Video className="w-8 h-8 opacity-40" />
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {category}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {title || 'Your Course Title'}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {description || 'Course description will appear here as you type...'}
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                      <span className="text-base font-extrabold text-white">
                        ${parseFloat(price || '0').toFixed(2)}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold">New Release</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Registered Students Table */}
        {activeAdminTab === 'students_roster' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Enrolled Students Progress Tracking
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live cohort metrics, quiz exam grades, and earned completion badges.
                </p>
              </div>

              {/* Search filter for students */}
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter student or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course Enrolled</th>
                    <th className="py-3 px-4">Progress %</th>
                    <th className="py-3 px-4">Quiz Score</th>
                    <th className="py-3 px-4">Completion Status</th>
                    <th className="py-3 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((std, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatar}
                            alt={std.studentName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-white">{std.studentName}</p>
                            <p className="text-[10px] text-slate-400">{std.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {std.courseTitle}
                      </td>

                      {/* Progress bar */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-400">{std.completedLessonsCount}/{std.totalLessonsCount} units</span>
                            <span className="text-emerald-400 font-bold">{std.progressPercentage}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${std.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Quiz Score */}
                      <td className="py-3.5 px-4 font-mono">
                        {std.quizScore !== undefined ? (
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              std.quizPassed
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {std.quizScore}%
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Pending Exam</span>
                        )}
                      </td>

                      {/* Badge / Status */}
                      <td className="py-3.5 px-4">
                        {std.certificateEarned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <Award className="w-3 h-3 text-emerald-400" />
                            Certified Graduate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                            In Progress
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {std.lastActive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
