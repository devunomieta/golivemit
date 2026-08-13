'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProjectRecord, ReleaseRecord } from '@/lib/mockData';
import { Folder, Calendar, ChevronDown, Check, Layers } from 'lucide-react';

interface ProjectContextPickerProps {
  projects: ProjectRecord[];
  releases: ReleaseRecord[];
  activeProject: ProjectRecord | null;
  activeRelease: ReleaseRecord | null;
  onSelectProject: (project: ProjectRecord) => void;
  onSelectRelease: (release: ReleaseRecord) => void;
}

export function ProjectContextPicker({
  projects,
  releases,
  activeProject,
  activeRelease,
  onSelectProject,
  onSelectRelease,
}: ProjectContextPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const projectReleases = releases.filter((r) => r.projectId === activeProject?.id);

  return (
    <div className="relative" ref={containerRef}>
      {/* Context Pill Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 text-left transition-all cursor-pointer shadow-md group"
      >
        <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20">
          <Folder className="w-3.5 h-3.5" />
        </div>
        
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-white font-bold max-w-[150px] sm:max-w-[200px] truncate">
            {activeProject ? activeProject.projectName : 'Select Project'}
          </span>
          <span className="text-slate-600 font-bold">•</span>
          <span className="text-emerald-400 font-semibold max-w-[150px] sm:max-w-[200px] truncate flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-500" />
            {activeRelease ? activeRelease.releaseName : 'Select Release'}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2.5 w-80 sm:w-[420px] rounded-2xl bg-[#0B0F19] border border-cyan-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 z-[100] space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Projects Selector Section */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Active Project ({projects.length})
            </label>
            <div className="space-y-1.5">
              {projects.map((proj) => {
                const isSelected = proj.id === activeProject?.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj);
                      const matchingReleases = releases.filter((r) => r.projectId === proj.id);
                      if (matchingReleases.length > 0) {
                        onSelectRelease(matchingReleases[0]);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>{proj.projectName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{proj.department} • {proj.ownerName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Releases Selector Section */}
          <div className="pt-3 border-t border-white/10">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Target Release Candidate ({projectReleases.length})
            </label>

            {projectReleases.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2">No releases found for this project.</p>
            ) : (
              <div className="space-y-1.5">
                {projectReleases.map((rel) => {
                  const isSelected = rel.id === activeRelease?.id;
                  return (
                    <button
                      key={rel.id}
                      onClick={() => {
                        onSelectRelease(rel);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold flex items-center gap-1.5 leading-snug">
                            <span className="truncate">{rel.releaseName}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Target Date: {rel.targetDate}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider shrink-0 text-center ${
                        rel.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        rel.status === 'under_assessment' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                        rel.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {rel.status.replace('_', ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

