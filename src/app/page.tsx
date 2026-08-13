'use client';

import React from 'react';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { AssessmentWizard } from '@/components/AssessmentWizard';
import { ApprovalWorkflow } from '@/components/ApprovalWorkflow';
import { AuditReport } from '@/components/AuditReport';
import { AuthLoginModal } from '@/components/AuthLoginModal';
import { ProjectManager } from '@/components/ProjectManager';
import { 
  UserProfile, 
  ReadinessDomain, 
  ReadinessCriterion, 
  CriterionResponse, 
  INITIAL_PROJECTS, 
  INITIAL_RELEASES,
  ApprovalRecord,
  ProjectRecord,
  ReleaseRecord
} from '@/lib/mockData';
import { 
  fetchProfiles, 
  fetchDomains, 
  fetchCriteria, 
  fetchAssessmentResponses, 
  saveAssessmentResponse, 
  fetchApprovals, 
  submitApprovalVote,
  fetchProjects,
  fetchReleases
} from '@/lib/dataService';
import { 
  calculateAssessmentReadiness, 
  OverallAssessmentResult 
} from '@/lib/scoringEngine';
import { FileText, Layers, ShieldCheck, CheckCircle2, FolderCog, ChevronDown } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = React.useState<UserProfile | null>(null);
  const [domains, setDomains] = React.useState<ReadinessDomain[]>([]);
  const [criteria, setCriteria] = React.useState<ReadinessCriterion[]>([]);
  const [responses, setResponses] = React.useState<Record<string, CriterionResponse>>({});
  const [approvals, setApprovals] = React.useState<ApprovalRecord[]>([]);
  
  // Project & Release State
  const [projects, setProjects] = React.useState<ProjectRecord[]>(INITIAL_PROJECTS);
  const [releases, setReleases] = React.useState<ReleaseRecord[]>(INITIAL_RELEASES);
  const [activeProject, setActiveProject] = React.useState<ProjectRecord>(INITIAL_PROJECTS[0]);
  const [activeRelease, setActiveRelease] = React.useState<ReleaseRecord>(INITIAL_RELEASES[0]);

  const [activeModal, setActiveModal] = React.useState<'dashboard' | 'assessment' | 'approval' | 'report'>('dashboard');
  const [showProjectManager, setShowProjectManager] = React.useState(false);

  // Load Projects & Releases on Mount
  const loadProjectsAndReleases = React.useCallback(async () => {
    const fetchedProjects = await fetchProjects();
    const fetchedReleases = await fetchReleases();
    setProjects(fetchedProjects);
    setReleases(fetchedReleases);

    if (fetchedProjects.length > 0) {
      setActiveProject((prev) => fetchedProjects.find((p) => p.id === prev.id) || fetchedProjects[0]);
    }
  }, []);

  React.useEffect(() => {
    loadProjectsAndReleases();
  }, [loadProjectsAndReleases]);

  // Initial Dynamic Data Hydration for Profiles, Criteria & Responses for active release
  React.useEffect(() => {
    async function loadData() {
      const fetchedUsers = await fetchProfiles();
      const fetchedDomains = await fetchDomains();
      const fetchedCriteria = await fetchCriteria();

      setUsers(fetchedUsers);
      if (!activeUser) setActiveUser(fetchedUsers[0] || null);
      setDomains(fetchedDomains);
      setCriteria(fetchedCriteria);
    }
    loadData();
  }, [activeUser]);

  // Reactively fetch responses and approvals whenever activeRelease changes
  React.useEffect(() => {
    async function loadReleaseDetails() {
      if (!activeRelease) return;
      const fetchedResponses = await fetchAssessmentResponses(activeRelease.id);
      const fetchedApprovals = await fetchApprovals(activeRelease.id);
      setResponses(fetchedResponses);
      setApprovals(fetchedApprovals);
    }
    loadReleaseDetails();
  }, [activeRelease?.id]);

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

    if (activeUser && activeRelease) {
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

    if (activeUser && activeRelease) {
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

  const projectReleases = React.useMemo(() => {
    return releases.filter((r) => r.projectId === activeProject?.id);
  }, [releases, activeProject?.id]);

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans">
      {!isAuthenticated ? (
        <AuthLoginModal onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* Header & Role Navigation */}
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
            {/* Context Selector & Management Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
              
              {/* Project & Release Pickers */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <span className="text-slate-400 font-medium">Project:</span>
                  <select
                    value={activeProject?.id || ''}
                    onChange={(e) => {
                      const p = projects.find((proj) => proj.id === e.target.value);
                      if (p) {
                        setActiveProject(p);
                        const pRel = releases.filter((r) => r.projectId === p.id);
                        if (pRel.length > 0) setActiveRelease(pRel[0]);
                      }
                    }}
                    className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                  <span className="text-slate-400 font-medium">Release Target:</span>
                  <select
                    value={activeRelease?.id || ''}
                    onChange={(e) => {
                      const r = releases.find((rel) => rel.id === e.target.value);
                      if (r) setActiveRelease(r);
                    }}
                    className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
                  >
                    {projectReleases.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                        {r.releaseName} ({r.targetDate})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* Manage Projects Trigger */}
              {activeUser && (
                <button
                  onClick={() => setShowProjectManager(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.15)] transition"
                >
                  <FolderCog className="w-4 h-4 text-cyan-400" />
                  <span>Project Governance Hub</span>
                </button>
              )}
            </div>

            {/* View Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex flex-wrap items-center gap-2">
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
            </div>

            {/* Dynamic View Rendering */}
            {activeModal === 'dashboard' && (
              <ExecutiveDashboard
                assessmentResult={assessmentResult}
                projectName={activeProject?.projectName || 'Project'}
                releaseName={activeRelease?.releaseName || 'Release'}
                targetDate={activeRelease?.targetDate || ''}
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
                projectName={activeProject?.projectName || 'Project'}
                releaseName={activeRelease?.releaseName || 'Release'}
                targetDate={activeRelease?.targetDate || ''}
                assessmentResult={assessmentResult}
                criteria={criteria}
                responses={responses}
                onClose={() => setActiveModal('dashboard')}
              />
            )}

            {/* Project Manager Modal */}
            {showProjectManager && activeUser && (
              <ProjectManager
                user={activeUser}
                projects={projects}
                releases={releases}
                activeProject={activeProject}
                activeRelease={activeRelease}
                onSelectProject={setActiveProject}
                onSelectRelease={setActiveRelease}
                onRefreshData={loadProjectsAndReleases}
                onClose={() => setShowProjectManager(false)}
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

