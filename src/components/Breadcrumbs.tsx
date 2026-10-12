import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Breadcrumbs: React.FC<{ currentCategory?: string; currentPage?: string }> = ({
  currentCategory = 'System Architecture',
  currentPage = 'COURSE OVERVIEW',
}) => {
  const { setActiveTab } = useApp();

  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400 py-3 mb-2" aria-label="Breadcrumb">
      <button
        onClick={() => setActiveTab('catalog')}
        className="hover:text-slate-200 transition-colors"
      >
        Home
      </button>
      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
      <button
        onClick={() => setActiveTab('catalog')}
        className="hover:text-slate-200 transition-colors"
      >
        Courses
      </button>
      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
      <span className="text-slate-400">{currentCategory}</span>
      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
      <span className="text-emerald-400 font-semibold tracking-wider text-[11px]">
        {currentPage}
      </span>
    </nav>
  );
};
