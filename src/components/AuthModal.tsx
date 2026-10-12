import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, UserCheck, Sparkles, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, switchRole, currentUser, showToast } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Successfully logged in as ${email || currentUser.name}!`, 'success');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              {authMode === 'login' ? 'Sign In to Clarity LMS' : 'Create Student Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Access your enrolled courses and verified certificates.
            </p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick 1-Click Profile Switcher */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick 1-Click Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                switchRole('student');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-xs transition-colors"
            >
              <p className="font-bold text-white flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Alex Morgan
              </p>
              <p className="text-[10px] text-slate-400">Student Profile</p>
            </button>
            <button
              onClick={() => {
                switchRole('instructor');
                setIsAuthModalOpen(false);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-xs transition-colors"
            >
              <p className="font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Dr. Sarah Chen
              </p>
              <p className="text-[10px] text-slate-400">Instructor / Staff</p>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@systems.eng"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md"
          >
            {authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-slate-400">
          {authMode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="text-blue-400 font-semibold hover:underline"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-blue-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
