export type UserRole = 
  | 'admin'
  | 'project_manager'
  | 'developer'
  | 'qa'
  | 'devops'
  | 'security'
  | 'business'
  | 'approver';

export type RecommendationType = 'GO' | 'CONDITIONAL_GO' | 'NO_GO';

export type AssessmentStatus = 'draft' | 'under_assessment' | 'pending_approval' | 'approved' | 'rejected';

export interface ReadinessDomain {
  id: string;
  name: string;
  defaultWeight: number; // Percentage 0-100
  description: string;
}

export interface ReadinessCriterion {
  id: string;
  domainId: string;
  criterionText: string;
  weight: number; // Percentage within domain or overall
  assignedRole: UserRole;
  gateRuleFlag: boolean; // Mandatory gate blocker if failed
}

export interface AuditHistoryRecord {
  id: string;
  updatedBy: string;
  updatedAt: string;
  action: string;
  previousRiskScore?: number;
  newRiskScore?: number;
  comment?: string;
  evidenceUrl?: string;
}

export interface CriterionComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
  updatedAt?: string;
  isEdited?: boolean;
}

export interface EvidenceMetadata {
  url?: string;
  filename?: string;
  type?: 'url' | 'file';
  isWrongFile?: boolean;
  flaggedBy?: string;
  flaggedAt?: string;
  flagReason?: string;
  verificationStatus?: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
}

export interface CriterionResponse {
  criterionId: string;
  likelihood: number; // 0 (Unassessed) or 1 (Very Low) to 5 (Very High)
  impact: number;     // 0 (Unassessed) or 1 (Very Low) to 5 (Very High)
  calculatedRiskScore: number; // Likelihood * Impact
  comment?: string;
  evidenceUrl?: string;
  evidenceFilename?: string;
  evidenceType?: 'url' | 'file';
  evidenceMetadata?: EvidenceMetadata;
  commentsThread?: CriterionComment[];
  assignedRoleOverride?: UserRole;
  assignedUserId?: string;
  updatedBy?: string;
  updatedAt?: string;
  auditTrail?: AuditHistoryRecord[];
  status?: 'PASSED' | 'FAILED' | 'UNASSESSED';
  riskScore?: number; // Alias for calculatedRiskScore
  criterionWeight?: number;
  isGateRule?: boolean;
}

export interface GateStatus {
  blocked: boolean;
  failedCriteria: string[];
}

export interface AssessmentSummary {
  scoreDeficit: number; // 100 - overallScore
  activeGateBlockers: Array<{ domainName: string; criterionId?: string }>;
  weakDomains: Array<{ name: string; score: number }>;
  evaluatorVariance: number;
  varianceThreshold: number;
}

export interface DRIResult {
  dri: number;
  contributingConditions: string[];
}

/**
 * Thesis Snippet 4.2: Weighted Domain Calculation
 * Reusable function calculating domain score using individual criterion weights.
 */
export function calculateDomainScore(
  responses: CriterionResponse[]
): number {
  const weightedSum = responses.reduce(
    (sum, response) =>
      sum +
      (response.riskScore ?? response.calculatedRiskScore ?? (response.likelihood * response.impact)) *
      (response.criterionWeight ?? 1),
    0
  );
  const weightTotal = responses.reduce(
    (sum, response) => sum + (response.criterionWeight ?? 1),
    0
  );
  return weightTotal === 0 ? 0 : weightedSum / weightTotal;
}

/**
 * Thesis Snippet 4.3: Gate Evaluation
 * Evaluates mandatory gate rules and enforces Gate Rule Blocker Override Principle.
 */
export function evaluateGateRules(
  responses: CriterionResponse[]
): GateStatus {
  const failedGates = responses.filter(
    (response) => response.isGateRule && response.status === 'FAILED'
  );
  return {
    blocked: failedGates.length > 0,
    failedCriteria: failedGates.map((response) => response.criterionId),
  };
}

/**
 * Thesis Snippet 4.4: Deterministic DRI Processing
 * Transparent, deterministic calculation of Deployment Risk Index.
 */
export function calculateDRI(
  input: AssessmentSummary
): DRIResult {
  const dri = input.scoreDeficit;
  const conditions: string[] = [];

  if (input.activeGateBlockers.length > 0) {
    conditions.push(
      ...input.activeGateBlockers.map(
        (gate) => `Active gate blocker: ${gate.domainName}`
      )
    );
  }

  input.weakDomains.forEach((domain) => {
    conditions.push(`Weak domain: ${domain.name}`);
  });

  if (input.evaluatorVariance > input.varianceThreshold) {
    conditions.push('Significant evaluator disagreement detected');
  }

  return {
    dri: Math.round(dri),
    contributingConditions: conditions,
  };
}

export interface DomainScoreResult {
  domainId: string;
  domainName: string;
  weight: number;
  rawRiskScore: number;
  maxPossibleRisk: number;
  readinessPercentage: number;
  hasGateBlocker: boolean;
  blockerDetails: string[];
}

export interface OverallAssessmentResult {
  overallScore: number; // 0 - 100%
  recommendation: RecommendationType;
  hasGateBlocker: boolean;
  activeBlockers: string[];
  domainBreakdown: DomainScoreResult[];
}

/**
 * Calculates domain scores, overall readiness score, and recommendation
 * strictly applying the Gate Rule blocker override principle.
 */
export function calculateAssessmentReadiness(
  domains: ReadinessDomain[],
  criteria: ReadinessCriterion[],
  responses: Record<string, CriterionResponse>
): OverallAssessmentResult {
  let totalWeightedReadiness = 0;
  let totalWeightSum = 0;
  let hasGlobalGateBlocker = false;
  const activeBlockers: string[] = [];
  const domainBreakdown: DomainScoreResult[] = [];

  domains.forEach((domain) => {
    const domainCriteria = criteria.filter((c) => c.domainId === domain.id);
    if (domainCriteria.length === 0) {
      domainBreakdown.push({
        domainId: domain.id,
        domainName: domain.name,
        weight: domain.defaultWeight,
        rawRiskScore: 0,
        maxPossibleRisk: 0,
        readinessPercentage: 100,
        hasGateBlocker: false,
        blockerDetails: [],
      });
      totalWeightedReadiness += 100 * (domain.defaultWeight / 100);
      totalWeightSum += domain.defaultWeight;
      return;
    }

    let domainRisk = 0;
    const maxDomainRisk = domainCriteria.length * 25; // Max score per criterion = 5 * 5 = 25
    let domainHasBlocker = false;
    const domainBlockers: string[] = [];

    // Map responses to include weights & gate flags for evaluateGateRules & calculateDomainScore
    const domainResponses: CriterionResponse[] = domainCriteria.map((criterion) => {
      const resp = responses[criterion.id] || {
        criterionId: criterion.id,
        likelihood: 3,
        impact: 3,
        calculatedRiskScore: 9,
      };

      const isAssessed = resp.likelihood > 0 && resp.impact > 0;
      const riskScore = isAssessed ? resp.likelihood * resp.impact : 0;
      let status: 'PASSED' | 'FAILED' | 'UNASSESSED' = 'PASSED';
      if (!isAssessed) {
        status = 'UNASSESSED';
      } else if (criterion.gateRuleFlag && riskScore >= 15) {
        status = 'FAILED';
      }

      return {
        ...resp,
        riskScore,
        calculatedRiskScore: riskScore,
        criterionWeight: criterion.weight || 10,
        isGateRule: criterion.gateRuleFlag,
        status,
      };
    });

    domainResponses.forEach((resp) => {
      const riskScore = resp.calculatedRiskScore;
      domainRisk += riskScore;
    });

    // Invoke evaluateGateRules (Snippet 4.3)
    const gateEval = evaluateGateRules(domainResponses);
    if (gateEval.blocked) {
      domainHasBlocker = true;
      hasGlobalGateBlocker = true;
      gateEval.failedCriteria.forEach((critId) => {
        const crit = domainCriteria.find((c) => c.id === critId);
        const resp = domainResponses.find((r) => r.criterionId === critId);
        const score = resp ? resp.calculatedRiskScore : 15;
        const msg = `[Blocker] ${domain.name}: ${crit ? crit.criterionText : 'Gate Rule Failed'} (Risk Score: ${score}/25)`;
        domainBlockers.push(msg);
        activeBlockers.push(msg);
      });
    }

    const domainReadiness = Math.max(0, Math.round(((maxDomainRisk - domainRisk) / maxDomainRisk) * 100));

    domainBreakdown.push({
      domainId: domain.id,
      domainName: domain.name,
      weight: domain.defaultWeight,
      rawRiskScore: domainRisk,
      maxPossibleRisk: maxDomainRisk,
      readinessPercentage: domainReadiness,
      hasGateBlocker: domainHasBlocker,
      blockerDetails: domainBlockers,
    });

    totalWeightedReadiness += domainReadiness * (domain.defaultWeight / 100);
    totalWeightSum += domain.defaultWeight;
  });

  const overallScore = totalWeightSum > 0 
    ? Math.min(100, Math.max(0, Math.round((totalWeightedReadiness / (totalWeightSum / 100)))))
    : 0;

  // Recommendation Engine Logic
  let recommendation: RecommendationType = 'GO';

  if (hasGlobalGateBlocker) {
    recommendation = 'NO_GO';
  } else if (overallScore >= 80) {
    recommendation = 'GO';
  } else if (overallScore >= 60) {
    recommendation = 'CONDITIONAL_GO';
  } else {
    recommendation = 'NO_GO';
  }

  return {
    overallScore,
    recommendation,
    hasGateBlocker: hasGlobalGateBlocker,
    activeBlockers,
    domainBreakdown,
  };
}
