'use client';

import React from 'react';
import { 
  ReadinessDomain, 
  ReadinessCriterion, 
  CriterionResponse, 
  UserRole,
  AuditHistoryRecord
} from '@/lib/scoringEngine';
import { 
  validateEvidenceUrl, 
  validateEvidenceFile, 
  sanitizeText 
} from '@/lib/validationUtils';
import { 
  ShieldAlert, 
  Link as LinkIcon, 
  MessageSquare, 
  Save, 
  CheckCircle2, 
  UserCheck,
  Paperclip,
  History,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  UploadCloud,
  X
} from 'lucide-react';

interface AssessmentWizardProps {
  userRole: UserRole;
  userName: string;
  domains: ReadinessDomain[];
  criteria: ReadinessCriterion[];
  responses: Record<string, CriterionResponse>;
  onSaveResponse: (criterionId: string, response: CriterionResponse) => void;
  onClose: () => void;
}

function generateAuditRecord(
  userName: string,
  prevResp: CriterionResponse | undefined, 
  newResp: CriterionResponse
): AuditHistoryRecord {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    updatedBy: userName,
    updatedAt: new Date().toISOString(),
    action: 'EVALUATION_UPDATED',
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
  onSaveResponse,
  onClose,
}) => {
  const [selectedDomainId, setSelectedDomainId] = React.useState<string>(domains[0]?.id || '');
  const [prevResponsesProp, setPrevResponsesProp] = React.useState(responses);
  const [localResponses, setLocalResponses] = React.useState<Record<string, CriterionResponse>>(responses);
  const [savedNotice, setSavedNotice] = React.useState(false);

  // Validation Error State per Criterion ID
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  
  // Active Audit History Drawer per Criterion ID
  const [openAuditCriterionId, setOpenAuditCriterionId] = React.useState<string | null>(null);

  // Sync state during render when prop changes
  if (prevResponsesProp !== responses) {
    setPrevResponsesProp(responses);
    setLocalResponses(responses);
  }

  const selectedDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];
  const domainCriteria = criteria.filter((c) => c.domainId === selectedDomainId);


  const handleSliderChange = (criterionId: string, field: 'likelihood' | 'impact', value: number) => {
    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
      auditTrail: [],
    };

    const updated: CriterionResponse = {
      ...current,
      [field]: value,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    updated.calculatedRiskScore = updated.likelihood * updated.impact;
    
    // Append Audit Trail Record
    const auditRecord = generateAuditRecord(userName, current, updated);
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];


    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  const handleCommentChange = (criterionId: string, value: string) => {
    const sanitized = sanitizeText(value);
    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
      auditTrail: [],
    };

    const updated: CriterionResponse = {
      ...current,
      comment: sanitized,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

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

    // Clear validation error
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy[criterionId];
      return copy;
    });

    // Create file object URL / mock upload proof reference
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
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const auditRecord = generateAuditRecord(userName, current, updated);
    auditRecord.action = `ATTACHED_FILE_PROOF (${file.name})`;
    updated.auditTrail = [auditRecord, ...(current.auditTrail || [])];


    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    onSaveResponse(criterionId, updated);
  };

  const handleSaveAll = () => {
    // Check if there are active validation errors
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
        {domains.map((domain) => {
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
          };

          const riskScore = resp.likelihood * resp.impact;
          const isAssigned = userRole === 'admin' || userRole === 'project_manager' || criterion.assignedRole === userRole;
          const hasEvidence = Boolean(resp.evidenceUrl || resp.evidenceFilename);
          const valError = validationErrors[criterion.id];

          return (
            <div
              key={criterion.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                isAssigned ? 'bg-slate-900/60 border-white/10' : 'bg-slate-950/40 border-white/5 opacity-70'
              }`}
            >
              {/* Criterion Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {criterion.gateRuleFlag && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/50 uppercase tracking-wider">
                      <ShieldAlert className="w-3 h-3 text-rose-400" /> Hard Gate Rule
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Role: <strong className="text-slate-200 capitalize">{criterion.assignedRole}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Evidence Status Badge */}
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                    hasEvidence 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50' 
                      : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                  }`}>
                    {hasEvidence ? <FileCheck className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-400" />}
                    {hasEvidence ? 'Evidence Attached' : 'Missing Proof'}
                  </span>

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

              {/* Evidence & Comment Dual Mode Inputs */}
              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Evaluator Commentary */}
                  <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-xl border border-white/10">
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Add evaluation commentary & rationale..."
                      value={resp.comment || ''}
                      onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                      disabled={!isAssigned}
                      className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full disabled:opacity-40"
                    />
                  </div>

                  {/* Dual Mode Evidence Attachment: URL & File Upload */}
                  <div className="space-y-2">
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

                      {/* File Upload Button (10MB Max, Restricted MIME) */}
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
                  </div>
                </div>

                {/* Display File Attachment Badge if uploaded */}
                {resp.evidenceFilename && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono">{resp.evidenceFilename}</span>
                      <span className="text-[10px] text-cyan-400/70">(File Proof Attached)</span>
                    </div>
                    {resp.evidenceUrl && (
                      <a
                        href={resp.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] text-cyan-300 underline hover:text-white"
                      >
                        <span>Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Security / File Validation Error Alert */}
                {valError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{valError}</span>
                  </div>
                )}
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

