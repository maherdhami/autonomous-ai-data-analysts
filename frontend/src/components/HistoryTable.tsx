'use client';

import React from 'react';
import { Eye, Trash2, Calendar, FileText, Award } from 'lucide-react';
import { AnalysisData } from '@/types';
import { useRouter } from 'next/navigation';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { apiClient } from '@/lib/api';

interface HistoryTableProps {
  items: AnalysisData[];
}

export function HistoryTable({ items }: HistoryTableProps) {
  const router = useRouter();
  const { setActiveAnalysis, setHistory } = useAnalysisStore();

  const handleView = (analysis: AnalysisData) => {
    setActiveAnalysis(analysis);
    router.push(`/analysis/${analysis.analysis_id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/analysis/${id}`);
      setHistory(items.filter((item) => item.analysis_id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="dark-glass-card rounded-3xl p-12 text-center">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-lg font-heading font-bold text-white">No Analysis History Found</h3>
        <p className="text-sm text-slate-400 mt-1">Upload a dataset to run your first autonomous AI analysis.</p>
      </div>
    );
  }

  return (
    <div className="dark-glass-card rounded-3xl border border-slate-900/80 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-heading font-bold uppercase text-[10px] tracking-wider border-b border-slate-900">
            <tr>
              <th className="px-6 py-4">Dataset Name</th>
              <th className="px-6 py-4">Quality Score</th>
              <th className="px-6 py-4">Rows / Cols</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/50">
            {items.map((item) => (
              <tr
                key={item.analysis_id}
                onClick={() => handleView(item)}
                className="hover:bg-slate-900/30 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 font-semibold text-slate-200 flex items-center gap-2 group-hover:text-white transition-colors">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  {item.file_metadata.filename}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 inline-flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {item.quality_score}/100
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {item.file_metadata.rows} rows • {item.file_metadata.columns_count} cols
                </td>
                <td className="px-6 py-4 text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(item.created_at * 1000).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(item);
                    }}
                    className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(item.analysis_id, e)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
