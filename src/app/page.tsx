'use client';

import React from 'react';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { AssessmentWizard } from '@/components/AssessmentWizard';
import { ApprovalWorkflow } from '@/components/ApprovalWorkflow';
import { AuditReport } from '@/components/AuditReport';
import { AuthLoginModal } from '@/components/AuthLoginModal';
import { 
  UserProfile, 
  ReadinessDomain, 
  ReadinessCriterion, 
  CriterionResponse, 
  INITIAL_PROJECTS, 
  INITIAL_RELEASES,
  ApprovalRecord
} from '@/lib/mockData';
import { 
  fetchProfiles, 
  fetchDomains, 
  fetchCriteria, 
  fetchAssessmentResponses, 
  saveAssessmentResponse, 
  fetchApprovals, 
  submitApprovalVote 
} from '@/lib/dataService';
import { 
  calculateAssessmentReadiness, 
  OverallAssessmentResult 
} from '@/lib/scoringEngine';
import { FileText, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = React.useState<UserProfile | null>(null);
  const [domains, setDomains] = React.useState<ReadinessDomain[]>([]);
  const [criteria, setCriteria] = React.useState<ReadinessCriterion[]>([]);
  const [responses, setResponses] = React.useState<Record<string, CriterionResponse>>({});
  const [approvals, setApprovals] = React.useState<ApprovalRecord[]>([]);
  const [activeModal, setActiveModal] = React.useState<'dashboard' | 'assessment' | 'approval' | 'report'>('dashboard');

  const activeRelease = INITIAL_RELEASES[0];
  const activeProject = INITIAL_PROJECTS[0];

  // Initial Dynamic Data Hydration
  React.useEffect(() => {
    async function loadData() {
      const fetchedUsers = await fetchProfiles();
      const fetchedDomains = await fetchDomains();
      const fetchedCriteria = await fetchCriteria();
      const fetchedResponses = await fetchAssessmentResponses(activeRelease.id);
      const fetchedApprovals = await fetchApprovals(activeRelease.id);

      setUsers(fetchedUsers);
      setActiveUser(fetchedUsers[0] || null);
      setDomains(fetchedDomains);
      setCriteria(fetchedCriteria);
      setResponses(fetchedResponses);
      setApprovals(fetchedApprovals);
    }
    loadData();
  }, [activeRelease.id]);

  // Calculate live readiness assessment result using the engine
  const assessmentResult: OverallAssessmentResult = React.useMemo(() => {
    return calculateAssessmentReadiness(domains, criteria, responses);
  }, [domains, criteria, responses]);

  const handleSaveResponse = async (criterionId: string, updatedResponse: CriterionResponse) => {
    const updated = {
      ...responses,
      [criterionId]: updatedResponse,
    };
    setResponses(updated);

    if (activeUser) {
      await saveAssessmentResponse(activeRelease.id, activeUser.id, updated);
    }
  };

  const handleAddApproval = async (
    decision: 'GO' | 'CONDITIONAL_GO' | 'NO_GO',
    conditionsText?: string,
    conditionsOwner?: string,
    dueDate?: string
  ) => {
    const newRecord: ApprovalRecord = {
      id: `app-${Date.now()}`,
      assessmentId: 'ass-1',
      approverName: activeUser ? activeUser.name : 'Approver',
      decision,
      conditionsText,
      conditionsOwner,
      dueDate,
      createdAt: new Date().toISOString(),
    };
    setApprovals((prev) => [newRecord, ...prev]);

    if (activeUser) {
      await submitApprovalVote(
        activeRelease.id,
        activeUser.id,
        decision,
        conditionsText,
        conditionsOwner,
        dueDate
      );
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setActiveUser(user);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans">
      {!isAuthenticated ? (
        <AuthLoginModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* Header & Role Navigation (Shown only when authenticated) */}
      {activeUser && (
        <RoleSwitcher 
          activeUser={activeUser} 
          onUserChange={setActiveUser} 
          onSignOut={handleSignOut} 
          availableUsers={users}
        />
      )}

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
            projectName={activeProject.projectName}
            releaseName={activeRelease.releaseName}
            targetDate={activeRelease.targetDate}
            onOpenAssessment={() => setActiveModal('assessment')}
            onOpenApproval={() => setActiveModal('approval')}
          />
        )}

        {activeModal === 'assessment' && activeUser && (
          <AssessmentWizard
            userRole={activeUser.role}
            userName={activeUser.name}
            domains={domains}
            criteria={criteria}
            responses={responses}
            onSaveResponse={handleSaveResponse}
            onClose={() => setActiveModal('dashboard')}
          />
        )}

        {activeModal === 'approval' && activeUser && (
          <ApprovalWorkflow
            userRole={activeUser.role}
            userName={activeUser.name}
            assessmentResult={assessmentResult}
            approvals={approvals}
            onSubmitApproval={(rec) =>
              handleAddApproval(
                rec.decision,
                rec.conditionsText,
                rec.conditionsOwner,
                rec.dueDate
              )
            }
            onClose={() => setActiveModal('dashboard')}
          />
        )}

        {activeModal === 'report' && (
          <AuditReport
            projectName={activeProject.projectName}
            releaseName={activeRelease.releaseName}
            targetDate={activeRelease.targetDate}
            assessmentResult={assessmentResult}
            criteria={criteria}
            responses={responses}
            onClose={() => setActiveModal('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070A12] py-4 px-8 text-center text-xs text-slate-500 font-mono">
        GoLive DSS • Risk-Based Decision Support System for Enterprise Software Delivery • MIVA Open University MIT Project 2026
      </footer>
        </>
      )}
    </div>
  );
}
