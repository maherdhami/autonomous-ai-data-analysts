'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { AnalysisCards } from '@/components/AnalysisCards';
import { PlotlyChart } from '@/components/PlotlyChart';
import { AnalysisData } from '@/types';
import { apiClient } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await apiClient.get(`/analysis/${id}`);
        setAnalysis(res.data.data);
      } catch (err) {
        console.error('Failed to fetch analysis details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      fetchDetails();
    }
  }, [id]);

  return (
    <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-96 text-indigo-400 font-semibold gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                Retrieving Analysis Record...
              </div>
            ) : !analysis ? (
              <div className="dark-glass-card rounded-3xl p-12 text-center shadow-2xl">
                <h3 className="text-xl font-heading font-bold text-white">Analysis Record Not Found</h3>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between bg-slate-900/40 p-6 rounded-2xl border border-slate-900 shadow-xl backdrop-blur-md">
                  <div>
                    <h1 className="text-2xl font-heading font-extrabold text-white">
                      Dataset Report: <span className="gradient-text">{analysis.file_metadata.filename}</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Analysis ID: {analysis.analysis_id} • Created on {new Date(analysis.created_at * 1000).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href="/chat"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-800 transition-colors"
                  >
                    Ask AI Analyst Questions
                  </Link>
                </div>

                <AnalysisCards analysis={analysis} />

                {analysis.charts && analysis.charts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                      <span>🎨</span>
                      <span>Output 3: Recommended Visualizations (Plotly Modern Theme)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysis.charts.map((c, idx) => (
                        <div key={idx} className="space-y-2">
                          <PlotlyChart data={c.plotly_json?.data} layout={c.plotly_json?.layout} title={c.title} />
                          {c.business_reason && (
                            <p className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-900">
                              <span className="font-semibold text-slate-300">Business Rationale:</span> {c.business_reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
  );
}
