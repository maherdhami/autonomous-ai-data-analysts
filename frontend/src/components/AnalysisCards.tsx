'use client';

import React from 'react';
import { ShieldCheck, TrendingUp, Compass, Award } from 'lucide-react';
import { AnalysisData } from '@/types';

interface AnalysisCardsProps {
  analysis: AnalysisData;
}

export function AnalysisCards({ analysis }: AnalysisCardsProps) {
  return (
    <div className="space-y-8">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="dark-glass-card-interactive rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quality Score</span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-heading font-extrabold text-white">{analysis.quality_score}/100</p>
          <span className="text-[11px] font-semibold text-emerald-400 mt-1.5 inline-block">High Data Quality</span>
        </div>

        <div className="dark-glass-card-interactive rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Rows</span>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-heading font-extrabold text-white">{analysis.file_metadata.rows}</p>
          <span className="text-[11px] font-semibold text-slate-400 mt-1.5 inline-block">Parsed Records</span>
        </div>

        <div className="dark-glass-card-interactive rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Columns</span>
            <Compass className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-heading font-extrabold text-white">{analysis.file_metadata.columns_count}</p>
          <span className="text-[11px] font-semibold text-slate-400 mt-1.5 inline-block">Active Fields</span>
        </div>

        <div className="dark-glass-card-interactive rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Charts Generated</span>
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-heading font-extrabold text-white">{analysis.charts.length}</p>
          <span className="text-[11px] font-semibold text-indigo-400 mt-1.5 inline-block">AI Plotly Visuals</span>
        </div>
      </div>

      {/* Structured Analytical Sections */}
      <div className="dark-glass-card rounded-3xl p-8 space-y-6">
        <h3 className="text-lg font-heading font-bold text-white border-b border-slate-900 pb-4 flex items-center gap-2">
          <span>📌</span>
          <span>Output 1: Data Overview & Data Quality Assessment</span>
        </h3>
        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {analysis.quality_assessment}
        </div>
      </div>

      <div className="dark-glass-card rounded-3xl p-8 space-y-6">
        <h3 className="text-lg font-heading font-bold text-white border-b border-slate-900 pb-4 flex items-center gap-2">
          <span>📊</span>
          <span>Output 2: Statistical & Business Analysis & Ranked Top 10 Insights</span>
        </h3>
        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {analysis.business_analysis}
        </div>
      </div>

      <div className="dark-glass-card rounded-3xl p-8 space-y-6">
        <h3 className="text-lg font-heading font-bold text-white border-b border-slate-900 pb-4 flex items-center gap-2">
          <span>💼</span>
          <span>Output 4: Executive Summary & Management Action Plan</span>
        </h3>
        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {analysis.executive_strategy}
        </div>
      </div>
    </div>
  );
}
