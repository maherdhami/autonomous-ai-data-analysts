'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BarChart3, 
  MessageSquareCode, 
  Settings, 
  Zap 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Upload', href: '/upload', icon: UploadCloud },
  { name: 'Analysis Results', href: '/analysis', icon: BarChart3 },
  { name: 'AI Chat Analyst', href: '/chat', icon: MessageSquareCode },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-900/80 text-slate-300 flex flex-col h-screen sticky top-0 z-30 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-900/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-white text-lg leading-tight">AI Analyst</h1>
          <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Enterprise Intelligence</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold'
                  : 'border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Engine Status Footer (No Sign Out / Auth) */}
      <div className="p-4 border-t border-slate-900/80 bg-slate-950/80">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-900/40 rounded-xl border border-slate-900">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-slate-400">FastAPI Engine Ready</span>
        </div>
      </div>
    </aside>
  );
}
