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
  INITIAL_RESPONSES
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
    return INITIAL_RESPONSES;
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

    if (!assessment) return INITIAL_RESPONSES;

    const { data: respData, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessment.id);

    if (error || !respData || respData.length === 0) return INITIAL_RESPONSES;

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
    return INITIAL_RESPONSES;
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
