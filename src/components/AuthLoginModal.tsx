'use client';

import React from 'react';
import { UserProfile, MOCK_USERS } from '@/lib/mockData';
import { ShieldCheck, LogIn, Lock, Mail, AlertCircle, KeyRound } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md p-8 rounded-2xl glass-card border border-white/10 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">GoLive DSS Sign In</h2>
          <p className="text-xs text-gray-400">Enterprise Risk-Based Release Readiness DSS</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-300 font-medium">Work Email Address</label>
            <div className="flex items-center gap-2 bg-[#111827] p-3 rounded-xl border border-white/10 focus-within:border-cyan-500/50 transition-all">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-300 font-medium">Password</label>
            <div className="flex items-center gap-2 bg-[#111827] p-3 rounded-xl border border-white/10 focus-within:border-cyan-500/50 transition-all">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate Session</span>
            </button>

            {/* Disabled Sign Up Button Notice */}
            <div className="relative flex items-center justify-center pt-2">
              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl bg-gray-900/40 border border-white/5 text-gray-500 text-xs font-medium cursor-not-allowed flex items-center justify-center gap-2 group relative"
              >
                <KeyRound className="w-3.5 h-3.5 text-gray-600" />
                <span>Account Registration (Disabled in MVP)</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quick Test Accounts Persona Selector */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">
            Quick Select Test Account Persona:
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handlePersonaSelect(user.id)}
                className={`p-2 rounded-lg text-left text-[11px] border transition-all ${
                  selectedPersonaId === user.id
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                    : 'bg-gray-900/50 border-white/5 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="font-semibold truncate">{user.name.split(' ')[0]} ({user.role})</div>
                <div className="text-[9px] text-gray-500 font-mono truncate">{user.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
