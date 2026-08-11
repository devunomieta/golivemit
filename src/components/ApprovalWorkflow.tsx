'use client';

import React from 'react';
import { OverallAssessmentResult, UserRole } from '@/lib/scoringEngine';
import { ApprovalRecord } from '@/lib/mockData';
import { 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Calendar, 
  User 
} from 'lucide-react';

interface ApprovalWorkflowProps {
  userRole: UserRole;
  userName: string;
  assessmentResult: OverallAssessmentResult;
  approvals: ApprovalRecord[];
  onSubmitApproval: (record: Omit<ApprovalRecord, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  userRole,
  userName,
  assessmentResult,
  approvals,
  onSubmitApproval,
  onClose,
}) => {
  const { overallScore, recommendation, hasGateBlocker, activeBlockers } = assessmentResult;

  const [decision, setDecision] = React.useState<'GO' | 'CONDITIONAL_GO' | 'NO_GO'>(recommendation);
  const [conditionsText, setConditionsText] = React.useState('');
  const [conditionsOwner, setConditionsOwner] = React.useState('');
  const [dueDate, setDueDate] = React.useState('2026-08-30');
  const [submitted, setSubmitted] = React.useState(false);

  const canApprove = userRole === 'admin' || userRole === 'approver';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitApproval({
      assessmentId: 'a1',
      approverName: userName,
      decision,
      conditionsText: decision === 'CONDITIONAL_GO' ? conditionsText : undefined,
      conditionsOwner: decision === 'CONDITIONAL_GO' ? conditionsOwner : undefined,
      dueDate: decision === 'CONDITIONAL_GO' ? dueDate : undefined,
    });
    setSubmitted(true);
  };

  return (
    <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">Governance Approval Sign-off</h2>
            <p className="text-xs text-gray-400">Formal release recommendation review & approval voting</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-all"
        >
          Close
        </button>
      </div>

      {/* Decision Engine Summary Card */}
      <div className="p-5 rounded-xl bg-gray-900/80 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-gray-400 font-mono uppercase">Calculated Readiness</div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">{overallScore}%</div>
        </div>

        <div>
          <div className="text-xs text-gray-400 font-mono uppercase">Engine Recommendation</div>
          <div className="mt-1">
            {recommendation === 'GO' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                <CheckCircle2 className="w-4 h-4" /> GO
              </span>
            ) : recommendation === 'CONDITIONAL_GO' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800/50">
                <AlertTriangle className="w-4 h-4" /> CONDITIONAL GO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800/50">
                <XCircle className="w-4 h-4" /> NO-GO
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 font-mono uppercase">Gate Blocker Override</div>
          <div className="text-xs font-semibold mt-1">
            {hasGateBlocker ? (
              <span className="text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-rose-400" /> Active ({activeBlockers.length})
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No Blockers
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Submit Approval Form */}
      {canApprove ? (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-gray-900/40 border border-cyan-500/30 space-y-5">
          <div className="text-sm font-semibold text-white">Cast Approver Board Decision</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDecision('GO')}
              className={`p-3.5 rounded-xl border text-center font-bold text-xs transition-all ${
                decision === 'GO'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-gray-900/60 border-white/10 text-gray-400 hover:text-gray-200'
              }`}
            >
              Approve GO
            </button>

            <button
              type="button"
              onClick={() => setDecision('CONDITIONAL_GO')}
              className={`p-3.5 rounded-xl border text-center font-bold text-xs transition-all ${
                decision === 'CONDITIONAL_GO'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-gray-900/60 border-white/10 text-gray-400 hover:text-gray-200'
              }`}
            >
              Approve CONDITIONAL GO
            </button>

            <button
              type="button"
              onClick={() => setDecision('NO_GO')}
              className={`p-3.5 rounded-xl border text-center font-bold text-xs transition-all ${
                decision === 'NO_GO'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                  : 'bg-gray-900/60 border-white/10 text-gray-400 hover:text-gray-200'
              }`}
            >
              Reject NO-GO
            </button>
          </div>

          {/* Conditional Go Form Fields */}
          {decision === 'CONDITIONAL_GO' && (
            <div className="space-y-4 pt-3 border-t border-white/10 animate-fade-in">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Specify Mitigation Conditions & Ownership
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300">Mandatory Conditions for Production Deployment:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Lead Dev must provide dry-run rollback execution log before 22:00 UTC."
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-950 text-xs text-white border border-white/10 focus:border-amber-500/50 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Assigned Mitigation Owner:</label>
                  <div className="flex items-center gap-2 bg-gray-950 p-2.5 rounded-lg border border-white/10">
                    <User className="w-4 h-4 text-amber-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., David Okonjo (Lead Dev)"
                      value={conditionsOwner}
                      onChange={(e) => setConditionsOwner(e.target.value)}
                      className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Remediation Due Date:</label>
                  <div className="flex items-center gap-2 bg-gray-950 p-2.5 rounded-lg border border-white/10">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-transparent text-xs text-white focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-400">
              Voting as: <strong className="text-white">{userName}</strong>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {submitted ? 'Decision Logged!' : 'Submit Governance Vote'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-gray-900/60 border border-white/5 text-xs text-gray-400 text-center">
          You are currently viewing as <strong>{userName} ({userRole})</strong>. Governance voting is restricted to <strong>Approver Board</strong> or <strong>Admin</strong>.
        </div>
      )}

      {/* Approval Audit History */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-white font-['Outfit']">Approval Audit Trail</h3>
        {approvals.length === 0 ? (
          <div className="text-xs text-gray-500 italic">No formal governance votes recorded yet for this release candidate.</div>
        ) : (
          <div className="space-y-2">
            {approvals.map((app) => (
              <div key={app.id} className="p-3.5 rounded-xl bg-gray-900/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{app.approverName}</span>
                  <span className="text-[10px] text-gray-500">{app.createdAt}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    app.decision === 'GO' ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50' :
                    app.decision === 'CONDITIONAL_GO' ? 'bg-amber-950 text-amber-400 border-amber-800/50' :
                    'bg-rose-950 text-rose-400 border-rose-800/50'
                  }`}>
                    {app.decision}
                  </span>
                  {app.conditionsText && (
                    <span className="text-xs text-amber-300/90 font-mono">
                      Condition: {app.conditionsText} (Owner: {app.conditionsOwner}, Due: {app.dueDate})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
