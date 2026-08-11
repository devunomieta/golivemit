'use client';

import React from 'react';
import { UserProfile, MOCK_USERS } from '@/lib/mockData';
import { ShieldCheck, UserCheck, ChevronDown, CheckCircle2, LogOut } from 'lucide-react';

interface RoleSwitcherProps {
  activeUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onSignOut?: () => void;
  availableUsers?: UserProfile[];
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ 
  activeUser, 
  onUserChange, 
  onSignOut,
  availableUsers = MOCK_USERS 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'project_manager': return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
      case 'developer': return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
      case 'qa': return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'devops': return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'security': return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'business': return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60';
      case 'approver': return 'bg-teal-950/80 text-teal-300 border-teal-700/60';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'project_manager': return 'Project Manager';
      case 'developer': return 'Developer Lead';
      case 'qa': return 'QA Lead';
      case 'devops': return 'DevOps Engineer';
      case 'security': return 'Security Lead';
      case 'business': return 'Product Owner / Business';
      case 'approver': return 'Release Approver Board';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070A12]/85 backdrop-blur-2xl px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & System Title */}
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-400 glow-cyan">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white font-display">GoLive DSS</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-cyan-950/90 text-cyan-400 border border-cyan-700/60 font-semibold">
              v1.0-PROD
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Risk-Based Release Readiness Decision Support</p>
        </div>
      </div>

      {/* Persona Switcher & Session Controls */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 transition-all text-left cursor-pointer shadow-lg"
          >
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-semibold">
                <span>Persona:</span>
                <span className={`px-2 py-0.2 rounded border font-mono font-bold ${getRoleBadgeStyle(activeUser.role)}`}>
                  {getRoleLabel(activeUser.role)}
                </span>
              </div>
              <div className="text-xs font-bold text-white flex items-center justify-between gap-3 font-sans">
                <span>{activeUser.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2.5 z-50 max-h-96 overflow-y-auto">
              <div className="text-[10px] font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                Switch Persona Context
              </div>
              <div className="space-y-1">
                {availableUsers.map((user) => {
                  const isSelected = user.id === activeUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onUserChange(user);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-950/70 border border-cyan-500/50 text-white font-medium ring-1 ring-cyan-500/30' 
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {user.name}
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">{user.department}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-semibold ${getRoleBadgeStyle(user.role)}`}>
                        {user.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Sign Out Session"
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-rose-950/80 hover:text-rose-400 border border-slate-700 hover:border-rose-700/60 text-slate-400 transition-all cursor-pointer shadow-lg"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </header>
  );
};
