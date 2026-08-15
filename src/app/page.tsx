'use client';

import React from 'react';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { AssessmentWizard } from '@/components/AssessmentWizard';
import { ApprovalWorkflow } from '@/components/ApprovalWorkflow';
import { AuditReport } from '@/components/AuditReport';
import { AuthLoginModal } from '@/components/AuthLoginModal';
import { ProjectManager } from '@/components/ProjectManager';
import { CryptographicVerifierModal } from '@/components/CryptographicVerifierModal';
import { calculateAIRiskAnalysis } from '@/lib/aiRiskEngine';
import { verifyLedgerIntegrity, CryptographicBlock } from '@/lib/cryptoLedger';
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
import { FileText, Layers, ShieldCheck, CheckCircle2, FolderCog } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('golive_authenticated') === 'true';
    }
    return false;
  });

  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [activeUser, setActiveUser] = React.useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem('golive_active_user_id');
      if (savedUserId) {
        // Will be reconciled during data hydration if users list loads
        return { id: savedUserId, name: 'Loading...', email: '', role: 'admin', department: '' };
      }
    }
    return null;
  });

  const [domains, setDomains] = React.useState<ReadinessDomain[]>([]);
  const [criteria, setCriteria] = React.useState<ReadinessCriterion[]>([]);
  const [responses, setResponses] = React.useState<Record<string, CriterionResponse>>({});
  const [approvals, setApprovals] = React.useState<ApprovalRecord[]>([]);

  const handleAuthSuccess = (user: UserProfile) => {
    setIsAuthenticated(true);
    setActiveUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('golive_authenticated', 'true');
      localStorage.setItem('golive_active_user_id', user.id);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('golive_authenticated');
      localStorage.removeItem('golive_active_user_id');
    }
  };

  // Project & Release State with LocalStorage Initialization
  const [projects, setProjects] = React.useState<ProjectRecord[]>(INITIAL_PROJECTS);
  const [releases, setReleases] = React.useState<ReleaseRecord[]>(INITIAL_RELEASES);

  const [activeProject, setActiveProject] = React.useState<ProjectRecord>(() => {
    if (typeof window !== 'undefined') {
      const savedProjId = localStorage.getItem('golive_active_project_id');
      if (savedProjId) {
        const found = INITIAL_PROJECTS.find((p) => p.id === savedProjId);
        if (found) return found;
      }
    }
    return INITIAL_PROJECTS[0];
  });

  const [activeRelease, setActiveRelease] = React.useState<ReleaseRecord>(() => {
    if (typeof window !== 'undefined') {
      const savedRelId = localStorage.getItem('golive_active_release_id');
      if (savedRelId) {
        const found = INITIAL_RELEASES.find((r) => r.id === savedRelId);
        if (found) return found;
      }
    }
    return INITIAL_RELEASES[0];
  });

  const [activeModal, setActiveModal] = React.useState<'dashboard' | 'assessment' | 'approval' | 'report' | 'crypto'>('dashboard');
  const [showProjectManager, setShowProjectManager] = React.useState(false);

  // Cryptographic Ledger Verification State
  const [ledgerState, setLedgerState] = React.useState<{
    isChainValid: boolean;
    tamperedIndex: number | null;
    blocks: CryptographicBlock[];
  }>({ isChainValid: true, tamperedIndex: null, blocks: [] });

  React.useEffect(() => {
    verifyLedgerIntegrity(approvals, activeRelease?.id || 'rel-1').then(setLedgerState);
  }, [approvals, activeRelease?.id]);
  const [switchingState, setSwitchingState] = React.useState<{
    type: 'persona' | 'project' | 'release' | null;
    targetName?: string;
  }>({ type: null });

  const triggerSwitchFeedback = (type: 'persona' | 'project' | 'release', targetName: string, callback: () => void) => {
    setSwitchingState({ type, targetName });
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setSwitchingState({ type: null });
      }, 400);
    }, 100);
  };

  const handleUserChange = (newUser: UserProfile) => {
    if (newUser.id === activeUser?.id) return;
    triggerSwitchFeedback('persona', newUser.name, () => {
      setActiveUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('golive_active_user_id', newUser.id);
      }
    });
  };

  // Persist Active Project & Release Selections
  const handleSelectProject = (proj: ProjectRecord) => {
    if (proj.id === activeProject?.id) return;
    triggerSwitchFeedback('project', proj.projectName, () => {
      setActiveProject(proj);
      if (typeof window !== 'undefined') {
        localStorage.setItem('golive_active_project_id', proj.id);
      }
    });
  };

  const handleSelectRelease = (rel: ReleaseRecord) => {
    if (rel.id === activeRelease?.id) return;
    triggerSwitchFeedback('release', rel.releaseName, () => {
      setActiveRelease(rel);
      if (typeof window !== 'undefined') {
        localStorage.setItem('golive_active_release_id', rel.id);
      }
    });
  };

  const [isLoadingData, setIsLoadingData] = React.useState(true);

  // Initial Dynamic Data Hydration for Profiles, Criteria, Projects & Releases
  React.useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingData(true);
      const [fetchedProjects, fetchedReleases, fetchedUsers, fetchedDomains, fetchedCriteria] = await Promise.all([
        fetchProjects(),
        fetchReleases(),
        fetchProfiles(),
        fetchDomains(),
        fetchCriteria(),
      ]);

      if (!isMounted) return;

      setProjects(fetchedProjects);
      setReleases(fetchedReleases);
      setUsers(fetchedUsers);
      setDomains(fetchedDomains);
      setCriteria(fetchedCriteria);

      if (fetchedProjects.length > 0) {
        setActiveProject((prev) => {
          const matching = fetchedProjects.find((p) => p.id === prev?.id);
          return matching || fetchedProjects[0];
        });
      }

      if (fetchedUsers.length > 0) {
        setActiveUser((prev) => {
          if (!prev) return fetchedUsers[0];
          const matched = fetchedUsers.find((u) => u.id === prev.id);
          return matched || fetchedUsers[0];
        });
      }

      setIsLoadingData(false);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);


  // Reactively fetch responses and approvals whenever activeRelease changes
  React.useEffect(() => {
    async function loadReleaseDetails() {
      if (!activeRelease) return;

      // First check local storage override for this release
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`golive_responses_${activeRelease.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setResponses(parsed);
            const fetchedApprovals = await fetchApprovals(activeRelease.id);
            setApprovals(fetchedApprovals);
            return;
          } catch (e) {
            console.error('Failed to parse cached responses', e);
          }
        }
      }

      const fetchedResponses = await fetchAssessmentResponses(activeRelease.id);
      const fetchedApprovals = await fetchApprovals(activeRelease.id);
      setResponses(fetchedResponses);
      setApprovals(fetchedApprovals);
    }
    loadReleaseDetails();
  }, [activeRelease]);



  // Calculate live readiness assessment result using the engine
  const assessmentResult: OverallAssessmentResult = React.useMemo(() => {
    return calculateAssessmentReadiness(domains, criteria, responses);
  }, [domains, criteria, responses]);

  // Compute AI Risk Analysis & Mitigation Recommendations
  const aiAnalysis = React.useMemo(() => {
    return calculateAIRiskAnalysis(assessmentResult, criteria, responses);
  }, [assessmentResult, criteria, responses]);

  // Timestamp tracking for Post Sign-Off Modification warning
  const [lastResponseUpdateAt, setLastResponseUpdateAt] = React.useState<number>(0);
  const [lastApprovalVoteAt, setLastApprovalVoteAt] = React.useState<number>(0);

  const isPostSignoffModified = React.useMemo(() => {
    return approvals.length > 0 && lastResponseUpdateAt > lastApprovalVoteAt;
  }, [approvals, lastResponseUpdateAt, lastApprovalVoteAt]);

  const handleSaveResponse = async (criterionId: string, updatedResponse: CriterionResponse) => {
    const updated = {
      ...responses,
      [criterionId]: updatedResponse,
    };
    setResponses(updated);
    setLastResponseUpdateAt(Date.now());

    // Save to browser LocalStorage immediately for persistent page reloads
    if (activeRelease && typeof window !== 'undefined') {
      localStorage.setItem(`golive_responses_${activeRelease.id}`, JSON.stringify(updated));
    }

    if (activeUser && activeRelease) {
      await saveAssessmentResponse(activeRelease.id, activeUser.id, updated);
    }
  };


  const handleAddApproval = async (
    decision: 'GO' | 'CONDITIONAL_GO' | 'NO_GO',
    comments?: string,
    evidenceUrl?: string,
    evidenceFileName?: string,
    evidenceFileData?: string,
    signatureStamp?: string,
    digitalSignatureName?: string,
    blockHash?: string,
    previousHash?: string,
    conditionsText?: string,
    conditionsOwner?: string,
    dueDate?: string
  ) => {
    const now = Date.now();
    const newRecord: ApprovalRecord = {
      id: `app-${now}`,
      assessmentId: 'ass-1',
      approverName: activeUser ? activeUser.name : 'Approver',
      decision,
      comments,
      evidenceUrl,
      evidenceFileName,
      evidenceFileData,
      signatureStamp,
      digitalSignatureName,
      blockHash,
      previousHash,
      conditionsText,
      conditionsOwner,
      dueDate,
      createdAt: new Date(now).toISOString(),
    };
    setApprovals((prev) => [newRecord, ...prev]);
    setLastApprovalVoteAt(now);

    if (activeUser && activeRelease) {
      await submitApprovalVote(
        activeRelease.id,
        activeUser.id,
        decision,
        comments,
        evidenceUrl,
        evidenceFileName,
        evidenceFileData,
        signatureStamp,
        digitalSignatureName,
        blockHash,
        previousHash,
        conditionsText,
        conditionsOwner,
        dueDate
      );
    }
  };

  const handleRefreshData = React.useCallback(async () => {
    const [fetchedProjects, fetchedReleases] = await Promise.all([
      fetchProjects(),
      fetchReleases(),
    ]);
    setProjects(fetchedProjects);
    setReleases(fetchedReleases);
  }, []);

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans">
      {!isAuthenticated ? (
        <AuthLoginModal onLoginSuccess={handleAuthSuccess} />
      ) : isLoadingData ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[80vh]">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin glow-cyan" />
          <p className="text-xs font-semibold text-cyan-300 font-mono tracking-widest uppercase">Loading GoLiveDSS...</p>
        </div>
      ) : (
        <>
          {/* Dynamic Switch Visual Loading Feedback Overlay */}
          <LoadingOverlay
            type={switchingState.type}
            targetName={switchingState.targetName}
          />

          {/* Streamlined Header with Context Selector */}
          {activeUser && (
            <RoleSwitcher
              activeUser={activeUser}
              onUserChange={handleUserChange}
              onSignOut={handleLogout}
              availableUsers={users}
              projects={projects}
              releases={releases}
              activeProject={activeProject}
              activeRelease={activeRelease}
              onSelectProject={handleSelectProject}
              onSelectRelease={handleSelectRelease}
            />
          )}



          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">

            {/* Project Governance Controls Sub-header */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/40 border border-white/10 shadow-lg print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <FolderCog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">Project Governance Hub</h2>
                  <p className="text-xs text-slate-400">Manage enterprise projects, target release candidates, and assessment workflows</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowProjectManager(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                >
                  <FolderCog className="w-4 h-4" />
                  <span>Manage Projects & Releases</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 print:hidden">

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal('dashboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeModal === 'dashboard'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Executive Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveModal('assessment')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeModal === 'assessment'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Assessment Form</span>
                </button>

                <button
                  onClick={() => setActiveModal('approval')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeModal === 'approval'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Governance Board</span>
                </button>

                <button
                  onClick={() => setActiveModal('report')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeModal === 'report'
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audit Report</span>
                </button>
              </div>
            </div>

            {/* Active View Content */}
            {activeModal === 'dashboard' && (
              <ExecutiveDashboard
                assessmentResult={assessmentResult}
                projectName={activeProject?.projectName || 'Project'}
                releaseName={activeRelease?.releaseName || 'Release'}
                targetDate={activeRelease?.targetDate || ''}
                hasApprovals={approvals.length > 0}
                isPostSignoffModified={isPostSignoffModified}
                aiAnalysis={aiAnalysis}
                onOpenAssessment={() => setActiveModal('assessment')}
                onOpenApproval={() => setActiveModal('approval')}
                onOpenCryptoVerifier={() => setActiveModal('crypto')}
              />
            )}

            {activeModal === 'assessment' && activeUser && (
              <AssessmentWizard
                userRole={activeUser.role}
                userName={activeUser.name}
                domains={domains}
                criteria={criteria}
                responses={responses}
                availableUsers={users}
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
                availableUsers={users}
                isPostSignoffModified={isPostSignoffModified}
                onSubmitApproval={(rec) =>
                  handleAddApproval(
                    rec.decision,
                    rec.comments,
                    rec.evidenceUrl,
                    rec.evidenceFileName,
                    rec.evidenceFileData,
                    rec.signatureStamp,
                    rec.digitalSignatureName,
                    rec.blockHash,
                    rec.previousHash,
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
                approvals={approvals}
                onClose={() => setActiveModal('dashboard')}
              />
            )}

            {activeModal === 'crypto' && (
              <CryptographicVerifierModal
                blocks={ledgerState.blocks}
                isChainValid={ledgerState.isChainValid}
                tamperedIndex={ledgerState.tamperedIndex}
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
                availableUsers={users}
                onSelectProject={handleSelectProject}
                onSelectRelease={handleSelectRelease}
                onRefreshData={handleRefreshData}
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


