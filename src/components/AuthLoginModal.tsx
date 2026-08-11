'use client';

import React from 'react';
import { UserProfile, MOCK_USERS } from '@/lib/mockData';
import { ShieldCheck, LogIn, Lock, Mail, AlertCircle, KeyRound, Sparkles, Eye, EyeOff } from 'lucide-react';

interface AuthLoginModalProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = React.useState(MOCK_USERS[0].email);
  const [password, setPassword] = React.useState('password123');
  const [showPassword, setShowPassword] = React.useState(false);
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
      setErrorMsg('Invalid credentials. Select a persona below.');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-3 bg-[#070A12] relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-3">
        {/* Compact Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 glow-cyan">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight font-display">GoLive DSS</h2>
            <p className="text-[10px] text-slate-400 font-medium">Enterprise Release Readiness Support System</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-2.5">
          <div className="space-y-0.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Work Email</label>
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/80 focus-within:border-cyan-500 transition-all">
              <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-sans"
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Password</label>
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-700/80 focus-within:border-cyan-500 transition-all">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-cyan-400 transition-colors focus:outline-none shrink-0 cursor-pointer"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 pt-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Authenticate Session</span>
            </button>

            <button
              type="button"
              disabled
              className="w-full py-1.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500 text-[10px] font-medium cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3 h-3 text-slate-600" />
              <span>Account Registration (Disabled in MVP)</span>
            </button>
          </div>
        </form>

        {/* Quick Select Persona Dropdown */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-cyan-400">
              <Sparkles className="w-3 h-3" />
              <span>Select Test Persona</span>
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedPersonaId}
              onChange={(e) => handlePersonaSelect(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
            >
              {MOCK_USERS.map((user) => (
                <option key={user.id} value={user.id} className="bg-slate-900 text-white py-1">
                  {user.name} ({user.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
