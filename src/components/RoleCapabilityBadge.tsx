'use client';

import React from 'react';
import { UserRole } from '@/lib/scoringEngine';
import { 
  ShieldCheck, 
  Lock, 
  FileEdit, 
  Vote, 
  FolderKanban 
} from 'lucide-react';

interface RoleCapabilityBadgeProps {
  userRole: UserRole;
  userName: string;
}

export const RoleCapabilityBadge: React.FC<RoleCapabilityBadgeProps> = ({
  userRole,
  userName,
}) => {
  const getCapabilities = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          title: 'System Administrator',
          description: 'Full Governance Authority: Full CRUD on Projects/Releases, Criteria management, Assessment scoring, Evidence verification & Board Voting.',
          canManageForms: true,
          canVote: true,
          canVerifyEvidence: true,
          assignedDomains: 'All 10 Domains',
          badgeColor: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
        };
      case 'project_manager':
        return {
          title: 'Project Manager',
          description: 'Release Delivery Lead: Manage Projects & Releases, Customize criteria forms, Assign domain owners & Verify evidence. (Sign-off voting restricted to Board).',
          canManageForms: true,
          canVote: false,
          canVerifyEvidence: true,
          assignedDomains: 'Co-evaluator (All)',
          badgeColor: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
        };
      case 'approver':
        return {
          title: 'Release Approver Board',
          description: 'Executive Authority: Authorize final Go / Conditional Go / No-Go governance decisions with digital signature & cryptographic block stamping.',
          canManageForms: false,
          canVote: true,
          canVerifyEvidence: true,
          assignedDomains: 'Governance Sign-Off',
          badgeColor: 'border-teal-500/40 bg-teal-950/40 text-teal-300',
        };
      case 'developer':
        return {
          title: 'Engineering / Dev Lead',
          description: 'Contributor: Evaluate Functional & Data Readiness criteria. Mandatory evidence upload required for all updates.',
          canManageForms: false,
          canVote: false,
          canVerifyEvidence: false,
          assignedDomains: 'Functional & Data Readiness',
          badgeColor: 'border-blue-500/40 bg-blue-950/40 text-blue-300',
        };
      case 'qa':
        return {
          title: 'QA Lead',
          description: 'Contributor: Evaluate Defect Readiness & Performance SLA criteria. Mandatory evidence upload required for all updates.',
          canManageForms: false,
          canVote: false,
          canVerifyEvidence: false,
          assignedDomains: 'Defect & Performance Readiness',
          badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
        };
      case 'devops':
        return {
          title: 'DevOps & Infra Lead',
          description: 'Contributor: Evaluate Deployment Readiness & Rollback script criteria. Mandatory evidence upload required for all updates.',
          canManageForms: false,
          canVote: false,
          canVerifyEvidence: false,
          assignedDomains: 'Deployment & Operational Readiness',
          badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
        };
      case 'security':
        return {
          title: 'Information Security Lead',
          description: 'Contributor: Evaluate Security & Compliance criteria (SAST/DAST, NDPA 2023). Mandatory evidence upload required for all updates.',
          canManageForms: false,
          canVote: false,
          canVerifyEvidence: false,
          assignedDomains: 'Security & Compliance Readiness',
          badgeColor: 'border-rose-500/40 bg-rose-950/40 text-rose-300',
        };
      case 'business':
        return {
          title: 'Product Owner / Business Lead',
          description: 'Contributor: Evaluate User Acceptance Testing (UAT) & Business Readiness criteria. Mandatory evidence upload required for all updates.',
          canManageForms: false,
          canVote: false,
          canVerifyEvidence: false,
          assignedDomains: 'User & Business Readiness',
          badgeColor: 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300',
        };
      default:
        return {
          title: 'Contributor',
          description: 'Evaluate assigned criteria with mandatory evidence.',
          canManageForms: false,
          canVote: false,
          canVerifyEvidence: false,
          assignedDomains: 'Assigned Criteria',
          badgeColor: 'border-slate-700 bg-slate-900 text-slate-300',
        };
    }
  };

  const cap = getCapabilities(userRole);

  return (
    <div className={`p-3 rounded-xl border backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs ${cap.badgeColor} animate-fade-in`}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">{userName}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 border border-white/10">
              {cap.title}
            </span>
          </div>
          <p className="text-[11px] opacity-80 mt-0.5 line-clamp-1">
            {cap.description}
          </p>
        </div>
      </div>

      {/* Permission Tags */}
      <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
        <span className="px-2 py-1 rounded bg-black/30 border border-white/5 flex items-center gap-1">
          <FolderKanban className="w-3 h-3 text-cyan-400" />
          <span>Scope: {cap.assignedDomains}</span>
        </span>

        {cap.canManageForms ? (
          <span className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <FileEdit className="w-3 h-3" />
            <span>Manage Criteria: Enabled</span>
          </span>
        ) : (
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700/50 text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Manage Criteria: Locked</span>
          </span>
        )}

        {cap.canVote ? (
          <span className="px-2 py-1 rounded bg-teal-950/80 border border-teal-500/30 text-teal-300 flex items-center gap-1">
            <Vote className="w-3 h-3" />
            <span>Governance Vote: Eligible</span>
          </span>
        ) : (
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700/50 text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Governance Vote: View Only</span>
          </span>
        )}
      </div>
    </div>
  );
};
