'use client';

import React from 'react';
import { Search, ShieldCheck } from 'lucide-react';

export function Navbar() {
  return (
    <header className="h-16 bg-slate-950/70 border-b border-slate-900/80 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96 bg-slate-900/40 px-3.5 py-2 rounded-xl border border-slate-900 focus-within:border-indigo-500/40 focus-within:bg-slate-900/60 focus-within:ring-1 focus-within:ring-indigo-500/40 transition-all duration-300">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search analyses, datasets, insights..."
          className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Action Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>FastAPI Engine Active</span>
        </div>
      </div>
    </header>
  );
}
