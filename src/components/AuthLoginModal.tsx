'use client';

import React from 'react';
import { UserProfile, MOCK_USERS } from '@/lib/mockData';
import { ShieldCheck, LogIn, Lock, Mail, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

interface AuthLoginModalProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = React.useState('admin@golive.io');
  const [password, setPassword] = React.useState('password123');
  const [selectedPersonaId, setSelectedPersonaId] = React.useState(MOCK_USERS[0].id);
  const [errorMsg, setErrorMsg] = React.useState('');

  const handlePersonaSelect = (userId: string) => {
    setSelectedPersonaId(userId);
    const persona = MOCK_USERS.find((u) => u.id === userId);
    if (persona) {
      setEmail(persona.email);
      setPassword('password123');
      setErrorMsg('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      onLoginSuccess(user);
    } else {
      setErrorMsg('Invalid email or password. Please select one of the authorized test accounts below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A12]/90 backdrop-blur-2xl">
      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg p-8 lg:p-10 rounded-3xl glass-panel border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 glow-cyan mb-1">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">GoLive DSS</h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">Enterprise Risk-Based Release Readiness Decision Support</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Work Email Address</label>
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-3 rounded-2xl border border-slate-700/80 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Password</label>
            <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-3 rounded-2xl border border-slate-700/80 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none w-full font-sans"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate Session</span>
            </button>

            {/* Disabled Sign Up Button */}
            <button
              type="button"
              disabled
              className="w-full py-2.5 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500 text-xs font-medium cursor-not-allowed flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              <span>Account Registration (Disabled in MVP)</span>
            </button>
          </div>
        </form>

        {/* Persona Selector */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Select Test Account Persona</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
            {MOCK_USERS.map((user) => {
              const isSelected = selectedPersonaId === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handlePersonaSelect(user.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-500/60 text-white ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white truncate">{user.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-cyan-400/90 font-mono capitalize">{user.role.replace('_', ' ')}</div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{user.email}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
