'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { Key, Sparkles, Save, Check } from 'lucide-react';
import { useAnalysisStore } from '@/store/useAnalysisStore';

export default function SettingsPage() {
  const { apiKey, setApiKey } = useAnalysisStore();
  const [localKey, setLocalKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 space-y-8 max-w-4xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-white">Platform Settings</h1>
            <p className="text-sm text-slate-400 mt-1">Configure AI API keys and model parameters.</p>
          </div>

          {/* Engine Info */}
          <div className="dark-glass-card rounded-3xl p-8 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-bold text-white border-b border-slate-900 pb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Autonomous Engine Status
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engine Mode</label>
                <p className="font-semibold text-slate-200 mt-0.5">FastAPI + Next.js (Zero-Auth, In-Memory)</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default LLM Model</label>
                <p className="font-semibold text-slate-200 mt-0.5">Groq Llama-3.1 8B Instant</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Architecture</label>
                <p className="font-semibold text-slate-200 mt-0.5">Stateless API Execution</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data Persistence</label>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20">
                  Zero History / Zero Memory
                </span>
              </div>
            </div>
          </div>

          {/* API Credentials */}
          <form onSubmit={handleSave} className="dark-glass-card rounded-3xl p-8 shadow-2xl space-y-6">
            <h3 className="text-lg font-heading font-bold text-white border-b border-slate-900 pb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              AI Model API Credentials
            </h3>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Groq / OpenAI API Key (Required)
              </label>
              <input
                type="password"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="gsk_... or sk-..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-900 focus:border-indigo-500/40 text-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all duration-300"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Enter your Groq (gsk_...) or OpenAI (sk-...) API key to power analysis and chat.
              </p>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all duration-200"
            >
              {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'Key Saved Successfully' : 'Save Settings'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
