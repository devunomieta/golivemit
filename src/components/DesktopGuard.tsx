'use client';

import React from 'react';
import { Monitor, Smartphone, ShieldAlert } from 'lucide-react';

interface DesktopGuardProps {
  children: React.ReactNode;
}

export const DesktopGuard: React.FC<DesktopGuardProps> = ({ children }) => {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkScreenSize = () => {
      // Enforce desktop viewport threshold (1024px minimum width)
      setIsMobileOrTablet(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Prevent SSR flash
  if (isMobileOrTablet === null) {
    return null;
  }

  if (isMobileOrTablet) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#070A12] text-slate-100 font-sans relative overflow-hidden">
        {/* Ambient Glow Blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-sm p-8 rounded-3xl glass-panel border border-rose-500/30 text-center space-y-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
          <div className="inline-flex p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 glow-rose animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-display tracking-tight">Desktop View Only</h2>
            <p className="text-xs text-rose-200/90 font-medium">
              View allowed on Desktop only
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-3 font-sans">
            <div className="flex items-center justify-center gap-3 text-slate-300">
              <div className="flex items-center gap-1.5 text-rose-400">
                <Smartphone className="w-4 h-4" />
                <span className="line-through">Mobile</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Monitor className="w-4 h-4" />
                <span>Desktop (1024px+)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              GoLive DSS requires a full desktop viewport display.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
