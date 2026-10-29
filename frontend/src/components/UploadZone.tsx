'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useRouter } from 'next/navigation';

export function UploadZone() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setActiveFile, clearDataset } = useAnalysisStore();
  const router = useRouter();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    clearDataset(); // Prevent any stale results while uploading

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 1. Upload File
      const uploadRes = await apiClient.post('/analysis/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileData = uploadRes.data.data;
      setActiveFile(fileData);
      
      // Navigate to analysis workspace for individual on-demand output generation
      router.push('/analysis');
    } catch (err: any) {
      clearDataset();
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto dark-glass-card rounded-3xl p-8 shadow-2xl">
      <h2 className="text-xl font-heading font-bold text-white mb-2 flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-indigo-400" />
        Upload Dataset for Autonomous AI Analysis
      </h2>
      <p className="text-xs text-slate-400 mb-6">
        Upload CSV, Excel, or Parquet datasets up to 50MB to receive instant data quality scores, BI statistical insights, and executive action plans.
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/10 hover:bg-slate-900/30 rounded-2xl p-8 text-center transition-all cursor-pointer group"
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.parquet"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input" className="cursor-pointer block">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
            <FileText className="w-8 h-8" />
          </div>
          {file ? (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-200">{file.name}</p>
              <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-300">
                Drag & Drop dataset file here or <span className="text-indigo-400 hover:text-indigo-300 transition-colors underline">Browse</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Supports CSV, XLSX, Parquet</p>
            </div>
          )}
        </label>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        disabled={!file || isUploading}
        onClick={handleUploadAndAnalyze}
        className="mt-6 w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-heading font-semibold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all duration-200"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            Analyzing Dataset with AI Models...
          </>
        ) : (
          <>
            Ingest Dataset & Open Workspace
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
