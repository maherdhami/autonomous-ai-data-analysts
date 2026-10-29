'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { 
  UploadCloud, 
  Sparkles, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  FileSpreadsheet, 
  CheckCircle2, 
  TrendingUp, 
  PieChart 
} from 'lucide-react';
import { useAnalysisStore } from '@/store/useAnalysisStore';

export default function DashboardPage() {
  const { activeFile } = useAnalysisStore();

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-indigo-950/20 via-slate-900/30 to-purple-950/10 border border-slate-900 shadow-xl rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                FastAPI + Next.js Data Analyst Engine
              </div>
              <h1 className="text-3xl font-heading font-extrabold text-white leading-tight">
                Autonomous AI Data Analyst <span className="gradient-text">Studio</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload raw business datasets, auto-generate quality audits, compute statistical BI metrics, render dynamic Plotly visualizations, and execute executive strategy roadmaps.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/upload"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-heading font-semibold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all duration-200"
                >
                  <UploadCloud className="w-5 h-5" />
                  Upload Dataset
                </Link>
                <Link
                  href="/chat"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-heading font-semibold rounded-2xl border border-slate-800 flex items-center gap-2 transition-all duration-200"
                >
                  Launch AI Chat
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* KPI Badge Card */}
            <div className="bg-gradient-to-br from-slate-900/80 to-indigo-950/40 border border-indigo-500/20 text-slate-100 p-6 rounded-2xl shadow-2xl w-full md:w-80 space-y-4 shadow-indigo-500/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase">Engine Specs</span>
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">FastAPI Engine</p>
                <p className="text-xs text-slate-400 mt-0.5">Python 3.12 + Groq LLM</p>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs font-medium">
                <span className="text-slate-400">Architecture</span>
                <span className="text-emerald-400 font-semibold">Stateless & Secure</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="dark-glass-card-interactive rounded-2xl p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Dataset</p>
                <p className="text-lg font-heading font-extrabold text-white mt-0.5 truncate">
                  {activeFile ? activeFile.filename : 'No File Uploaded'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeFile ? `${activeFile.rows.toLocaleString()} rows • ${activeFile.columns_count} columns` : 'Upload CSV / Excel to begin'}
                </p>
              </div>
            </div>

            <div className="dark-glass-card-interactive rounded-2xl p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Privacy & Storage</p>
                <p className="text-lg font-heading font-extrabold text-white mt-0.5">Zero Persistence</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No database or history saved</p>
              </div>
            </div>

            <div className="dark-glass-card-interactive rounded-2xl p-6 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Provider</p>
                <p className="text-lg font-heading font-extrabold text-white mt-0.5">Groq / Llama 3.1 8B</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Sub-second inference speed</p>
              </div>
            </div>
          </div>

          {/* Core Analytics Modules Grid */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-heading font-bold text-white">Core Analytics Capabilities</h2>
              <p className="text-xs text-slate-400 mt-1">Four distinct enterprise analysis layers computed on demand.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="dark-glass-card rounded-2xl p-6 space-y-3 border border-slate-900 hover:border-indigo-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-white text-base">1. Quality Audit</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatic data hygiene audit scanning missing values, structural types, duplicate records, and health scoring.
                </p>
              </div>

              <div className="dark-glass-card rounded-2xl p-6 space-y-3 border border-slate-900 hover:border-purple-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-white text-base">2. Business Insights</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Comprehensive statistical profiling, key drivers, distribution analysis, and business metric interpretations.
                </p>
              </div>

              <div className="dark-glass-card rounded-2xl p-6 space-y-3 border border-slate-900 hover:border-cyan-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-white text-base">3. Visualizations</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive Plotly dashboards automatically synthesized from numerical and categorical column distributions.
                </p>
              </div>

              <div className="dark-glass-card rounded-2xl p-6 space-y-3 border border-slate-900 hover:border-emerald-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-white text-base">4. Executive Roadmap</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Actionable strategic recommendations, operational optimizations, and growth initiatives tailored to the dataset.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
