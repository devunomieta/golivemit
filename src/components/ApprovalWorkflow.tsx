'use client';

import React from 'react';
import { OverallAssessmentResult, UserRole } from '@/lib/scoringEngine';
import { ApprovalRecord, UserProfile } from '@/lib/mockData';
import { createApprovalBlockHash } from '@/lib/cryptoLedger';
import { 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  ShieldCheck,
  Calendar, 
  User,
  AlertOctagon,
  Mail,
  Briefcase,
  Link,
  Paperclip,
  FileText,
  UploadCloud,
  X
} from 'lucide-react';

interface ApprovalWorkflowProps {
  userRole: UserRole;
  userName: string;
  assessmentResult: OverallAssessmentResult;
  approvals: ApprovalRecord[];
  availableUsers?: UserProfile[];
  isPostSignoffModified?: boolean;
  initialConditions?: Array<{ title: string; desc: string; role: string }>;
  onSubmitApproval: (record: Omit<ApprovalRecord, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  userRole,
  userName,
  assessmentResult,
  approvals,
  availableUsers = [],
  isPostSignoffModified = false,
  initialConditions = [],
  onSubmitApproval,
  onClose,
}) => {
  const { overallScore, recommendation, hasGateBlocker, activeBlockers } = assessmentResult;

  const [decision, setDecision] = React.useState<'GO' | 'CONDITIONAL_GO' | 'NO_GO'>(
    initialConditions.length > 0 ? 'CONDITIONAL_GO' : recommendation
  );
  const [comments, setComments] = React.useState('');
  const [evidenceUrl, setEvidenceUrl] = React.useState('');
  const [evidenceFile, setEvidenceFile] = React.useState<{ name: string; data: string } | null>(null);

  const [conditionsText, setConditionsText] = React.useState(() => {
    if (initialConditions.length > 0) {
      return initialConditions
        .map((c, i) => `${i + 1}. [${c.title}]: ${c.desc} (Owner: ${c.role})`)
        .join('\n\n');
    }
    return '';
  });

  const [prevCount, setPrevCount] = React.useState(initialConditions.length);

  if (initialConditions.length !== prevCount) {
    setPrevCount(initialConditions.length);
    if (initialConditions.length > 0) {
      setDecision('CONDITIONAL_GO');
      setConditionsText(
        initialConditions
          .map((c, i) => `${i + 1}. [${c.title}]: ${c.desc} (Owner: ${c.role})`)
          .join('\n\n')
      );
    }
  }
  
  // Owner Selection State (Pre-filled user ID or 'other')
  const [selectedOwnerId, setSelectedOwnerId] = React.useState<string>(() => availableUsers[0]?.id || 'other');
  const [customOwnerName, setCustomOwnerName] = React.useState('');
  const [customOwnerRole, setCustomOwnerRole] = React.useState('');
  const [customOwnerEmail, setCustomOwnerEmail] = React.useState('');

  const [digitalSignatureName, setDigitalSignatureName] = React.useState(userName);
  const [dueDate, setDueDate] = React.useState('2026-08-30');
  const [submitted, setSubmitted] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const canApprove = userRole === 'admin' || userRole === 'approver';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB for base64 storage)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('File attachment exceeds maximum 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEvidenceFile({
        name: file.name,
        data: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!digitalSignatureName.trim()) {
      setFormError('Digital Signature confirmation name is required to authorize governance vote.');
      return;
    }

    // Validation for NO_GO decisions
    if (decision === 'NO_GO' && !comments.trim()) {
      setFormError('Please provide a decision rationale/comment explaining the NO-GO rejection.');
      return;
    }

    let finalOwner = '';

    if (decision === 'CONDITIONAL_GO') {
      if (!conditionsText.trim()) {
        setFormError('Mandatory Conditions description cannot be empty for a Conditional GO approval.');
        return;
      }

      if (selectedOwnerId === 'other') {
        if (!customOwnerName.trim() || !customOwnerRole.trim() || !customOwnerEmail.trim()) {
          setFormError('Please complete all details for custom mitigation owner (Name, Role & Email).');
          return;
        }
        finalOwner = `${customOwnerName.trim()} (${customOwnerRole.trim()} - ${customOwnerEmail.trim()})`;
      } else {
        const found = availableUsers.find((u) => u.id === selectedOwnerId);
        finalOwner = found ? `${found.name} (${found.role})` : selectedOwnerId;
      }

      if (!dueDate) {
        setFormError('Please select a Remediation Due Date.');
        return;
      }
    }

    // Generate cryptographic-style digital signature stamp
    const stampHash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const generatedStamp = `SIG-2026-${stampHash}-${decision}`;

    const prevHash = approvals.length > 0 && approvals[0].blockHash 
      ? approvals[0].blockHash 
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const index = approvals.length;
    const createdAt = new Date().toISOString();

    createApprovalBlockHash(index, 'rel-1', userName, decision, createdAt, prevHash).then((computedHash) => {
      onSubmitApproval({
        assessmentId: 'a1',
        approverName: userName,
        decision,
        comments: comments.trim() || undefined,
        evidenceUrl: evidenceUrl.trim() || undefined,
        evidenceFileName: evidenceFile?.name,
        evidenceFileData: evidenceFile?.data,
        signatureStamp: generatedStamp,
        digitalSignatureName: digitalSignatureName.trim(),
        blockHash: computedHash,
        previousHash: prevHash,
        conditionsText: decision === 'CONDITIONAL_GO' ? conditionsText : undefined,
        conditionsOwner: decision === 'CONDITIONAL_GO' ? finalOwner : undefined,
        dueDate: decision === 'CONDITIONAL_GO' ? dueDate : undefined,
      });
      setSubmitted(true);
    });
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

      {/* Warning Alert Banner for Post Sign-Off Modifications */}
      {isPostSignoffModified && approvals.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-3 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-rose-200 tracking-wide uppercase">
              ⚠️ Assessment Modified Post Sign-Off — Re-Vote Recommended
            </h4>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              Assessment forms or evidence were updated after formal governance sign-off was recorded. The Board should review updated risk parameters and cast a refreshed decision.
            </p>
          </div>
        </div>
      )}

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

          {formError && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 font-medium">
              {formError}
            </div>
          )}

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

          {/* Decision Rationale / Comments Field for ALL Decisions */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs text-gray-300 flex items-center justify-between">
              <span>Decision Comments & Board Rationale:</span>
              <span className={`text-[10px] font-semibold font-mono ${decision === 'NO_GO' ? 'text-rose-400' : 'text-slate-400'}`}>
                {decision === 'NO_GO' ? 'Required for NO-GO' : 'Optional'}
              </span>
            </label>
            <textarea
              rows={2}
              placeholder={
                decision === 'GO' 
                  ? "e.g., All 480 automated regression tests passed with zero high-severity open defects."
                  : decision === 'CONDITIONAL_GO'
                  ? "e.g., Approved subject to mandatory dry-run execution log provided prior to deployment window."
                  : "e.g., Rejecting release due to unresolved high severity security vulnerability in OAuth service."
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-950 text-xs text-white border border-white/10 focus:border-cyan-500/50 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Evidence Verification (URL & File Upload) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-950/60 border border-white/5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-cyan-400" />
                <span>Evidence URL Link (Optional):</span>
              </label>
              <input
                type="url"
                placeholder="https://jira.company.com/browse/REL-2026"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-900 text-xs text-white border border-white/10 focus:border-cyan-500/50 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                <span>Evidence Document / File (Optional):</span>
              </label>
              
              {evidenceFile ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-300 font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{evidenceFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEvidenceFile(null)}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-900 border border-dashed border-white/20 hover:border-cyan-500/50 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  <span>Attach Document (PDF, PNG, LOG)</span>
                  <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.txt,.log,.png,.jpg,.jpeg" />
                </label>
              )}
            </div>
          </div>

          {/* Conditional Go Form Fields */}
          {decision === 'CONDITIONAL_GO' && (
            <div className="space-y-4 pt-3 border-t border-white/10 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Specify Mitigation Conditions & Ownership
                </div>
                <span className="text-[10px] text-rose-400 font-mono">* All Fields Mandatory</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 flex items-center justify-between">
                  <span>Mandatory Conditions for Production Deployment:</span>
                  <span className="text-amber-400 font-semibold text-[10px]">Required</span>
                </label>
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
                {/* Assigned Mitigation Owner Dropdown + Custom Other Option */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-300 flex items-center justify-between">
                    <span>Assigned Mitigation Owner:</span>
                    <span className="text-amber-400 font-semibold text-[10px]">Required</span>
                  </label>
                  
                  <div className="flex items-center gap-2 bg-gray-950 p-2.5 rounded-lg border border-white/10">
                    <User className="w-4 h-4 text-amber-400 shrink-0" />
                    <select
                      value={selectedOwnerId}
                      onChange={(e) => setSelectedOwnerId(e.target.value)}
                      className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
                    >
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                          {u.name} ({u.role})
                        </option>
                      ))}
                      <option value="other" className="bg-slate-900 text-amber-300 font-semibold">
                        + Other (Specify Custom Owner)
                      </option>
                    </select>
                  </div>

                  {/* Custom Owner Sub-Form */}
                  {selectedOwnerId === 'other' && (
                    <div className="p-3 mt-2 rounded-lg bg-slate-950/80 border border-amber-500/30 space-y-2 animate-fade-in">
                      <div className="text-[11px] font-semibold text-amber-400">Custom Mitigation Owner Details:</div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400">Full Name:</span>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Alex Johnson"
                            value={customOwnerName}
                            onChange={(e) => setCustomOwnerName(e.target.value)}
                            className="w-full p-1.5 rounded bg-gray-900 text-xs text-white border border-white/10 focus:border-amber-500/50 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400">Role / Title:</span>
                          <div className="flex items-center gap-1.5 bg-gray-900 p-1.5 rounded border border-white/10">
                            <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. SecOps Lead"
                              value={customOwnerRole}
                              onChange={(e) => setCustomOwnerRole(e.target.value)}
                              className="w-full bg-transparent text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400">Email Address:</span>
                          <div className="flex items-center gap-1.5 bg-gray-900 p-1.5 rounded border border-white/10">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <input
                              type="email"
                              required
                              placeholder="alex@company.com"
                              value={customOwnerEmail}
                              onChange={(e) => setCustomOwnerEmail(e.target.value)}
                              className="w-full bg-transparent text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-300 flex items-center justify-between">
                    <span>Remediation Due Date:</span>
                    <span className="text-amber-400 font-semibold text-[10px]">Required</span>
                  </label>
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

          {/* Digital Signature Confirmation Section */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Digital Signature & Board Authorization:</span>
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono">CRYPTOGRAPHIC STAMP REQ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Approver Formal Full Name:</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins (Dev Lead)"
                  value={digitalSignatureName}
                  onChange={(e) => setDigitalSignatureName(e.target.value)}
                  className="w-full p-2 rounded bg-gray-950 text-xs text-white border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>
              <div className="p-2 rounded bg-gray-950/80 border border-white/5 space-y-0.5 text-[10px] font-mono text-slate-400">
                <div>AUTHORIZATION: <span className="text-cyan-300">RELEASE GOVERNANCE BOARD</span></div>
                <div>AUTHORIZATION TIMESTAMP: <span className="text-slate-300">{new Date().toLocaleString()}</span></div>
              </div>
            </div>
          </div>

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
              <div key={app.id} className="p-3.5 rounded-xl bg-gray-900/60 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{app.digitalSignatureName || app.approverName}</span>
                    {app.signatureStamp && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                        {app.signatureStamp}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{app.createdAt}</span>
                </div>

                <div className="flex items-center gap-2">
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

                {/* Comments / Rationale Display */}
                {app.comments && (
                  <p className="text-xs text-slate-300 italic bg-slate-950/40 p-2 rounded-lg border border-white/5">
                    &ldquo;{app.comments}&rdquo;
                  </p>
                )}

                {/* Evidence Links and Files */}
                {(app.evidenceUrl || app.evidenceFileName) && (
                  <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/5 text-xs text-slate-400">
                    {app.evidenceUrl && (
                      <a
                        href={app.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-all text-[11px]"
                      >
                        <Link className="w-3 h-3" />
                        <span>Evidence Link</span>
                      </a>
                    )}
                    {app.evidenceFileName && (
                      <div className="flex items-center gap-1 text-slate-300 text-[11px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-white/10">
                        <Paperclip className="w-3 h-3 text-cyan-400" />
                        {app.evidenceFileData ? (
                          <a href={app.evidenceFileData} download={app.evidenceFileName} className="hover:underline text-cyan-300">
                            {app.evidenceFileName}
                          </a>
                        ) : (
                          <span>{app.evidenceFileName}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
