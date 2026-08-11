'use client';

import React from 'react';
import { UserProfile, MOCK_USERS } from '@/lib/mockData';
import { ShieldCheck, UserCheck, ChevronDown, CheckCircle2, LogOut } from 'lucide-react';

interface RoleSwitcherProps {
  activeUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onSignOut?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ activeUser, onUserChange, onSignOut }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-950/60 text-purple-300 border-purple-800/50';
      case 'project_manager': return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50';
      case 'developer': return 'bg-blue-950/60 text-blue-300 border-blue-800/50';
      case 'qa': return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50';
      case 'devops': return 'bg-amber-950/60 text-amber-300 border-amber-800/50';
      case 'security': return 'bg-rose-950/60 text-rose-300 border-rose-800/50';
      case 'business': return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50';
      case 'approver': return 'bg-emerald-900/80 text-emerald-200 border-emerald-600/60';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'project_manager': return 'Project Manager';
      case 'developer': return 'Developer (Engineering Lead)';
      case 'qa': return 'QA Lead';
      case 'devops': return 'DevOps Engineer';
      case 'security': return 'Security Lead';
      case 'business': return 'Product Owner / Business';
      case 'approver': return 'Release Approver Board';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & System Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-['Outfit']">GoLive DSS</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              v1.0-PROD
            </span>
          </div>
          <p className="text-xs text-gray-400">Risk-Based Release Readiness Decision Support</p>
        </div>
      </div>

      {/* Role Switcher Dropdown & Sign Out */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#111827] border border-white/10 hover:border-cyan-500/40 transition-all text-left group"
          >
            <div className="p-1.5 rounded-lg bg-gray-800 text-cyan-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <span>Active Persona:</span>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${getRoleBadgeStyle(activeUser.role)}`}>
                  {getRoleLabel(activeUser.role)}
                </span>
              </div>
              <div className="text-sm font-medium text-white flex items-center justify-between gap-4">
                <span>{activeUser.name}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {/* Dropdown Options */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#1F2937] border border-white/10 shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
              <div className="text-[11px] font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wider">
                Switch Persona Role
              </div>
              <div className="space-y-1">
                {MOCK_USERS.map((user) => {
                  const isSelected = user.id === activeUser.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        onUserChange(user);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-cyan-950/50 border border-cyan-500/30 text-white' 
                          : 'hover:bg-gray-800/80 text-gray-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          {user.name}
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                        <div className="text-[11px] text-gray-400">{user.department}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getRoleBadgeStyle(user.role)}`}>
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
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-rose-950/60 hover:text-rose-400 border border-white/10 text-gray-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
