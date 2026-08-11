'use client';

import Link from 'next/link';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#070A12] text-slate-100 font-sans relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg p-8 sm:p-10 rounded-3xl glass-panel border border-white/10 text-center space-y-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Icon & Error Code */}
        <div className="space-y-3">
          <div className="inline-flex p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 glow-rose animate-bounce">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
              HTTP 404 Exception
            </span>
            <h1 className="text-4xl font-black text-white tracking-tight font-display mt-1">
              Page Not Found
            </h1>
          </div>
        </div>

        {/* Message Explanation */}
        <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
          The governance route or resource you are looking for does not exist, has been moved, or is restricted within the GoLive DSS framework.
        </p>

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Command Center</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
