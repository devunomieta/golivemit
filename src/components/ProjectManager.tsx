'use client';

import React, { useState } from 'react';
import { ProjectRecord, ReleaseRecord, UserProfile } from '@/lib/mockData';
import { createProject, updateProject, createRelease, updateReleaseStatus } from '@/lib/dataService';
import { 
  FolderPlus, 
  Folder, 
  Calendar, 
  User, 
  Building2, 
  PlusCircle, 
  Edit3, 
  X, 
  Check, 
  Layers, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const PREDEFINED_DEPARTMENTS = [
  'Enterprise Engineering',
  'Fintech & Core Payments',
  'Quality Assurance & Testing',
  'Cloud Infrastructure & DevOps',
  'Information Security & Governance',
  'Product & Digital Delivery',
  'Business Architecture & Compliance',
];

interface ProjectManagerProps {
  user: UserProfile;
  projects: ProjectRecord[];
  releases: ReleaseRecord[];
  activeProject: ProjectRecord | null;
  activeRelease: ReleaseRecord | null;
  availableUsers?: UserProfile[];
  onSelectProject: (project: ProjectRecord) => void;
  onSelectRelease: (release: ReleaseRecord) => void;
  onRefreshData: () => void;
  onClose: () => void;
}

export function ProjectManager({
  user,
  projects,
  releases,
  activeProject,
  activeRelease,
  availableUsers = [],
  onSelectProject,
  onSelectRelease,
  onRefreshData,
  onClose,
}: ProjectManagerProps) {
  const isManager = user.role === 'admin' || user.role === 'project_manager';

  const [activeTab, setActiveTab] = useState<'list' | 'create_project' | 'create_release'>('list');
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);

  // New Project Form State
  const [projectName, setProjectName] = useState('');
  const [department, setDepartment] = useState(PREDEFINED_DEPARTMENTS[0]);
  const [ownerName, setOwnerName] = useState(user.name);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  // New Release Form State
  const [selectedProjectIdForRelease, setSelectedProjectIdForRelease] = useState<string>(
    activeProject ? activeProject.id : projects[0]?.id || ''
  );
  const [releaseName, setReleaseName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [releaseStatus, setReleaseStatus] = useState<'draft' | 'under_assessment' | 'approved' | 'rejected'>('draft');

  const handleStartCreateProject = () => {
    setEditingProject(null);
    setProjectName('');
    setDepartment('Engineering');
    setOwnerName(user.name);
    setDescription('');
    setActiveTab('create_project');
  };

  const handleStartEditProject = (proj: ProjectRecord) => {
    setEditingProject(proj);
    setProjectName(proj.projectName);
    setDepartment(proj.department);
    setOwnerName(proj.ownerName);
    setDescription(proj.description);
    setActiveTab('create_project');
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !department.trim()) return;

    setIsSubmitting(true);
    if (editingProject) {
      await updateProject(
        editingProject.id,
        { projectName, department, ownerName, description },
        user.id
      );
    } else {
      await createProject(
        { projectName, department, ownerName, description },
        user.id
      );
    }
    setIsSubmitting(false);
    onRefreshData();
    setActiveTab('list');
  };

  const handleSaveRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseName.trim() || !targetDate || !selectedProjectIdForRelease) return;

    setIsSubmitting(true);
    await createRelease(
      {
        projectId: selectedProjectIdForRelease,
        releaseName,
        targetDate,
        status: releaseStatus,
      },
      user.id
    );
    setIsSubmitting(false);
    onRefreshData();
    setActiveTab('list');
  };

  const handleUpdateReleaseStatus = async (releaseId: string, status: 'draft' | 'under_assessment' | 'approved' | 'rejected') => {
    await updateReleaseStatus(releaseId, status, user.id);
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0B0F19] border border-cyan-500/30 rounded-2xl w-full max-w-4xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Project & Release Governance</h2>
              <p className="text-xs text-slate-400">Manage enterprise projects, delivery targets, and release statuses</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/60 px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Project Directory ({projects.length})</span>
            </button>

            {isManager && (
              <>
                <button
                  onClick={handleStartCreateProject}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                    activeTab === 'create_project'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{editingProject ? 'Edit Project' : 'New Project'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('create_release')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                    activeTab === 'create_release'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Target Release</span>
                </button>
              </>
            )}
          </div>

          {!isManager && (
            <div className="flex items-center gap-2 text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Read-Only Mode (Manager authorization required to edit)</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* LIST TAB */}
          {activeTab === 'list' && (
            <div className="space-y-6">
              {projects.map((proj) => {
                const projReleases = releases.filter((r) => r.projectId === proj.id);
                const isActiveProj = activeProject?.id === proj.id;

                return (
                  <div
                    key={proj.id}
                    className={`rounded-2xl border transition-all p-5 ${
                      isActiveProj
                        ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                        : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-white">{proj.projectName}</h3>
                          {isActiveProj && (
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold uppercase tracking-wider">
                              Active Context
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 max-w-2xl">{proj.description}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActiveProj && (
                          <button
                            onClick={() => {
                              onSelectProject(proj);
                              if (projReleases.length > 0) {
                                onSelectRelease(projReleases[0]);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <span>Set Active</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isManager && (
                          <button
                            onClick={() => handleStartEditProject(proj)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
                            title="Edit Project"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-500">Department:</span>
                        <span className="font-semibold text-slate-200">{proj.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-500">Owner:</span>
                        <span className="font-semibold text-slate-200">{proj.ownerName}</span>
                      </div>
                    </div>

                    {/* Releases Subsection */}
                    <div className="mt-4 pt-3 bg-slate-950/40 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          Target Releases ({projReleases.length})
                        </span>
                      </div>

                      {projReleases.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No releases defined for this project.</p>
                      ) : (
                        <div className="space-y-2">
                          {projReleases.map((rel) => {
                            const isActiveRel = activeRelease?.id === rel.id;
                            return (
                              <div
                                key={rel.id}
                                className={`flex items-center justify-between p-3 rounded-lg border text-xs transition ${
                                  isActiveRel
                                    ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-200'
                                    : 'bg-slate-900/60 border-white/5 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-4 h-4 text-cyan-400" />
                                  <div>
                                    <span className="font-semibold text-white">{rel.releaseName}</span>
                                    <span className="text-slate-500 ml-2">Target: {rel.targetDate}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  {isManager ? (
                                    <select
                                      value={rel.status}
                                      onChange={(e) => handleUpdateReleaseStatus(rel.id, e.target.value as 'draft' | 'under_assessment' | 'approved' | 'rejected')}

                                      className="bg-slate-800 border border-white/10 text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
                                    >
                                      <option value="draft">Draft</option>
                                      <option value="under_assessment">Under Assessment</option>
                                      <option value="approved">Approved</option>
                                      <option value="rejected">Rejected</option>
                                    </select>
                                  ) : (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      rel.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                      rel.status === 'under_assessment' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                      rel.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                      'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                                    }`}>
                                      {rel.status.replace('_', ' ')}
                                    </span>
                                  )}

                                  {!isActiveRel && (
                                    <button
                                      onClick={() => {
                                        onSelectProject(proj);
                                        onSelectRelease(rel);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-[11px] font-semibold transition"
                                    >
                                      Select
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CREATE / EDIT PROJECT TAB */}
          {activeTab === 'create_project' && isManager && (
            <form onSubmit={handleSaveProject} className="space-y-4 max-w-2xl mx-auto bg-slate-900/60 p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-cyan-400" />
                {editingProject ? 'Edit Project Profile' : 'Create Enterprise Project'}
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Core Banking API v2"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Department / Unit *</label>
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {PREDEFINED_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-900 text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Project Owner *</label>
                  <select
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {availableUsers.length > 0 ? (
                      availableUsers.map((u) => (
                        <option key={u.id} value={u.name} className="bg-slate-900 text-white">
                          {u.name}
                        </option>
                      ))
                    ) : (
                      <option value={user.name} className="bg-slate-900 text-white">
                        {user.name}
                      </option>
                    )}



                  </select>
                </div>
              </div>


              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Project Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the business objective and technical scope..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          )}

          {/* CREATE RELEASE TAB */}
          {activeTab === 'create_release' && isManager && (
            <form onSubmit={handleSaveRelease} className="space-y-4 max-w-2xl mx-auto bg-slate-900/60 p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cyan-400" />
                Add Target Release Candidate
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Parent Project *</label>
                <select
                  value={selectedProjectIdForRelease}
                  onChange={(e) => setSelectedProjectIdForRelease(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName} ({p.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Release Name / Version *</label>
                <input
                  type="text"
                  required
                  value={releaseName}
                  onChange={(e) => setReleaseName(e.target.value)}
                  placeholder="e.g. Release v2.4.0-RC2"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Launch Date *</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Initial Status</label>
                  <select
                    value={releaseStatus}
                    onChange={(e) => setReleaseStatus(e.target.value as 'draft' | 'under_assessment' | 'approved' | 'rejected')}

                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="under_assessment">Under Assessment</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Release</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
