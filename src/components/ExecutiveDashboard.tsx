import React from 'react';
import { OverallAssessmentResult } from '@/lib/scoringEngine';
import { AIRiskAnalysis } from '@/lib/aiRiskEngine';
import { AIRiskInsightsWidget } from './AIRiskInsightsWidget';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Layers, 
  FileCheck2,
  TrendingUp,
  Activity,
  AlertOctagon,
  ShieldCheck
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip 
} from 'recharts';

interface ExecutiveDashboardProps {
  assessmentResult: OverallAssessmentResult;
  projectName: string;
  releaseName: string;
  targetDate: string;
  hasApprovals?: boolean;
  isPostSignoffModified?: boolean;
  aiAnalysis?: AIRiskAnalysis;
  onOpenAssessment: () => void;
  onOpenApproval: () => void;
  onOpenCryptoVerifier?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  assessmentResult,
  projectName,
  releaseName,
  targetDate,
  hasApprovals = false,
  isPostSignoffModified = false,
  aiAnalysis,
  onOpenAssessment,
  onOpenApproval,
  onOpenCryptoVerifier,
}) => {
  const { overallScore, recommendation, hasGateBlocker, activeBlockers, domainBreakdown } = assessmentResult;

  // Radar Chart Data formatting
  const chartData = domainBreakdown.map((d) => ({
    domain: d.domainName.replace(' Readiness', ''),
    score: d.readinessPercentage,
    target: 100,
  }));

  const getRecommendationBadge = () => {
    if (hasGateBlocker || recommendation === 'NO_GO') {
      return (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/60 border border-rose-500/50 text-rose-300 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          <div className="p-3 rounded-2xl bg-rose-900/80 text-rose-300 border border-rose-500/40 glow-rose animate-pulse">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-mono text-rose-400 font-bold tracking-widest">Automated Decision Engine</div>
            <div className="text-3xl font-black text-white tracking-wider font-display">NO-GO</div>
            <p className="text-xs text-rose-200/90 mt-0.5 font-medium">
              {hasGateBlocker 
                ? `Gate Blocker Override Active (${activeBlockers.length} Critical Blocker failing despite ${overallScore}% score)` 
                : 'High residual risk below delivery readiness threshold'}
            </p>
          </div>
        </div>
      );
    }


    if (recommendation === 'CONDITIONAL_GO') {
      return (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/60 border border-amber-500/50 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <div className="p-3 rounded-2xl bg-amber-900/80 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[11px] uppercase font-mono text-amber-400 font-bold tracking-widest">Automated Decision Engine</div>
            <div className="text-3xl font-black text-white tracking-wider font-display">CONDITIONAL GO</div>
            <p className="text-xs text-amber-200/80 mt-0.5">Moderate residual risk; explicit mitigation approval required</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/60 border border-emerald-500/50 text-emerald-300 glow-emerald">
        <div className="p-3 rounded-2xl bg-emerald-900/80 text-emerald-300 border border-emerald-500/40">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div>
          <div className="text-[11px] uppercase font-mono text-emerald-400 font-bold tracking-widest">Automated Decision Engine</div>
          <div className="text-3xl font-black text-white tracking-wider font-display">GO</div>
          <p className="text-xs text-emerald-200/80 mt-0.5">Low residual risk; release meets enterprise readiness threshold</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-7">
      {/* Top Banner Header */}
      <div className="p-7 rounded-3xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div>
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>{projectName}</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight font-display">{releaseName}</h2>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-4 font-sans">
            <span>Target Launch: <strong className="text-slate-200 font-mono">{targetDate}</strong></span>
            <span>•</span>
            <span>Domains Evaluated: <strong className="text-cyan-400 font-mono">10 / 10</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          {onOpenCryptoVerifier && (
            <button
              onClick={onOpenCryptoVerifier}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-semibold text-xs transition-all border border-cyan-500/40 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>SHA-256 Ledger Proof</span>
            </button>
          )}
          <button
            onClick={onOpenAssessment}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all border border-slate-700 cursor-pointer shadow-lg"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Update Evaluation</span>
          </button>
          <button
            onClick={onOpenApproval}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs transition-all glow-cyan cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Governance Board Vote</span>
          </button>
        </div>
      </div>

      {/* Post Sign-Off Modification Alert Banner */}
      {isPostSignoffModified && hasApprovals && (
        <div className="p-5 rounded-2xl bg-rose-950/80 border border-rose-500/60 flex items-start gap-4 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.25)]">
          <div className="p-2.5 rounded-xl bg-rose-900/80 text-rose-300 border border-rose-500/40 shrink-0">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-200 tracking-wide font-display uppercase">
              ⚠️ Assessment Modified Post Sign-Off — Re-Vote Recommended
            </h4>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              Assessment forms or evidence were updated after a formal governance sign-off vote was recorded for this release candidate. Approvers should review the updated risk matrix and cast a refreshed decision.
            </p>
          </div>
        </div>
      )}

      {/* Gate Blocker Alert Banner */}
      {hasGateBlocker && (
        <div className="p-5 rounded-2xl bg-rose-950/80 border border-rose-500/60 flex flex-col gap-2.5 shadow-xl">
          <div className="flex items-center gap-2.5 text-rose-300 font-bold text-sm font-display">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
            <span>Hard Gate Blocker Override Triggered ({activeBlockers.length} Critical Issue Active)</span>
          </div>
          <div className="space-y-1.5 pt-1 border-t border-rose-800/50">
            {activeBlockers.map((blocker, idx) => (
              <div key={idx} className="text-xs text-rose-200 font-mono pl-7">
                • {blocker}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Gauge & Recommendation Card */}
        <div className="p-7 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Readiness Index</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white font-mono tracking-tight">{overallScore}%</span>
              <span className="text-xs text-slate-400 font-sans">Readiness Index</span>
            </div>
            <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden mt-4 p-0.5 border border-slate-700">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  overallScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : overallScore >= 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-rose-600 to-red-500'
                }`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          {/* Decision Outcome */}
          {getRecommendationBadge()}
        </div>

        {/* 10-Domain Radar Visualizer */}
        <div className="lg:col-span-2 p-7 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-display">10-Domain Readiness Radar</h3>
              <p className="text-xs text-slate-400">Readiness percentage heatmap across governance domains</p>
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-3.5 py-1.5 rounded-full border border-cyan-700/60">
              Live Evaluation Heatmap
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="domain" stroke="#94A3B8" tick={{ fill: '#CBD5E1', fontSize: 11, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748B" />
                <Radar name="Readiness" dataKey="score" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.35} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Module 3: AI Risk Prediction & Mitigation Widget */}
      {aiAnalysis && (
        <AIRiskInsightsWidget 
          analysis={aiAnalysis} 
          onApplyMitigation={() => onOpenApproval()}
        />
      )}

      {/* Domain Breakdown Matrix Table */}
      <div className="p-7 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="text-lg font-bold text-white font-display">Domain Readiness Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono tracking-widest border-b border-white/10">
              <tr>
                <th className="p-4">Domain Name</th>
                <th className="p-4">Weight</th>
                <th className="p-4">Readiness Percentage</th>
                <th className="p-4">Status Category</th>
                <th className="p-4">Gate Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {[...domainBreakdown]
                .sort((a, b) => a.domainName.localeCompare(b.domainName))
                .map((domain) => (
                <tr key={domain.domainId} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-semibold text-white">{domain.domainName}</td>
                  <td className="p-4 font-mono text-slate-400 font-medium">{domain.weight}%</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm">{domain.readinessPercentage}%</span>
                      <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                        <div 
                          className={`h-full ${domain.readinessPercentage >= 80 ? 'bg-emerald-400' : domain.readinessPercentage >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                          style={{ width: `${domain.readinessPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {domain.readinessPercentage >= 80 ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60">Optimal</span>
                    ) : domain.readinessPercentage >= 60 ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-700/60">Moderate Risk</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-700/60">High Risk</span>
                    )}
                  </td>
                  <td className="p-4">
                    {domain.hasGateBlocker ? (
                      <span className="flex items-center gap-1.5 text-rose-400 font-bold font-mono text-xs">
                        <XCircle className="w-4 h-4 text-rose-500" /> BLOCKER ACTIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Clear
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
