/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './components/CatalogPage';
import { CourseDetailPage } from './components/CourseDetailPage';
import { LearnPage } from './components/LearnPage';
import { QuizPage } from './components/QuizPage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, toasts } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'catalog' && <CatalogPage />}
        {activeTab === 'detail' && <CourseDetailPage />}
        {activeTab === 'learn' && <LearnPage />}
        {activeTab === 'quiz' && <QuizPage />}
        {activeTab === 'admin' && <AdminDashboardPage />}
        {activeTab === 'python_code' && <PythonCodeViewer />}
      </main>

      <Footer />
      <AuthModal />
      <CommandPalette />

      {/* Floating Toast Alerts */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 px-4 rounded-xl text-xs font-semibold shadow-2xl border flex items-center gap-2.5 pointer-events-auto transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40'
                : toast.type === 'warn'
                ? 'bg-slate-900 text-rose-300 border-rose-500/40 shadow-rose-950/40'
                : 'bg-slate-900 text-blue-300 border-blue-500/40 shadow-blue-950/40'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'warn' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
