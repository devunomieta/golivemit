'use client';

import React from 'react';
import { 
  ReadinessDomain, 
  ReadinessCriterion, 
  CriterionResponse, 
  UserRole 
} from '@/lib/scoringEngine';
import { 
  ShieldAlert, 
  Link, 
  MessageSquare, 
  Save, 
  CheckCircle2, 
  UserCheck 
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
  const [localResponses, setLocalResponses] = React.useState<Record<string, CriterionResponse>>(responses);
  const [savedNotice, setSavedNotice] = React.useState(false);

  // Sync local responses when parent responses prop updates
  React.useEffect(() => {
    setLocalResponses(responses);
  }, [responses]);

  const selectedDomain = domains.find((d) => d.id === selectedDomainId) || domains[0];
  const domainCriteria = criteria.filter((c) => c.domainId === selectedDomainId);

  const handleSliderChange = (criterionId: string, field: 'likelihood' | 'impact', value: number) => {
    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
    };

    const updated = {
      ...current,
      [field]: value,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    updated.calculatedRiskScore = updated.likelihood * updated.impact;

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    // Real-time update to parent component
    onSaveResponse(criterionId, updated);
  };

  const handleTextChange = (criterionId: string, field: 'comment' | 'evidenceUrl', value: string) => {
    const current = localResponses[criterionId] || {
      criterionId,
      likelihood: 3,
      impact: 3,
      calculatedRiskScore: 9,
    };

    const updated = {
      ...current,
      [field]: value,
      updatedBy: userName,
      updatedAt: new Date().toISOString(),
    };

    const newLocal = { ...localResponses, [criterionId]: updated };
    setLocalResponses(newLocal);
    // Real-time update to parent component
    onSaveResponse(criterionId, updated);
  };

  const handleSaveAll = () => {
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
          <h2 className="text-xl font-bold text-white font-['Outfit']">Interactive Assessment Evaluation</h2>
          <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
            <span>Evaluating as: <strong className="text-cyan-400">{userName}</strong> ({userRole})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/50 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Responses Saved!</span>
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
            className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-all"
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
                  : 'bg-gray-900/60 border-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{domain.name}</span>
              <span className="text-[10px] opacity-60 font-mono">({domain.defaultWeight}%)</span>
            </button>
          );
        })}
      </div>

      {/* Domain Info Header */}
      <div className="p-4 rounded-xl bg-gray-900/80 border border-white/5 space-y-1">
        <h3 className="text-sm font-semibold text-white">{selectedDomain?.name}</h3>
        <p className="text-xs text-gray-400">{selectedDomain?.description}</p>
      </div>

      {/* Criteria Evaluation List */}
      <div className="space-y-4">
        {domainCriteria.map((criterion) => {
          const resp = localResponses[criterion.id] || {
            criterionId: criterion.id,
            likelihood: 3,
            impact: 3,
            calculatedRiskScore: 9,
          };

          const riskScore = resp.likelihood * resp.impact;
          const isAssigned = userRole === 'admin' || userRole === 'project_manager' || criterion.assignedRole === userRole;

          return (
            <div
              key={criterion.id}
              className={`p-5 rounded-xl border transition-all space-y-4 ${
                isAssigned ? 'bg-gray-900/60 border-white/10' : 'bg-gray-950/40 border-white/5 opacity-70'
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
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Role: <strong className="text-gray-200 capitalize">{criterion.assignedRole}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Risk Score:</span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${getScoreBadge(riskScore)}`}>
                    {riskScore} / 25
                  </span>
                </div>
              </div>

              <div className="text-sm font-medium text-white">{criterion.criterionText}</div>

              {/* Sliders: Likelihood & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Likelihood Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-300">
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
                    className="w-full accent-cyan-500 bg-gray-800 h-2 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>1 (Rare)</span>
                    <span>5 (Certain)</span>
                  </div>
                </div>

                {/* Impact Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-300">
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
                    className="w-full accent-amber-500 bg-gray-800 h-2 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>1 (Negligible)</span>
                    <span>5 (Catastrophic)</span>
                  </div>
                </div>
              </div>

              {/* Comment & Evidence Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2 bg-gray-950/60 p-2.5 rounded-lg border border-white/5">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Add qualitative evaluation comment..."
                    value={resp.comment || ''}
                    onChange={(e) => handleTextChange(criterion.id, 'comment', e.target.value)}
                    disabled={!isAssigned}
                    className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full disabled:opacity-40"
                  />
                </div>

                <div className="flex items-center gap-2 bg-gray-950/60 p-2.5 rounded-lg border border-white/5">
                  <Link className="w-4 h-4 text-cyan-400" />
                  <input
                    type="text"
                    placeholder="Evidence link (Jira, SonarQube, PR)..."
                    value={resp.evidenceUrl || ''}
                    onChange={(e) => handleTextChange(criterion.id, 'evidenceUrl', e.target.value)}
                    disabled={!isAssigned}
                    className="bg-transparent text-xs text-cyan-300 placeholder-gray-500 focus:outline-none w-full disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
