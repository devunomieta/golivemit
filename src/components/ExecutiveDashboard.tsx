'use client';

import React from 'react';
import { OverallAssessmentResult } from '@/lib/scoringEngine';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Layers, 
  FileCheck2 
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
  onOpenAssessment: () => void;
  onOpenApproval: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  assessmentResult,
  projectName,
  releaseName,
  targetDate,
  onOpenAssessment,
  onOpenApproval,
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
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300">
          <div className="p-2.5 rounded-xl bg-rose-900/60 text-rose-400 animate-pulse">
            <XCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs uppercase font-mono text-rose-400 font-semibold tracking-wider">Automated Decision</div>
            <div className="text-2xl font-extrabold text-white tracking-wide font-['Outfit']">NO-GO</div>
            <p className="text-xs text-rose-300/80">High residual risk or critical gate blocker active</p>
          </div>
        </div>
      );
    }

    if (recommendation === 'CONDITIONAL_GO') {
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300">
          <div className="p-2.5 rounded-xl bg-amber-900/60 text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs uppercase font-mono text-amber-400 font-semibold tracking-wider">Automated Decision</div>
            <div className="text-2xl font-extrabold text-white tracking-wide font-['Outfit']">CONDITIONAL GO</div>
            <p className="text-xs text-amber-300/80">Moderate residual risk; explicit approval conditions required</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
        <div className="p-2.5 rounded-xl bg-emerald-900/60 text-emerald-400">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <div className="text-xs uppercase font-mono text-emerald-400 font-semibold tracking-wider">Automated Decision</div>
          <div className="text-2xl font-extrabold text-white tracking-wide font-['Outfit']">GO</div>
          <p className="text-xs text-emerald-300/80">Low residual risk; release meets enterprise readiness threshold</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">{projectName}</div>
          <h2 className="text-2xl font-bold text-white font-['Outfit']">{releaseName}</h2>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
            <span>Target Launch: <strong className="text-gray-200">{targetDate}</strong></span>
            <span>•</span>
            <span>Domains Evaluated: <strong className="text-cyan-400">10 / 10</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAssessment}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium text-sm transition-all border border-white/10"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Update Assessment</span>
          </button>
          <button
            onClick={onOpenApproval}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Governance Approval</span>
          </button>
        </div>
      </div>

      {/* Hard Gate Blocker Alert Bar (If Active) */}
      {hasGateBlocker && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
            <span>Hard Gate Blocker Triggered ({activeBlockers.length} Active)</span>
          </div>
          <div className="space-y-1">
            {activeBlockers.map((blocker, idx) => (
              <div key={idx} className="text-xs text-rose-200/90 pl-7 font-mono">
                {blocker}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Gauge & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Gauge & Recommendation */}
        <div className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col justify-between space-y-6">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Overall Readiness Index</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white font-mono">{overallScore}%</span>
              <span className="text-xs text-gray-400">Readiness Score</span>
            </div>
            <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden mt-3 p-0.5 border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  overallScore >= 80 ? 'bg-emerald-500' : overallScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>

          {/* Recommendation Display */}
          {getRecommendationBadge()}
        </div>

        {/* 10-Domain Radar Health Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white font-['Outfit']">10-Domain Readiness Radar</h3>
              <p className="text-xs text-gray-400">Target baseline vs current domain readiness percentage</p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
              Live SDLC Heatmap
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="domain" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6B7280" />
                <Radar name="Readiness" dataKey="score" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.35} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Domain Breakdown Table */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
        <h3 className="text-base font-semibold text-white font-['Outfit']">Domain Readiness Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-800/60 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Domain</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Readiness</th>
                <th className="p-3">Status</th>
                <th className="p-3">Gate Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {domainBreakdown.map((domain) => (
                <tr key={domain.domainId} className="hover:bg-gray-800/40 transition-colors">
                  <td className="p-3 font-medium text-white">{domain.domainName}</td>
                  <td className="p-3 font-mono text-gray-400">{domain.weight}%</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{domain.readinessPercentage}%</span>
                      <div className="w-20 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${domain.readinessPercentage >= 80 ? 'bg-emerald-400' : domain.readinessPercentage >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                          style={{ width: `${domain.readinessPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {domain.readinessPercentage >= 80 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">Optimal</span>
                    ) : domain.readinessPercentage >= 60 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-400 border border-amber-800/50">Moderate Risk</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950/80 text-rose-400 border border-rose-800/50">High Risk</span>
                    )}
                  </td>
                  <td className="p-3">
                    {domain.hasGateBlocker ? (
                      <span className="flex items-center gap-1 text-rose-400 font-semibold">
                        <XCircle className="w-4 h-4 text-rose-500" /> Blocker Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
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
