'use client';

import React from 'react';
import { Loader2, UserCheck, Folder, Layers } from 'lucide-react';

interface LoadingOverlayProps {
  type: 'persona' | 'project' | 'release' | null;
  targetName?: string;
  onFinished?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ type, targetName }) => {
  if (!type) return null;

  const isPersona = type === 'persona';
  const isProject = type === 'project';
  const isRelease = type === 'release';

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-200 animate-in fade-in">
      <div className="flex flex-col items-center p-8 rounded-3xl bg-[#0B0F19]/90 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] max-w-sm w-full mx-4 text-center space-y-4">
        
        {/* Animated Glow Ring & Spinner Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 blur-lg opacity-40 animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-cyan-500/50 flex items-center justify-center relative shadow-xl">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-cyan-400 text-cyan-300">
              {isPersona && <UserCheck className="w-3.5 h-3.5" />}
              {isProject && <Folder className="w-3.5 h-3.5" />}
              {isRelease && <Layers className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white tracking-wide font-display">
            {isPersona && 'Switching Persona Account...'}
            {isProject && 'Switching Project Context...'}
            {isRelease && 'Loading Target Release...'}
          </h3>
          {targetName && (
            <p className="text-xs font-semibold text-cyan-400 truncate max-w-[260px]">
              {targetName}
            </p>
          )}
          <p className="text-[11px] text-slate-400 font-mono">
            Loading governance state & permissions...
          </p>
        </div>

        {/* Mini loader bar */}
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-full animate-pulse" />
        </div>

      </div>
    </div>
  );
};
