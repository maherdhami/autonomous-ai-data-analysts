'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { HistoryTable } from '@/components/HistoryTable';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { apiClient } from '@/lib/api';

export default function HistoryPage() {
  const { history, setHistory } = useAnalysisStore();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await apiClient.get('/analysis/history');
        if (res.data?.data) {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch analysis history:', err);
      }
    }
    fetchHistory();
  }, [setHistory]);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-white">Analysis Project History</h1>
            <p className="text-sm text-slate-400 mt-1">Review or inspect active session analysis projects.</p>
          </div>
          <HistoryTable items={history} />
        </main>
      </div>
    </div>
  );
}
