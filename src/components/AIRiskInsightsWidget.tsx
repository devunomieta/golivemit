'use client';

import React from 'react';
import { AIRiskAnalysis } from '@/lib/aiRiskEngine';
import { Cpu, AlertOctagon, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface AIRiskInsightsWidgetProps {
  analysis: AIRiskAnalysis;
  onApplyMitigation?: (mitigationTitle: string, mitigationDesc: string, ownerRole: string) => void;
}

export const AIRiskInsightsWidget: React.FC<AIRiskInsightsWidgetProps> = ({
  analysis,
  onApplyMitigation,
}) => {
  const { deploymentRiskIndex, riskTier, contributoryFactors, recommendedMitigations } = analysis;

  const [appliedIds, setAppliedIds] = React.useState<Set<string>>(new Set());

  const handleApply = (id: string, title: string, desc: string, role: string) => {
    setAppliedIds((prev) => new Set(prev).add(id));
    if (onApplyMitigation) {
      onApplyMitigation(title, desc, role);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/40 border border-cyan-500/30 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-['Outfit']">
              <span>AI Deployment Risk Prediction</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">Algorithmic risk forecasting & automated remediation generator</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
          riskTier === 'CRITICAL_RISK' ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]' :
          riskTier === 'MODERATE_RISK' ? 'bg-amber-950/80 text-amber-300 border-amber-500/50' :
          'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
        }`}>
          {riskTier.replace('_', ' ')}
        </div>
      </div>

      {/* Main Score & Factors Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* DRI Radial / Percentage Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Deployment Risk Index (DRI)</div>
          <div className={`text-4xl font-extrabold font-mono tracking-tight ${
            deploymentRiskIndex >= 60 ? 'text-rose-400' :
            deploymentRiskIndex >= 30 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {deploymentRiskIndex}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-500 ${
                deploymentRiskIndex >= 60 ? 'bg-rose-500' :
                deploymentRiskIndex >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${deploymentRiskIndex}%` }}
            />
          </div>
        </div>

        {/* Contributory Risk Factors */}
        <div className="md:col-span-2 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Top Risk Contributors ({contributoryFactors.length})
          </div>
          <div className="space-y-1">
            {contributoryFactors.map((factor, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-950/50 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-300 text-[11px] truncate flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{factor.description}</span>
                </span>
                <span className="text-[10px] font-mono font-semibold text-amber-300 shrink-0">
                  +{factor.impactScore}% DRI
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable AI Recommended Mitigations */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="text-xs font-semibold text-cyan-300 flex items-center justify-between">
          <span>AI Recommended Mitigation Strategies:</span>
          <span className="text-[10px] text-slate-400 font-mono">ONE-CLICK GOVERNANCE IMPORT</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {recommendedMitigations.map((mit) => {
            const isApplied = appliedIds.has(mit.id);
            return (
              <div 
                key={mit.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/20 hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{mit.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                      {mit.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{mit.description}</p>
                  <div className="text-[10px] text-slate-400 font-mono">Suggested Owner: <span className="text-cyan-300 font-semibold">{mit.ownerRole}</span></div>
                </div>

                {onApplyMitigation && (
                  <button
                    type="button"
                    onClick={() => handleApply(mit.id, mit.title, mit.description, mit.ownerRole)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
                      isApplied 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <span>Apply to Conditions</span>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
