'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Code2, Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { ChatMessage } from '@/types';

export function ChatInterface() {
  const { activeFile, apiKey, messages, addMessage, sessionId } = useAnalysisStore();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'strategic' | 'code'>('code');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!activeFile) {
      addMessage({
        role: 'assistant',
        content: '⚠️ No dataset uploaded. Please upload a CSV or Excel dataset first before chatting with the AI Analyst.',
        timestamp: Date.now(),
      });
      return;
    }

    if (!apiKey) {
      addMessage({
        role: 'assistant',
        content: '⚠️ API key required. Please enter your Groq or OpenAI API key in Settings before chatting.',
        timestamp: Date.now(),
      });
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/chat', {
        question: currentInput,
        file_id: activeFile.file_id,
        mode: mode,
        api_key: apiKey,
      });

      const assistantMsg = res.data.data.message;
      addMessage(assistantMsg);
    } catch (err: any) {
      addMessage({
        role: 'assistant',
        content: 'Sorry, an error occurred while generating the response: ' + (err.response?.data?.detail || err.message || 'Unknown error'),
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] dark-glass-card rounded-3xl shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-900 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-sm">Autonomous AI Analyst</h3>
            <p className="text-[11px] text-slate-400">
              Active Dataset: <span className="font-medium text-indigo-400">{activeFile?.filename || 'None (Upload required)'}</span>
            </p>
          </div>
        </div>

        {/* Header Actions: Mode Selector */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-900 text-[11px] font-semibold gap-1">
            <button
              onClick={() => setMode('code')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mode === 'code' ? 'bg-slate-900 text-indigo-400 shadow-sm border border-slate-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Option 1: Python Engine
            </button>
            <button
              onClick={() => setMode('strategic')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mode === 'strategic' ? 'bg-slate-900 text-indigo-400 shadow-sm border border-slate-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Option 2: Strategic Q&A
            </button>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-950/10">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20 text-indigo-200 rounded-br-none shadow-md'
                  : 'bg-slate-900/60 text-slate-200 rounded-bl-none border border-slate-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.code && (
                <div className="mt-3 bg-slate-950/90 text-indigo-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-900">
                  <p className="text-[9px] text-slate-500 font-sans mb-1 uppercase tracking-wider font-semibold">Executable Code:</p>
                  <code>{msg.code}</code>
                </div>
              )}

              {msg.execution_result && (
                <div className="mt-2 bg-emerald-950/20 text-emerald-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto border border-emerald-900/40">
                  <p className="text-[9px] text-emerald-500 font-sans mb-1 uppercase tracking-wider font-semibold">Result Output:</p>
                  <code>{msg.execution_result}</code>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-indigo-400 text-[11px] font-semibold pl-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing query with Groq LLM...
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 bg-slate-900/30 p-2 rounded-2xl border border-slate-900 focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/40 shadow-sm transition-all duration-300"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'code'
                ? 'Ask for python computation e.g. "What is average revenue by region?"'
                : 'Ask strategic business questions about dataset...'
            }
            className="flex-1 px-4 py-2 bg-transparent text-xs focus:outline-none text-slate-200 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
