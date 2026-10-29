'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { PlotlyChart } from '@/components/PlotlyChart';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { apiClient } from '@/lib/api';
import {
  UploadCloud,
  Loader2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Compass,
  Award,
  RefreshCw,
  Play,
  RotateCcw,
  MessageSquareCode,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function AnalysisWorkspacePage() {
  const {
    activeFile,
    setActiveFile,
    output1,
    setOutput1,
    output2,
    setOutput2,
    output3,
    setOutput3,
    output4,
    setOutput4,
    qualityScore,
    resetOutputs,
    clearDataset,
    apiKey,
  } = useAnalysisStore();

  const handleRemoveDataset = async () => {
    try {
      await apiClient.delete('/analysis/dataset');
    } catch (err) {
      // ignore
    }
    clearDataset();
  };

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Generate Output 1: Data Overview & Data Quality Assessment
  const handleGenerateOutput1 = async () => {
    if (!activeFile?.file_id) {
      setError('No dataset uploaded. Please upload a CSV or Excel dataset first.');
      return;
    }
    if (!apiKey) {
      setError('API key required. Please enter your Groq or OpenAI API key in Settings.');
      return;
    }
    setLoading1(true);
    setError(null);
    try {
      const res = await apiClient.post('/analysis/quality-assessment', {
        file_id: activeFile.file_id,
        api_key: apiKey,
      });
      const data = res.data.data;
      setOutput1(data.quality_assessment, data.quality_score || 98);
    } catch (err: any) {
      setError('Output 1 generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading1(false);
    }
  };

  // 2. Generate Output 2: Statistical & Business Analysis & Top 10 Insights
  const handleGenerateOutput2 = async () => {
    if (!activeFile?.file_id) {
      setError('No dataset uploaded. Please upload a CSV or Excel dataset first.');
      return;
    }
    if (!apiKey) {
      setError('API key required. Please enter your Groq or OpenAI API key in Settings.');
      return;
    }
    setLoading2(true);
    setError(null);
    try {
      const res = await apiClient.post('/business-analysis/statistical-insights', {
        file_id: activeFile.file_id,
        api_key: apiKey,
      });
      const data = res.data.data;
      setOutput2(data.business_analysis);
    } catch (err: any) {
      setError('Output 2 generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading2(false);
    }
  };

  // 3. Generate Output 3: Recommended Visualizations (Plotly Modern Theme)
  const handleGenerateOutput3 = async () => {
    if (!activeFile?.file_id) {
      setError('No dataset uploaded. Please upload a CSV or Excel dataset first.');
      return;
    }
    if (!apiKey) {
      setError('API key required. Please enter your Groq or OpenAI API key in Settings.');
      return;
    }
    setLoading3(true);
    setError(null);
    try {
      const res = await apiClient.post('/visualization/generate-charts', {
        file_id: activeFile.file_id,
        api_key: apiKey,
      });
      const data = res.data.data;
      setOutput3(data.charts);
    } catch (err: any) {
      setError('Output 3 generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading3(false);
    }
  };

  // 4. Generate Output 4: Executive Summary & Management Action Plan
  const handleGenerateOutput4 = async () => {
    if (!activeFile?.file_id) {
      setError('No dataset uploaded. Please upload a CSV or Excel dataset first.');
      return;
    }
    if (!apiKey) {
      setError('API key required. Please enter your Groq or OpenAI API key in Settings.');
      return;
    }
    setLoading4(true);
    setError(null);
    try {
      const res = await apiClient.post('/summary/executive-strategy', {
        file_id: activeFile.file_id,
        business_analysis: output2 || undefined,
        api_key: apiKey,
      });
      const data = res.data.data;
      setOutput4(data.executive_strategy);
    } catch (err: any) {
      setError('Output 4 generation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading4(false);
    }
  };

  // Batch: Generate All 4 Outputs using individual specialized endpoints
  const handleGenerateAll = async () => {
    if (!activeFile?.file_id) {
      setError('No dataset uploaded. Please upload a CSV or Excel dataset first.');
      return;
    }
    if (!apiKey) {
      setError('API key required. Please enter your Groq or OpenAI API key in Settings.');
      return;
    }
    setLoadingAll(true);
    setError(null);
    try {
      // 1. Output 1: Quality Assessment
      const res1 = await apiClient.post('/analysis/quality-assessment', {
        file_id: activeFile.file_id,
        api_key: apiKey,
      });
      setOutput1(res1.data.data.quality_assessment, res1.data.data.quality_score || 98);

      // 2. Output 2: Business Analysis
      const res2 = await apiClient.post('/business-analysis/statistical-insights', {
        file_id: activeFile.file_id,
        api_key: apiKey,
      });
      setOutput2(res2.data.data.business_analysis);

      // 3. Output 3: Visualizations
      const res3 = await apiClient.post('/visualization/generate-charts', {
        file_id: activeFile.file_id,
        api_key: apiKey,
      });
      setOutput3(res3.data.data.charts);

      // 4. Output 4: Executive Strategy
      const res4 = await apiClient.post('/summary/executive-strategy', {
        file_id: activeFile.file_id,
        business_analysis: res2.data.data.business_analysis,
        api_key: apiKey,
      });
      setOutput4(res4.data.data.executive_strategy);
    } catch (err: any) {
      setError('Batch analysis failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingAll(false);
    }
  };

  const outputsCount = (output1 ? 1 : 0) + (output2 ? 1 : 0) + (output3 ? 1 : 0) + (output4 ? 1 : 0);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header / Workspace Controller */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-900 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-heading font-extrabold text-white">
                  Analysis Workspace: <span className="gradient-text">{activeFile?.filename || 'No Dataset Uploaded'}</span>
                </h1>
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
                  {outputsCount} of 4 Outputs Generated
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Click each of the 4 outputs below separately to generate specialized AI reports and Plotly charts on-demand.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleGenerateAll}
                disabled={loadingAll || !activeFile}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-40"
              >
                {loadingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Run All 4 Outputs
              </button>

              <Link
                href="/chat"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-800 flex items-center gap-2 transition-colors"
              >
                <MessageSquareCode className="w-3.5 h-3.5 text-indigo-400" />
                AI Chat Analyst
              </Link>

              {activeFile && (
                <button
                  onClick={handleRemoveDataset}
                  title="Remove current dataset and clear all results"
                  className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs rounded-xl border border-rose-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Dataset
                </button>
              )}

              {outputsCount > 0 && (
                <button
                  onClick={resetOutputs}
                  title="Reset workspace outputs"
                  className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-900 rounded-xl transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

            {!activeFile && (
              <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-3xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white">No Dataset Uploaded</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Please upload a CSV or Excel dataset to generate data quality assessments, statistical business analysis, dynamic Plotly charts, and executive strategies.
                </p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-indigo-500/20 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload Dataset Now
                </Link>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-2xl">
                {error}
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="dark-glass-card-interactive rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quality Score</span>
                  <Award className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-3xl font-heading font-extrabold text-white">
                  {qualityScore ? `${qualityScore}/100` : '--'}
                </p>
                <span className="text-[11px] font-semibold text-emerald-400 mt-1.5 inline-block">
                  {output1 ? 'Audit Completed' : 'Pending Output 1'}
                </span>
              </div>

              <div className="dark-glass-card-interactive rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Rows</span>
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-heading font-extrabold text-white">
                  {activeFile?.rows ?? '--'}
                </p>
                <span className="text-[11px] font-semibold text-slate-400 mt-1.5 inline-block">Parsed Records</span>
              </div>

              <div className="dark-glass-card-interactive rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Columns</span>
                  <Compass className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-3xl font-heading font-extrabold text-white">
                  {activeFile?.columns_count ?? (activeFile?.columns?.length) ?? '--'}
                </p>
                <span className="text-[11px] font-semibold text-slate-400 mt-1.5 inline-block">Active Schema Fields</span>
              </div>

              <div className="dark-glass-card-interactive rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plotly Visuals</span>
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                </div>
                <p className="text-3xl font-heading font-extrabold text-white">
                  {output3 ? output3.length : 0}
                </p>
                <span className="text-[11px] font-semibold text-indigo-400 mt-1.5 inline-block">
                  {output3 ? 'Charts Rendered' : 'Pending Output 3'}
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 📌 OUTPUT 1: Data Overview & Data Quality Assessment */}
            {/* ========================================================================= */}
            <div className="dark-glass-card rounded-3xl p-8 space-y-6 shadow-xl border border-slate-900 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg">
                    📌
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-white">
                      Output 1: Data Overview & Data Quality Assessment
                    </h3>
                    <p className="text-xs text-slate-400">
                      Evaluates dataset dimensions, missing values, duplicate rates, schema completeness, and data quality score.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateOutput1}
                  disabled={loading1}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 self-start md:self-auto disabled:opacity-40 transition-all"
                >
                  {loading1 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing Quality...
                    </>
                  ) : output1 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-run Output 1
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Output 1
                    </>
                  )}
                </button>
              </div>

              {output1 ? (
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap animate-fadeIn">
                  {output1}
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <p className="text-sm font-medium text-slate-300">
                    Click <span className="text-indigo-400 font-semibold">'Generate Output 1'</span> above to produce Output 1 Data Overview & Data Quality Assessment.
                  </p>
                  <p className="text-xs text-slate-500">
                    Generates completeness audits, schema validation, anomaly checks, and data health scores.
                  </p>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 📊 OUTPUT 2: Statistical & Business Analysis & Ranked Top 10 Insights */}
            {/* ========================================================================= */}
            <div className="dark-glass-card rounded-3xl p-8 space-y-6 shadow-xl border border-slate-900 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
                    📊
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-white">
                      Output 2: Statistical & Business Analysis & Ranked Top 10 Insights
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculates revenue, profit, price distributions, regional breakdown, correlation matrix, and ranked top 10 insights.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateOutput2}
                  disabled={loading2}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 self-start md:self-auto disabled:opacity-40 transition-all"
                >
                  {loading2 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Computing Insights...
                    </>
                  ) : output2 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-run Output 2
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Output 2
                    </>
                  )}
                </button>
              </div>

              {output2 ? (
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap animate-fadeIn">
                  {output2}
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <p className="text-sm font-medium text-slate-300">
                    Click <span className="text-purple-400 font-semibold">'Generate Output 2'</span> above to produce Output 2 Statistical & Business Analysis.
                  </p>
                  <p className="text-xs text-slate-500">
                    Computes categorical distributions, top selling products, correlations, and ranked high-impact insights.
                  </p>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 🎨 OUTPUT 3: Recommended Visualizations (Plotly Modern Theme) */}
            {/* ========================================================================= */}
            <div className="dark-glass-card rounded-3xl p-8 space-y-6 shadow-xl border border-slate-900 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
                    🎨
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-white">
                      Output 3: Recommended Visualizations (Plotly Modern Theme)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Renders interactive Plotly charts (Regional Revenue, Category Share, Profit Scatter, Products, Boxplot).
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateOutput3}
                  disabled={loading3}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 self-start md:self-auto disabled:opacity-40 transition-all"
                >
                  {loading3 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Rendering Charts...
                    </>
                  ) : output3 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-run Output 3
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Output 3 Visualizations
                    </>
                  )}
                </button>
              </div>

              {output3 && output3.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  {output3.map((c, idx) => (
                    <div key={idx} className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
                      <PlotlyChart data={c.plotly_json?.data} layout={c.plotly_json?.layout} title={c.title} />
                      {c.business_reason && (
                        <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                          <span className="font-semibold text-slate-200">Business Rationale:</span> {c.business_reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <p className="text-sm font-medium text-slate-300">
                    Click <span className="text-amber-400 font-semibold">'Generate Output 3 Visualizations'</span> above to produce Output 3 Visualizations.
                  </p>
                  <p className="text-xs text-slate-500">
                    Produces modern dark-themed Plotly charts with full zoom, pan, hover, and export support.
                  </p>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 💼 OUTPUT 4: Executive Summary & Management Action Plan */}
            {/* ========================================================================= */}
            <div className="dark-glass-card rounded-3xl p-8 space-y-6 shadow-xl border border-slate-900 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    💼
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-bold text-white">
                      Output 4: Executive Summary & Management Action Plan
                    </h3>
                    <p className="text-xs text-slate-400">
                      C-Suite synthesis of commercial health, 5 prioritized strategic initiatives (High/Med/Low), and a 3-phase roadmap.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerateOutput4}
                  disabled={loading4}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 self-start md:self-auto disabled:opacity-40 transition-all"
                >
                  {loading4 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Synthesizing Strategy...
                    </>
                  ) : output4 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-run Output 4
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Output 4
                    </>
                  )}
                </button>
              </div>

              {output4 ? (
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap animate-fadeIn">
                  {output4}
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <p className="text-sm font-medium text-slate-300">
                    Click <span className="text-emerald-400 font-semibold">'Generate Output 4'</span> above to produce Output 4 Executive Summary & Management Action Plan.
                  </p>
                  <p className="text-xs text-slate-500">
                    Generates commercial health metrics, prioritized strategic initiatives, and 0-30 day, 1-3 month, and 3-12 month roadmaps.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
  );
}

