import React from 'react';
import { useApp } from '../context/AppContext';
import { Code2, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">Clarity LMS</span>
          <span>© 2026 Clarity Learning Systems. All rights reserved.</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className="hover:text-white transition-colors"
          >
            Course Catalog
          </button>
          <button
            onClick={() => setActiveTab('detail')}
            className="hover:text-white transition-colors"
          >
            Syllabus
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className="hover:text-white transition-colors"
          >
            Academic Integrity &amp; Certificates
          </button>
          <button
            onClick={() => setActiveTab('python_code')}
            className="hover:text-blue-400 text-blue-400/90 font-semibold transition-colors flex items-center gap-1"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Source</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
