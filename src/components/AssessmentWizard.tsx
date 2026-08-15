'use client';

import React from 'react';
import { 
  ReadinessDomain, 
  ReadinessCriterion, 
  CriterionResponse, 
  UserRole,
  AuditHistoryRecord,
  CriterionComment,
  EvidenceMetadata
} from '@/lib/scoringEngine';
import { UserProfile } from '@/lib/mockData';
import { 
  validateEvidenceUrl, 
  validateEvidenceFile, 
  sanitizeText 
} from '@/lib/validationUtils';
import { 
  ShieldAlert, 
  Link as LinkIcon, 
  Save, 
  CheckCircle2, 
  UserCheck,
  Paperclip,
  History,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  UploadCloud,
  X,
  MessageSquare,
  Edit2,
  Trash2,
  FileWarning,
  UserPlus,
  Send
} from 'lucide-react';

interface AssessmentWizardProps {
  userRole: UserRole;
  userName: string;
  domains: ReadinessDomain[];
  criteria: ReadinessCriterion[];
  responses: Record<string, CriterionResponse>;
  availableUsers?: UserProfile[];
  onSaveResponse: (criterionId: string, response: CriterionResponse) => void;
  onClose: () => void;
}

function generateAuditRecord(
  userName: string,
  prevResp: CriterionResponse | undefined, 
  newResp: CriterionResponse,
  actionText?: string
): AuditHistoryRecord {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    updatedBy: userName,
    updatedAt: new Date().toISOString(),
    action: actionText || 'EVALUATION_UPDATED',
    previousRiskScore: prevResp?.calculatedRiskScore ?? 9,
    newRiskScore: newResp.calculatedRiskScore,
    comment: newResp.comment,
    evidenceUrl: newResp.evidenceUrl,
  };
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  userRole,
  userName,
  domains,
  criteria,
  responses,
  availableUsers = [],
  onSaveResponse,
  onClose,
}) => {
  const isManager = userRole === 'admin' || userRole === 'project_manager';

  const [prevResponsesProp, setPrevResponsesProp] = React.useState(responses);
  const [localResponses, setLocalResponses] = React.useState<Record<string, CriterionResponse>>(responses);
  const [savedNotice, setSavedNotice] = React.useState(false);

  // 2-Tier Sorted Domains: Assigned to active persona first (A-Z), then unassigned (A-Z)
  const sortedDomains = React.useMemo(() => {
    return [...domains].sort((a, b) => {
      const aCriteria = criteria.filter((c) => c.domainId === a.id);
      const bCriteria = criteria.filter((c) => c.domainId === b.id);

      const aHasAssigned = aCriteria.some((c) => {
        const resp = localResponses[c.id];
        const assignedRole = resp?.assignedRoleOverride || c.assignedRole;
        const assignedUserId = resp?.assignedUserId;
        return (assignedRole === userRole && userRole !== 'admin') || (assignedUserId && assignedUserId === userName);
      });

      const bHasAssigned = bCriteria.some((c) => {
        const resp = localResponses[c.id];
        const assignedRole = resp?.assignedRoleOverride || c.assignedRole;
        const assignedUserId = resp?.assignedUserId;
        return (assignedRole === userRole && userRole !== 'admin') || (assignedUserId && assignedUserId === userName);
      });

      if (aHasAssigned && !bHasAssigned) return -1;
      if (!aHasAssigned && bHasAssigned) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [domains, criteria, localResponses, userRole, userName]);

  const [rawSelectedDomainId, setSelectedDomainId] = React.useState<string>('');

  // Fallback to top assigned domain if current selection is invalid or uninitialized
  const activeSelectedDomainId = React.useMemo(() => {
    if (rawSelectedDomainId && sortedDomains.some((d) => d.id === rawSelectedDomainId)) {
      return rawSelectedDomainId;
    }
    return sortedDomains[0]?.id || domains[0]?.id || '';
  }, [rawSelectedDomainId, sortedDomains, domains]);

  const selectedDomainId = activeSelectedDomainId;

  // Validation Error State per Criterion ID
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  
  // Active Audit History Drawer per Criterion ID
  const [openAuditCriterionId, setOpenAuditCriterionId] = React.useState<string | null>(null);

  // Multi-Comment Input State per Criterion ID
  const [newCommentInputs, setNewCommentInputs] = React.useState<Record<string, string>>({});
  
  // Edit Comment State ({ criterionId, commentId, text })
  const [editingCommentState, setEditingCommentState] = React.useState<{
    criterionId: string;
    commentId: string;
    text: string;
  } | null>(null);

  // Sync state during render when prop changes
  if (prevResponsesProp !== responses) {
    setPrevResponsesProp(responses);
    setLocalResponses(responses);
  }

  const selectedDomain = sortedDomains.find((d) => d.id === selectedDomainId) || sortedDomains[0] || domains[0];
  const domainCriteria = criteria.filter((c) => c.domainId === selectedDomain?.id);

  const handleSliderChange = (criterionId: string, field: 'likelihood' | 'impact', value: number) => {
    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
      auditTrail: [],
      commentsThread: [],
    };

    const updated: CriterionResponse = {
      ...current,
      [field]: value,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    updated.calculatedRiskScore = updated.likelihood * updated.impact;
    
    const auditRecord = generateAuditRecord(userName, current, updated);
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  // --- Multi-Comment Management ---
  const handleAddComment = (criterionId: string) => {
    const rawText = newCommentInputs[criterionId] || '';
    const text = sanitizeText(rawText);
    if (!text.trim()) return;

    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
      commentsThread: [],
      auditTrail: [],
    };

    const newComment: CriterionComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorName: userName,
      authorRole: userRole,
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedThread = [...(current.commentsThread || []), newComment];
    const updated: CriterionResponse = {
      ...current,
      comment: text, // Latest comment preview
      commentsThread: updatedThread,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const auditRecord = generateAuditRecord(userName, current, updated, `ADDED_COMMENT: "${text.substring(0, 30)}..."`);
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    setNewCommentInputs((prev) => ({ ...prev, [criterionId]: '' }));
    onSaveResponse(criterionId, updated);
  };

  const handleUpdateComment = (criterionId: string, commentId: string, text: string) => {
    const sanitized = sanitizeText(text);
    if (!sanitized.trim()) return;

    const current = localResponses[criterionId];
    if (!current) return;

    const updatedThread = (current.commentsThread || []).map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          text: sanitized,
          updatedAt: new Date().toISOString(),
          isEdited: true,
        };
      }
      return c;
    });

    const updated: CriterionResponse = {
      ...current,
      commentsThread: updatedThread,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    setEditingCommentState(null);
    onSaveResponse(criterionId, updated);
  };

  const handleDeleteComment = (criterionId: string, commentId: string) => {
    const current = localResponses[criterionId];
    if (!current) return;

    const updatedThread = (current.commentsThread || []).filter((c) => c.id !== commentId);

    const updated: CriterionResponse = {
      ...current,
      commentsThread: updatedThread,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const auditRecord = generateAuditRecord(userName, current, updated, 'DELETED_COMMENT');
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  // --- Evidence "Wrong File" Review Flagging ---
  const handleToggleWrongFile = (criterionId: string) => {
    const current = localResponses[criterionId];
    if (!current) return;

    const meta: EvidenceMetadata = current.evidenceMetadata || {
      url: current.evidenceUrl,
      filename: current.evidenceFilename,
      type: current.evidenceType,
      isWrongFile: false,
    };

    const nextIsWrong = !meta.isWrongFile;
    const updatedMeta: EvidenceMetadata = {
      ...meta,
      isWrongFile: nextIsWrong,
      flaggedBy: nextIsWrong ? userName : undefined,
      flaggedAt: nextIsWrong ? new Date().toISOString() : undefined,
    };

    const updated: CriterionResponse = {
      ...current,
      evidenceMetadata: updatedMeta,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const actionMsg = nextIsWrong 
      ? 'FLAGGED_EVIDENCE_AS_WRONG_FILE' 
      : 'CLEARED_WRONG_FILE_EVIDENCE_FLAG';
    
    const auditRecord = generateAuditRecord(userName, current, updated, actionMsg);
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  // --- Dynamic Criterion Reassignment by Admin & PM ---
  const handleReassignCriterionRole = (criterionId: string, targetRole: UserRole) => {
    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
    };

    const updated: CriterionResponse = {
      ...current,
      assignedRoleOverride: targetRole,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const auditRecord = generateAuditRecord(userName, current, updated, `REASSIGNED_ROLE_TO: ${targetRole.toUpperCase()}`);
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  const handleReassignCriterionUser = (criterionId: string, targetUserId: string) => {
    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
    };

    const targetUser = availableUsers.find((u) => u.id === targetUserId);

    const updated: CriterionResponse = {
      ...current,
      assignedUserId: targetUserId || undefined,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const auditRecord = generateAuditRecord(
      userName, 
      current, 
      updated, 
      `REASSIGNED_USER_TO: ${targetUser ? targetUser.name : 'UNASSIGNED'}`
    );
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  const handleUrlChange = (criterionId: string, value: string) => {
    const valResult = validateEvidenceUrl(value);
    
    if (!valResult.valid && valResult.error) {
      setValidationErrors((prev) => ({ ...prev, [criterionId]: valResult.error! }));
    } else {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[criterionId];
        return copy;
      });
    }

    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
      auditTrail: [],
    };

    const updated: CriterionResponse = {
      ...current,
      evidenceUrl: value,
      evidenceType: 'url',
      evidenceMetadata: {
        ...(current.evidenceMetadata || {}),
        url: value,
        type: 'url',
        isWrongFile: false,
      },
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  const handleFileUpload = (criterionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valResult = validateEvidenceFile(file);
    if (!valResult.valid && valResult.error) {
      setValidationErrors((prev) => ({ ...prev, [criterionId]: valResult.error! }));
      return;
    }

    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[criterionId];
      return copy;
    });

    const mockFileUrl = URL.createObjectURL(file);

    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
      auditTrail: [],
    };

    const updated: CriterionResponse = {
      ...current,
      evidenceUrl: mockFileUrl,
      evidenceFilename: file.name,
      evidenceType: 'file',
      evidenceMetadata: {
        ...(current.evidenceMetadata || {}),
        url: mockFileUrl,
        filename: file.name,
        type: 'file',
        isWrongFile: false,
      },
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const auditRecord = generateAuditRecord(userName, current, updated, `ATTACHED_FILE_PROOF (${file.name})`);
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  const handleSaveAll = () => {
    if (Object.keys(validationErrors).length > 0) {
      alert('Please resolve security and file validation errors before saving evaluations.');
      return;
    }

    Object.values(localResponses).forEach((resp) => {
      onSaveResponse(resp.criterionId, resp);
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 15) return 'bg-rose-950/80 text-rose-300 border-rose-800/50';
    if (score >= 9) return 'bg-amber-950/80 text-amber-300 border-amber-800/50';
    return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50';
  };

  return (
    <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-['Outfit']">Evidence-Backed Evaluation Wizard</h2>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
            <span>Evaluating as: <strong className="text-cyan-400">{userName}</strong> ({userRole})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/50 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Evaluations & Audit Trail Saved!</span>
            </div>
          )}
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Save className="w-4 h-4" />
            <span>Save Evaluations</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {sortedDomains.map((domain) => {
          const isSelected = domain.id === selectedDomainId;
          return (
            <button
              key={domain.id}
              onClick={() => setSelectedDomainId(domain.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{domain.name}</span>
              <span className="text-[10px] opacity-60 font-mono">({domain.defaultWeight}%)</span>
            </button>
          );
        })}
      </div>

      {/* Domain Info Header */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
        <h3 className="text-sm font-semibold text-white">{selectedDomain?.name}</h3>
        <p className="text-xs text-slate-400">{selectedDomain?.description}</p>
      </div>

      {/* Criteria Evaluation List */}
      <div className="space-y-6">
        {domainCriteria.map((criterion) => {
          const resp = localResponses[criterion.id] || {
            criterionId: criterion.id,
            likelihood: 3,
            impact: 3,
            calculatedRiskScore: 9,
            auditTrail: [],
            commentsThread: [],
          };

          const riskScore = resp.likelihood * resp.impact;
          const assignedRole = resp.assignedRoleOverride || criterion.assignedRole;
          const assignedUser = availableUsers.find((u) => u.id === resp.assignedUserId);
          
          const isAssigned = isManager || assignedRole === userRole || resp.assignedUserId === userName;
          const hasEvidence = Boolean(resp.evidenceUrl || resp.evidenceFilename);
          const isWrongFile = resp.evidenceMetadata?.isWrongFile;
          const valError = validationErrors[criterion.id];

          return (
            <div
              key={criterion.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                isWrongFile
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                  : isAssigned 
                    ? 'bg-slate-900/60 border-white/10' 
                    : 'bg-slate-950/40 border-white/5 opacity-70'
              }`}
            >
              {/* Criterion Header & Dynamic Assignment Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {criterion.gateRuleFlag && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/50 uppercase tracking-wider">
                      <ShieldAlert className="w-3 h-3 text-rose-400" /> Hard Gate Rule
                    </span>
                  )}

                  {/* Role & User Assignment Dropdowns for Admin/PM */}
                  {isManager ? (
                    <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1 rounded-xl border border-cyan-500/30">
                      <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs text-slate-400">Assign:</span>
                      
                      {/* Role Selector */}
                      <select
                        value={assignedRole}
                        onChange={(e) => handleReassignCriterionRole(criterion.id, e.target.value as UserRole)}
                        className="bg-transparent text-xs text-cyan-300 font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="developer" className="bg-slate-900">Developer</option>
                        <option value="qa" className="bg-slate-900">QA Lead</option>
                        <option value="devops" className="bg-slate-900">DevOps</option>
                        <option value="security" className="bg-slate-900">Security Lead</option>
                        <option value="business" className="bg-slate-900">Business / UAT</option>
                        <option value="project_manager" className="bg-slate-900">PM</option>
                        <option value="admin" className="bg-slate-900">Admin</option>
                      </select>

                      {/* User Member Selector */}
                      <select
                        value={resp.assignedUserId || ''}
                        onChange={(e) => handleReassignCriterionUser(criterion.id, e.target.value)}
                        className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer border-l border-white/10 pl-2"
                      >
                        <option value="" className="bg-slate-900">Unassigned Member</option>
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id} className="bg-slate-900">
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Assigned: <strong className="text-slate-200 capitalize">{assignedRole}</strong>
                      {assignedUser && <span className="text-cyan-400"> ({assignedUser.name})</span>}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Evidence Status Badge & Wrong File Banner */}
                  {isWrongFile ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase border bg-rose-950/90 text-rose-300 border-rose-500/50 animate-pulse">
                      <FileWarning className="w-3.5 h-3.5 text-rose-400" /> Wrong File Flagged
                    </span>
                  ) : (
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      hasEvidence 
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50' 
                        : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                    }`}>
                      {hasEvidence ? <FileCheck className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      {hasEvidence ? 'Evidence Attached' : 'Missing Proof'}
                    </span>
                  )}

                  {/* Risk Score */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Risk Score:</span>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${getScoreBadge(riskScore)}`}>
                      {riskScore} / 25
                    </span>
                  </div>

                  {/* Audit History Toggle */}
                  <button
                    onClick={() => setOpenAuditCriterionId(openAuditCriterionId === criterion.id ? null : criterion.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 transition"
                    title="View Audit Trail History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm font-medium text-white">{criterion.criterionText}</div>

              {/* Unassigned Form Alert & Suitable Assignee Recommendation */}
              {!resp.assignedUserId && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-300">Form Unassigned: </span>
                      <span>No specific team member assigned yet.</span>
                      {(() => {
                        const suitableUsers = availableUsers.filter((u) => u.role === assignedRole);
                        if (suitableUsers.length > 0) {
                          return (
                            <span className="ml-1 text-slate-300 font-medium">
                              Recommended for <strong className="text-cyan-300 capitalize">{assignedRole}</strong> role: {' '}
                              <strong className="text-cyan-300">{suitableUsers.map((u) => u.name).join(', ')}</strong>
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {isManager && (
                    <div className="flex items-center gap-1.5">
                      {availableUsers
                        .filter((u) => u.role === assignedRole)
                        .slice(0, 2)
                        .map((u) => (
                          <button
                            key={u.id}
                            onClick={() => handleReassignCriterionUser(criterion.id, u.id)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Assign {u.name.split(' ')[0]}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sliders: Likelihood & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Likelihood Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Likelihood (Probability):</span>
                    <strong className="text-cyan-400 font-mono">{resp.likelihood} / 5</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={resp.likelihood}
                    onChange={(e) => handleSliderChange(criterion.id, 'likelihood', parseInt(e.target.value))}
                    disabled={!isAssigned}
                    className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 (Rare)</span>
                    <span>5 (Certain)</span>
                  </div>
                </div>

                {/* Impact Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Impact (Severity):</span>
                    <strong className="text-amber-400 font-mono">{resp.impact} / 5</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={resp.impact}
                    onChange={(e) => handleSliderChange(criterion.id, 'impact', parseInt(e.target.value))}
                    disabled={!isAssigned}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 (Negligible)</span>
                    <span>5 (Catastrophic)</span>
                  </div>
                </div>
              </div>

              {/* Evidence Link & File Upload */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-white/10">
                  <LinkIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Verification link (https://jira.company.com)..."
                    value={resp.evidenceType === 'url' ? resp.evidenceUrl || '' : ''}
                    onChange={(e) => handleUrlChange(criterion.id, e.target.value)}
                    disabled={!isAssigned}
                    className="bg-transparent text-xs text-cyan-300 placeholder-slate-500 focus:outline-none w-full disabled:opacity-40"
                  />

                  {/* Upload Button */}
                  <label className={`p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-400 cursor-pointer transition ${!isAssigned ? 'opacity-40 pointer-events-none' : ''}`}>
                    <UploadCloud className="w-4 h-4" />
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.csv,.json,.log,.png,.jpg,.jpeg"
                      onChange={(e) => handleFileUpload(criterion.id, e)}
                      disabled={!isAssigned}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Attached File Display & "Wrong File" Review Controls */}
                {hasEvidence && (
                  <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-all ${
                    isWrongFile 
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                      : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono font-semibold">{resp.evidenceFilename || resp.evidenceUrl}</span>
                      {resp.evidenceFilename && <span className="text-[10px] opacity-75">(File Attachment)</span>}
                      {isWrongFile && (
                        <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wide">
                          • Flagged by {resp.evidenceMetadata?.flaggedBy || 'Reviewer'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {resp.evidenceUrl && (
                        <a
                          href={resp.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-cyan-300 underline hover:text-white"
                        >
                          <span>Preview Proof</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {/* "Wrong File" Toggle Button for Admin, PM & Assigned Roles */}
                      <button
                        onClick={() => handleToggleWrongFile(criterion.id)}
                        disabled={!isAssigned}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          isWrongFile
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-950/90 hover:bg-rose-900 border border-rose-500/50 text-rose-300'
                        }`}
                      >
                        <FileWarning className="w-3.5 h-3.5" />
                        <span>{isWrongFile ? 'Clear Flag (Mark Valid)' : 'Mark as Wrong File'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Security Validation Error */}
                {valError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{valError}</span>
                  </div>
                )}

                {/* --- Multi-Comment Threading Section --- */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <span>Discussion & Review Thread ({resp.commentsThread?.length || 0})</span>
                    </div>
                  </div>

                  {/* Comment List */}
                  {resp.commentsThread && resp.commentsThread.length > 0 && (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                      {resp.commentsThread.map((c) => {
                        const canEditDelete = isManager || c.authorName === userName;
                        const isEditingThis = editingCommentState?.commentId === c.id;

                        return (
                          <div key={c.id} className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-2">
                                <strong className="text-cyan-300">{c.authorName}</strong>
                                <span className="text-[10px] text-slate-400 capitalize px-1.5 py-0.5 rounded bg-white/5 font-mono">
                                  {c.authorRole}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-500">
                                {c.isEdited && <span className="text-[10px] italic">(edited)</span>}
                                <span className="font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                                {canEditDelete && !isEditingThis && (
                                  <div className="flex items-center gap-1.5 ml-2">
                                    <button
                                      onClick={() => setEditingCommentState({ criterionId: criterion.id, commentId: c.id, text: c.text })}
                                      className="text-slate-400 hover:text-cyan-300 transition"
                                      title="Edit Comment"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(criterion.id, c.id)}
                                      className="text-slate-400 hover:text-rose-400 transition"
                                      title="Delete Comment"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Comment Body / Edit Form */}
                            {isEditingThis ? (
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={editingCommentState.text}
                                  onChange={(e) => setEditingCommentState({ ...editingCommentState, text: e.target.value })}
                                  className="flex-1 bg-slate-900 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                                />
                                <button
                                  onClick={() => handleUpdateComment(criterion.id, c.id, editingCommentState.text)}
                                  className="px-2.5 py-1 bg-cyan-600 text-white rounded-lg text-xs font-semibold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingCommentState(null)}
                                  className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <p className="text-slate-200 leading-relaxed font-sans">{c.text}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add New Comment Box */}
                  <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-white/10">
                    <input
                      type="text"
                      placeholder={isAssigned ? "Add review comment or request clarification..." : "Only assigned evaluator can comment..."}
                      value={newCommentInputs[criterion.id] || ''}
                      onChange={(e) => setNewCommentInputs({ ...newCommentInputs, [criterion.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(criterion.id)}
                      disabled={!isAssigned}
                      className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full px-2 disabled:opacity-40"
                    />
                    <button
                      onClick={() => handleAddComment(criterion.id)}
                      disabled={!isAssigned || !(newCommentInputs[criterion.id] || '').trim()}
                      className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      title="Post Comment"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Criterion Audit Log Drawer */}
              {openAuditCriterionId === criterion.id && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      <History className="w-4 h-4 text-cyan-400" />
                      Audit Trail & Revision History
                    </div>
                    <button
                      onClick={() => setOpenAuditCriterionId(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!resp.auditTrail || resp.auditTrail.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No revision history recorded for this criterion yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {resp.auditTrail.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 text-xs text-slate-300 space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-cyan-300">{log.updatedBy}</span>
                            <span className="font-mono text-slate-500">{new Date(log.updatedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-400">{log.action}</p>
                          {log.comment && <p className="text-slate-300 italic font-mono text-[11px]">&quot;{log.comment}&quot;</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


