'use client';

import React, { useState } from 'react';
import { ReadinessDomain, ReadinessCriterion, UserRole } from '@/lib/scoringEngine';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ShieldAlert 
} from 'lucide-react';

interface CriteriaManagerModalProps {
  domains: ReadinessDomain[];
  criteria: ReadinessCriterion[];
  onAddCriterion: (criterion: Omit<ReadinessCriterion, 'id'>) => Promise<void>;
  onUpdateCriterion: (id: string, updates: Partial<ReadinessCriterion>) => Promise<void>;
  onDeleteCriterion: (id: string) => Promise<void>;
  onClose: () => void;
}

export const CriteriaManagerModal: React.FC<CriteriaManagerModalProps> = ({
  domains,
  criteria,
  onAddCriterion,
  onUpdateCriterion,
  onDeleteCriterion,
  onClose,
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?.id || '');
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);

  // Form State for New / Edited Criterion
  const [criterionText, setCriterionText] = useState('');
  const [assignedRole, setAssignedRole] = useState<UserRole>('developer');
  const [weight, setWeight] = useState<number>(10);
  const [gateRuleFlag, setGateRuleFlag] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeDomainCriteria = criteria.filter((c) => c.domainId === selectedDomainId);

  const handleStartEdit = (c: ReadinessCriterion) => {
    setEditingCriterionId(c.id);
    setCriterionText(c.criterionText);
    setAssignedRole(c.assignedRole);
    setWeight(c.weight);
    setGateRuleFlag(c.gateRuleFlag);
  };

  const handleResetForm = () => {
    setEditingCriterionId(null);
    setCriterionText('');
    setAssignedRole('developer');
    setWeight(10);
    setGateRuleFlag(false);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criterionText.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingCriterionId) {
        await onUpdateCriterion(editingCriterionId, {
          criterionText: criterionText.trim(),
          assignedRole,
          weight: Number(weight),
          gateRuleFlag,
        });
      } else {
        await onAddCriterion({
          domainId: selectedDomainId,
          criterionText: criterionText.trim(),
          assignedRole,
          weight: Number(weight),
          gateRuleFlag,
        });
      }
      handleResetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this assessment criterion?')) {
      await onDeleteCriterion(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-cyan-500/30 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Assessment Criteria Manager</h2>
              <p className="text-xs text-slate-400">Dynamically create, modify or delete readiness evaluation criteria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Domain Selector Tabs */}
        <div className="p-4 border-b border-white/5 bg-slate-950/20 overflow-x-auto flex items-center gap-2 scrollbar-thin">
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDomainId(d.id);
                handleResetForm();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                selectedDomainId === d.id
                  ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
                  : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {d.name} ({criteria.filter((c) => c.domainId === d.id).length})
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* List of Criteria in Domain */}
          <div className="md:col-span-7 space-y-3">
            <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Existing Criteria ({activeDomainCriteria.length})
            </h4>

            {activeDomainCriteria.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                No criteria defined for this domain yet. Add one using the form.
              </div>
            ) : (
              <div className="space-y-2">
                {activeDomainCriteria.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-start justify-between gap-3 hover:border-cyan-500/30 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {c.gateRuleFlag && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950 border border-rose-500/50 text-rose-300 flex items-center gap-1">
                            <ShieldAlert className="w-2.5 h-2.5" /> GATE RULE
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/5 text-slate-400 uppercase">
                          Role: {c.assignedRole}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Weight: {c.weight}%
                        </span>
                      </div>
                      <p className="text-xs text-white leading-relaxed font-medium">
                        {c.criterionText}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Edit Criterion"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 transition"
                        title="Delete Criterion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add / Edit Form */}
          <div className="md:col-span-5 bg-slate-950/80 p-4 rounded-xl border border-white/10 space-y-4">
            <h4 className="text-xs font-mono uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              {editingCriterionId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{editingCriterionId ? 'Edit Criterion' : 'Create New Criterion'}</span>
            </h4>

            <form onSubmit={handleSaveForm} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Evaluation Criterion Question:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Verified production rollback scripts tested with dry-run"
                  value={criterionText}
                  onChange={(e) => setCriterionText(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Assigned Evaluator Role:</label>
                  <select
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value as UserRole)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="developer">Developer</option>
                    <option value="qa">QA Lead</option>
                    <option value="devops">DevOps</option>
                    <option value="security">Security</option>
                    <option value="business">Product Owner</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium">Domain Weight (%):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gateRuleFlag}
                    onChange={(e) => setGateRuleFlag(e.target.checked)}
                    className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4 bg-slate-800 border-white/20"
                  />
                  <div>
                    <span className="text-xs font-semibold text-rose-300 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Mandatory Hard Gate Blocker
                    </span>
                    <p className="text-[10px] text-slate-400">
                      If failed ($R_i \ge 15$), release recommendation automatically forced to NO-GO.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {editingCriterionId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingCriterionId ? 'Update Criterion' : 'Add to Domain'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
