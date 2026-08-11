'use client';

import React from 'react';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { AssessmentWizard } from '@/components/AssessmentWizard';
import { ApprovalWorkflow } from '@/components/ApprovalWorkflow';
import { AuditReport } from '@/components/AuditReport';
import { AuthLoginModal } from '@/components/AuthLoginModal';
import { 
  MOCK_USERS, 
  UserProfile, 
  INITIAL_DOMAINS, 
  INITIAL_CRITERIA, 
  INITIAL_RESPONSES, 
  INITIAL_PROJECTS, 
  INITIAL_RELEASES,
  ApprovalRecord
} from '@/lib/mockData';
import { 
  calculateAssessmentReadiness, 
  CriterionResponse, 
  OverallAssessmentResult 
} from '@/lib/scoringEngine';
import { FileText, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [activeUser, setActiveUser] = React.useState<UserProfile>(MOCK_USERS[0]); // Admin default
  const [responses, setResponses] = React.useState<Record<string, CriterionResponse>>(INITIAL_RESPONSES);
  const [approvals, setApprovals] = React.useState<ApprovalRecord[]>([
    {
      id: 'app-1',
      assessmentId: 'a1',
      approverName: 'Dr. Charles Adams (Release Board)',
      decision: 'NO_GO',
      conditionsText: 'Rollback script must be validated before production deployment.',
      conditionsOwner: 'David Okonjo (Lead Dev)',
      dueDate: '2026-08-28',
      createdAt: '2026-08-11 14:30',
    }
  ]);

  const [activeModal, setActiveModal] = React.useState<'dashboard' | 'assessment' | 'approval' | 'report'>('dashboard');

  // Calculate live readiness assessment result using the engine
  const assessmentResult: OverallAssessmentResult = React.useMemo(() => {
    return calculateAssessmentReadiness(INITIAL_DOMAINS, INITIAL_CRITERIA, responses);
  }, [responses]);

  const handleSaveResponse = (criterionId: string, updatedResponse: CriterionResponse) => {
    setResponses((prev) => ({
      ...prev,
      [criterionId]: updatedResponse,
    }));
  };

  const handleAddApproval = (record: Omit<ApprovalRecord, 'id' | 'createdAt'>) => {
    const newRecord: ApprovalRecord = {
      ...record,
      id: `app-${Date.now()}`,
      createdAt: new Date().toLocaleString(),
    };
    setApprovals((prev) => [newRecord, ...prev]);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setActiveUser(user);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-['Inter']">
      {!isAuthenticated && <AuthLoginModal onLoginSuccess={handleLoginSuccess} />}

      {/* Header & Role Navigation */}
      <RoleSwitcher activeUser={activeUser} onUserChange={setActiveUser} onSignOut={handleSignOut} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeModal === 'dashboard'
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-gray-900/60 border-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Executive Dashboard</span>
            </button>

            <button
              onClick={() => setActiveModal('assessment')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeModal === 'assessment'
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-gray-900/60 border-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Assessment Form</span>
            </button>

            <button
              onClick={() => setActiveModal('approval')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeModal === 'approval'
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-gray-900/60 border-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Governance Approval</span>
            </button>

            <button
              onClick={() => setActiveModal('report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeModal === 'report'
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-gray-900/60 border-white/5 text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Audit Report</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
            <span>Project: <strong className="text-white">{INITIAL_PROJECTS[0].projectName}</strong></span>
          </div>
        </div>

        {/* Dynamic View Rendering */}
        {activeModal === 'dashboard' && (
          <ExecutiveDashboard
            assessmentResult={assessmentResult}
            projectName={INITIAL_PROJECTS[0].projectName}
            releaseName={INITIAL_RELEASES[0].releaseName}
            targetDate={INITIAL_RELEASES[0].targetDate}
            onOpenAssessment={() => setActiveModal('assessment')}
            onOpenApproval={() => setActiveModal('approval')}
          />
        )}

        {activeModal === 'assessment' && (
          <AssessmentWizard
            userRole={activeUser.role}
            userName={activeUser.name}
            domains={INITIAL_DOMAINS}
            criteria={INITIAL_CRITERIA}
            responses={responses}
            onSaveResponse={handleSaveResponse}
            onClose={() => setActiveModal('dashboard')}
          />
        )}

        {activeModal === 'approval' && (
          <ApprovalWorkflow
            userRole={activeUser.role}
            userName={activeUser.name}
            assessmentResult={assessmentResult}
            approvals={approvals}
            onSubmitApproval={handleAddApproval}
            onClose={() => setActiveModal('dashboard')}
          />
        )}

        {activeModal === 'report' && (
          <AuditReport
            projectName={INITIAL_PROJECTS[0].projectName}
            releaseName={INITIAL_RELEASES[0].releaseName}
            targetDate={INITIAL_RELEASES[0].targetDate}
            assessmentResult={assessmentResult}
            criteria={INITIAL_CRITERIA}
            responses={responses}
            onClose={() => setActiveModal('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0B0F19] py-4 px-8 text-center text-xs text-gray-500">
        GoLive DSS • Risk-Based Decision Support System for Enterprise Software Delivery • MIVA Open University MIT Project 2026
      </footer>
    </div>
  );
}
