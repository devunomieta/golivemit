import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { 
  UserProfile, 
  ReadinessDomain, 
  ReadinessCriterion, 
  CriterionResponse, 
  ApprovalRecord,
  MOCK_USERS,
  INITIAL_DOMAINS,
  INITIAL_CRITERIA,
  INITIAL_RESPONSES,
  MOCK_RESPONSES_BY_RELEASE
} from '@/lib/mockData';



export async function fetchProfiles(): Promise<UserProfile[]> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_USERS;
  }
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error || !data || data.length === 0) return MOCK_USERS;
    return data.map((p) => ({
      id: p.id,
      name: p.full_name,
      email: p.email,
      role: p.role_name,
      department: p.department || 'IT',
    }));
  } catch {
    return MOCK_USERS;
  }
}

export async function fetchDomains(): Promise<ReadinessDomain[]> {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_DOMAINS;
  }
  try {
    const { data, error } = await supabase.from('readiness_domains').select('*');
    if (error || !data || data.length === 0) return INITIAL_DOMAINS;
    return data.map((d) => ({
      id: d.id,
      name: d.domain_name,
      defaultWeight: d.weight,
      description: d.description || '',
    }));
  } catch {
    return INITIAL_DOMAINS;
  }
}

export async function fetchCriteria(): Promise<ReadinessCriterion[]> {
  if (!isSupabaseConfigured || !supabase) {
    return INITIAL_CRITERIA;
  }
  try {
    const { data, error } = await supabase.from('readiness_criteria').select('*');
    if (error || !data || data.length === 0) return INITIAL_CRITERIA;
    return data.map((c) => ({
      id: c.id,
      domainId: c.domain_id,
      criterionText: c.criterion_text,
      weight: c.weight,
      assignedRole: c.assigned_role,
      gateRuleFlag: c.gate_rule_flag,
    }));
  } catch {
    return INITIAL_CRITERIA;
  }
}

export async function fetchAssessmentResponses(releaseId: string): Promise<Record<string, CriterionResponse>> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_RESPONSES_BY_RELEASE[releaseId] || MOCK_RESPONSES_BY_RELEASE['r1'] || INITIAL_RESPONSES;
  }
  try {
    // Get latest assessment for release
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('release_id', releaseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!assessment) {
      return MOCK_RESPONSES_BY_RELEASE[releaseId] || MOCK_RESPONSES_BY_RELEASE['r1'] || INITIAL_RESPONSES;
    }

    const { data: respData, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessment.id);

    if (error || !respData || respData.length === 0) {
      return MOCK_RESPONSES_BY_RELEASE[releaseId] || MOCK_RESPONSES_BY_RELEASE['r1'] || INITIAL_RESPONSES;
    }

    const map: Record<string, CriterionResponse> = {};
    respData.forEach((r) => {
      map[r.criterion_id] = {
        criterionId: r.criterion_id,
        likelihood: r.likelihood,
        impact: r.impact,
        calculatedRiskScore: r.calculated_risk_score,
        comment: r.comment || '',
        evidenceUrl: r.evidence_url || '',
      };
    });
    return map;
  } catch {
    return MOCK_RESPONSES_BY_RELEASE[releaseId] || MOCK_RESPONSES_BY_RELEASE['r1'] || INITIAL_RESPONSES;
  }
}


export async function saveAssessmentResponse(
  releaseId: string,
  userId: string,
  responses: Record<string, CriterionResponse>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    // 1. Get or Create assessment record
    let { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('release_id', releaseId)
      .limit(1)
      .maybeSingle();

    if (!assessment) {
      const { data: newAss, error: assErr } = await supabase
        .from('assessments')
        .insert([{ release_id: releaseId, created_by: userId, status: 'under_assessment' }])
        .select()
        .single();
      if (assErr || !newAss) return false;
      assessment = newAss;
    }

    // 2. Upsert assessment responses
    const responsePayload = Object.values(responses).map((r) => ({
      assessment_id: assessment!.id,
      criterion_id: r.criterionId,
      likelihood: r.likelihood,
      impact: r.impact,
      calculated_risk_score: r.calculatedRiskScore,
      comment: r.comment,
      evidence_url: r.evidenceUrl,
    }));

    await supabase
      .from('assessment_responses')
      .upsert(responsePayload, { onConflict: 'assessment_id,criterion_id' });

    // 3. Record Audit Log
    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action: 'UPDATE_ASSESSMENT_RESPONSES',
        affected_table: 'assessment_responses',
        details: JSON.stringify({ releaseId, count: responsePayload.length }),
      },
    ]);

    return true;
  } catch {
    return false;
  }
}

export async function fetchApprovals(releaseId: string): Promise<ApprovalRecord[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('release_id', releaseId)
      .limit(1)
      .maybeSingle();

    if (!assessment) return [];

    const { data, error } = await supabase
      .from('approvals')
      .select('*, profiles(full_name)')
      .eq('assessment_id', assessment.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((a) => ({
      id: a.id,
      assessmentId: a.assessment_id,
      approverName: (a.profiles as { full_name?: string })?.full_name || 'Board Approver',
      decision: a.decision,
      conditionsText: a.conditions_text,
      conditionsOwner: a.conditions_owner,
      dueDate: a.due_date,
      createdAt: a.created_at,
    }));
  } catch {
    return [];
  }
}

export async function submitApprovalVote(
  releaseId: string,
  userId: string,
  decision: 'GO' | 'CONDITIONAL_GO' | 'NO_GO',
  conditionsText?: string,
  conditionsOwner?: string,
  dueDate?: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id')
      .eq('release_id', releaseId)
      .limit(1)
      .maybeSingle();

    if (!assessment) return false;

    const { error } = await supabase.from('approvals').insert([
      {
        assessment_id: assessment.id,
        approver_id: userId,
        decision,
        conditions_text: conditionsText,
        conditions_owner: conditionsOwner,
        due_date: dueDate,
      },
    ]);

    if (error) return false;

    // Log governance vote
    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action: 'CAST_GOVERNANCE_VOTE',
        affected_table: 'approvals',
        details: JSON.stringify({ decision, conditionsText }),
      },
    ]);

    return true;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// PROJECT & RELEASE MANAGEMENT SERVICES
// ----------------------------------------------------

import { ProjectRecord, ReleaseRecord, MOCK_PROJECTS_STORE, MOCK_RELEASES_STORE } from '@/lib/mockData';

export async function fetchProjects(): Promise<ProjectRecord[]> {
  if (!isSupabaseConfigured || !supabase) {
    return MOCK_PROJECTS_STORE;
  }
  try {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return MOCK_PROJECTS_STORE;
    return data.map((p) => ({
      id: p.id,
      projectName: p.project_name,
      department: p.department,
      description: p.description || '',
      ownerName: p.owner_name,
    }));
  } catch {
    return MOCK_PROJECTS_STORE;
  }
}

export async function createProject(project: Omit<ProjectRecord, 'id'>, userId?: string): Promise<ProjectRecord | null> {
  const newId = `p-${Date.now()}`;
  const newProject: ProjectRecord = { id: newId, ...project };

  if (!isSupabaseConfigured || !supabase) {
    MOCK_PROJECTS_STORE.unshift(newProject);
    return newProject;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          project_name: project.projectName,
          department: project.department,
          description: project.description,
          owner_name: project.ownerName,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      MOCK_PROJECTS_STORE.unshift(newProject);
      return newProject;
    }

    if (userId) {
      await supabase.from('audit_logs').insert([
        {
          user_id: userId,
          action: 'CREATE_PROJECT',
          affected_table: 'projects',
          details: JSON.stringify({ projectId: data.id, projectName: data.project_name }),
        },
      ]);
    }

    return {
      id: data.id,
      projectName: data.project_name,
      department: data.department,
      description: data.description || '',
      ownerName: data.owner_name,
    };
  } catch {
    MOCK_PROJECTS_STORE.unshift(newProject);
    return newProject;
  }
}

export async function updateProject(id: string, updates: Partial<ProjectRecord>, userId?: string): Promise<boolean> {
  // Update mock store
  const idx = MOCK_PROJECTS_STORE.findIndex((p) => p.id === id);
  if (idx !== -1) {
    MOCK_PROJECTS_STORE[idx] = { ...MOCK_PROJECTS_STORE[idx], ...updates };
  }

  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const payload: Record<string, string> = {};
    if (updates.projectName) payload.project_name = updates.projectName;
    if (updates.department) payload.department = updates.department;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.ownerName) payload.owner_name = updates.ownerName;

    const { error } = await supabase.from('projects').update(payload).eq('id', id);

    if (!error && userId) {
      await supabase.from('audit_logs').insert([
        {
          user_id: userId,
          action: 'UPDATE_PROJECT',
          affected_table: 'projects',
          details: JSON.stringify({ projectId: id, updates }),
        },
      ]);
    }

    return !error;
  } catch {
    return true;
  }
}

export async function fetchReleases(projectId?: string): Promise<ReleaseRecord[]> {
  if (!isSupabaseConfigured || !supabase) {
    if (projectId) {
      return MOCK_RELEASES_STORE.filter((r) => r.projectId === projectId);
    }
    return MOCK_RELEASES_STORE;
  }

  try {
    let query = supabase.from('releases').select('*').order('created_at', { ascending: false });
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return projectId ? MOCK_RELEASES_STORE.filter((r) => r.projectId === projectId) : MOCK_RELEASES_STORE;
    }

    return data.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      releaseName: r.release_name,
      targetDate: r.target_date,
      status: r.status,
    }));
  } catch {
    return projectId ? MOCK_RELEASES_STORE.filter((r) => r.projectId === projectId) : MOCK_RELEASES_STORE;
  }
}

export async function createRelease(release: Omit<ReleaseRecord, 'id'>, userId?: string): Promise<ReleaseRecord | null> {
  const newId = `r-${Date.now()}`;
  const newRelease: ReleaseRecord = { id: newId, ...release };

  if (!isSupabaseConfigured || !supabase) {
    MOCK_RELEASES_STORE.unshift(newRelease);
    return newRelease;
  }

  try {
    const { data, error } = await supabase
      .from('releases')
      .insert([
        {
          project_id: release.projectId,
          release_name: release.releaseName,
          target_date: release.targetDate,
          status: release.status,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      MOCK_RELEASES_STORE.unshift(newRelease);
      return newRelease;
    }

    if (userId) {
      await supabase.from('audit_logs').insert([
        {
          user_id: userId,
          action: 'CREATE_RELEASE',
          affected_table: 'releases',
          details: JSON.stringify({ releaseId: data.id, releaseName: data.release_name }),
        },
      ]);
    }

    return {
      id: data.id,
      projectId: data.project_id,
      releaseName: data.release_name,
      targetDate: data.target_date,
      status: data.status,
    };
  } catch {
    MOCK_RELEASES_STORE.unshift(newRelease);
    return newRelease;
  }
}

export async function updateReleaseStatus(
  releaseId: string, 
  status: 'draft' | 'under_assessment' | 'approved' | 'rejected', 
  userId?: string
): Promise<boolean> {
  const idx = MOCK_RELEASES_STORE.findIndex((r) => r.id === releaseId);
  if (idx !== -1) {
    MOCK_RELEASES_STORE[idx].status = status;
  }

  if (!isSupabaseConfigured || !supabase) return true;

  try {
    const { error } = await supabase.from('releases').update({ status }).eq('id', releaseId);
    if (!error && userId) {
      await supabase.from('audit_logs').insert([
        {
          user_id: userId,
          action: 'UPDATE_RELEASE_STATUS',
          affected_table: 'releases',
          details: JSON.stringify({ releaseId, status }),
        },
      ]);
    }
    return !error;
  } catch {
    return true;
  }
}

