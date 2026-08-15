'use client';

import React from 'react';
import { OverallAssessmentResult } from '@/lib/scoringEngine';
import { ReadinessCriterion, CriterionResponse } from '@/lib/scoringEngine';
import { ApprovalRecord } from '@/lib/mockData';
import { Printer, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, FileCheck2 } from 'lucide-react';

interface AuditReportProps {
  projectName: string;
  releaseName: string;
  targetDate: string;
  assessmentResult: OverallAssessmentResult;
  criteria: ReadinessCriterion[];
  responses: Record<string, CriterionResponse>;
  approvals?: ApprovalRecord[];
  onClose: () => void;
}

export const AuditReport: React.FC<AuditReportProps> = ({
  projectName,
  releaseName,
  targetDate,
  assessmentResult,
  criteria,
  responses,
  approvals = [],
  onClose,
}) => {
  const { overallScore, recommendation, hasGateBlocker, activeBlockers, domainBreakdown } = assessmentResult;
  const latestApproval = approvals[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 rounded-2xl glass-card border border-white/10 space-y-8 max-w-4xl mx-auto print:bg-white print:text-black print:p-0 print:border-none">
      {/* Action Header (Hidden in Print) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 print:hidden">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>Executive Audit Report Export</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div className="space-y-6">
        {/* Document Title Header */}
        <div className="flex items-center justify-between border-b-2 border-cyan-500/30 pb-4">
          <div>
            <div className="text-xs uppercase font-mono text-cyan-400 print:text-cyan-800 font-bold tracking-widest">
              ENTERPRISE GO-LIVE READINESS REPORT
            </div>
            <h1 className="text-2xl font-bold text-white print:text-black font-['Outfit']">{projectName}</h1>
            <div className="text-sm font-semibold text-gray-300 print:text-gray-700">{releaseName}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 print:text-gray-600">Target Launch Date</div>
            <div className="text-sm font-bold text-white print:text-black font-mono">{targetDate}</div>
            <div className="text-[10px] text-gray-500 print:text-gray-500 mt-1">Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="p-6 rounded-xl bg-gray-900/80 print:bg-gray-100 border border-white/10 print:border-gray-300 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-gray-400 print:text-gray-600 uppercase font-mono">Overall Score</div>
            <div className="text-4xl font-extrabold text-white print:text-black font-mono mt-1">{overallScore}%</div>
          </div>

          <div>
            <div className="text-xs text-gray-400 print:text-gray-600 uppercase font-mono">Final Decision</div>
            <div className="mt-1">
              {recommendation === 'GO' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-sm font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 print:bg-emerald-100 print:text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" /> GO
                </span>
              ) : recommendation === 'CONDITIONAL_GO' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-sm font-bold bg-amber-950 text-amber-400 border border-amber-800 print:bg-amber-100 print:text-amber-800">
                  <AlertTriangle className="w-4 h-4" /> CONDITIONAL GO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-sm font-bold bg-rose-950 text-rose-400 border border-rose-800 print:bg-rose-100 print:text-rose-800">
                  <XCircle className="w-4 h-4" /> NO-GO
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 print:text-gray-600 uppercase font-mono">Hard Gate Status</div>
            <div className="text-xs font-semibold mt-1">
              {hasGateBlocker ? (
                <span className="text-rose-400 print:text-rose-700 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> {activeBlockers.length} Gate Blocker Failed
                </span>
              ) : (
                <span className="text-emerald-400 print:text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> All Gate Rules Passed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Active Blockers List */}
        {hasGateBlocker && (
          <div className="p-4 rounded-xl bg-rose-950/40 print:bg-rose-50 border border-rose-500/40 print:border-rose-300 space-y-2">
            <div className="text-xs font-bold text-rose-400 print:text-rose-800 uppercase tracking-wider">
              Critical Blocker Audit Trail
            </div>
            <div className="space-y-1">
              {activeBlockers.map((b, idx) => (
                <div key={idx} className="text-xs text-rose-200 print:text-rose-900 font-mono">
                  • {b}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domain Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider font-['Outfit']">
            Domain Readiness Breakdown
          </h3>
          <table className="w-full text-left text-xs text-gray-300 print:text-black border border-white/10 print:border-gray-300">
            <thead className="bg-gray-800 print:bg-gray-200 text-gray-400 print:text-gray-700 uppercase text-[10px]">
              <tr>
                <th className="p-2.5 border-b border-white/10 print:border-gray-300">Domain</th>
                <th className="p-2.5 border-b border-white/10 print:border-gray-300">Weight</th>
                <th className="p-2.5 border-b border-white/10 print:border-gray-300">Readiness Score</th>
                <th className="p-2.5 border-b border-white/10 print:border-gray-300">Gate Rule Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-gray-200">
              {[...domainBreakdown]
                .sort((a, b) => a.domainName.localeCompare(b.domainName))
                .map((d) => (
                <tr key={d.domainId}>
                  <td className="p-2.5 font-medium">{d.domainName}</td>
                  <td className="p-2.5 font-mono">{d.weight}%</td>
                  <td className="p-2.5 font-mono font-bold">{d.readinessPercentage}%</td>
                  <td className="p-2.5">
                    {d.hasGateBlocker ? (
                      <span className="text-rose-400 print:text-rose-700 font-semibold">BLOCKER ACTIVE</span>
                    ) : (
                      <span className="text-emerald-400 print:text-emerald-700">PASSED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Criteria & Evidence Detail Log */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider font-['Outfit']">
            Evaluated Criteria & Supporting Evidence
          </h3>
          <div className="space-y-2">
            {criteria.map((c) => {
              const resp = responses[c.id];
              const score = resp ? resp.likelihood * resp.impact : 9;

              return (
                <div key={c.id} className="p-3 rounded bg-gray-900/60 print:bg-gray-50 border border-white/5 print:border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-white print:text-black">{c.criterionText}</span>
                    <span className="font-mono text-gray-400 print:text-gray-600">Risk Score: {score}/25</span>
                  </div>
                  {resp?.comment && (
                    <div className="text-gray-400 print:text-gray-700 italic text-[11px]">
                      Comment: &quot;{resp.comment}&quot;
                    </div>
                  )}
                  {resp?.evidenceUrl && (
                    <div className="text-cyan-400 print:text-blue-700 font-mono text-[10px] truncate">
                      Evidence Link: {resp.evidenceUrl}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign-off Signature & Board Authorization Footer */}
        <div className="pt-8 border-t border-white/10 print:border-gray-300 space-y-4">
          <div className="text-xs font-bold text-white print:text-black uppercase tracking-wider font-['Outfit']">
            Formal Release Governance Sign-Off & Board Authorization
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-gray-900/80 print:bg-gray-100 border border-white/10 print:border-gray-300">
            <div className="space-y-1 text-xs">
              <div className="text-gray-400 print:text-gray-600 uppercase text-[10px] font-mono">Lead Approver Signature</div>
              <div className="font-bold text-white print:text-black text-sm">
                {latestApproval?.digitalSignatureName || latestApproval?.approverName || 'Pending Board Sign-off'}
              </div>
              {latestApproval?.signatureStamp ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950 print:bg-cyan-100 text-cyan-400 print:text-cyan-800 text-[10px] font-mono border border-cyan-800/50 print:border-cyan-300">
                  <FileCheck2 className="w-3 h-3" />
                  <span>Verified Stamp: {latestApproval.signatureStamp}</span>
                </div>
              ) : (
                <div className="text-[10px] text-amber-400 print:text-amber-700 italic font-mono">
                  Digital Cryptographic Stamp: PENDING AUTHORIZATION
                </div>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-gray-400 print:text-gray-600 uppercase text-[10px] font-mono">Authorization & Date</div>
              <div className="font-bold text-white print:text-black">
                {latestApproval?.createdAt ? new Date(latestApproval.createdAt).toLocaleString() : new Date().toLocaleDateString()}
              </div>
              <div className="text-[11px] text-emerald-400 print:text-emerald-800 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized by Enterprise Release Governance Board</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
