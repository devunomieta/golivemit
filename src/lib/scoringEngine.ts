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

export interface CriterionResponse {
  criterionId: string;
  likelihood: number; // 1 (Very Low) to 5 (Very High)
  impact: number;     // 1 (Very Low) to 5 (Very High)
  calculatedRiskScore: number; // Likelihood * Impact
  comment?: string;
  evidenceUrl?: string;
  updatedBy?: string;
  updatedAt?: string;
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
    let maxDomainRisk = domainCriteria.length * 25; // Max score per criterion = 5 * 5 = 25
    let domainHasBlocker = false;
    const domainBlockers: string[] = [];

    domainCriteria.forEach((criterion) => {
      const resp = responses[criterion.id] || {
        criterionId: criterion.id,
        likelihood: 3,
        impact: 3,
        calculatedRiskScore: 9,
      };

      const riskScore = resp.likelihood * resp.impact; // Range 1 - 25
      domainRisk += riskScore;

      // Gate Rule Blocker Check: High Risk (Likelihood * Impact >= 15) or unfulfilled gate
      if (criterion.gateRuleFlag && riskScore >= 15) {
        domainHasBlocker = true;
        hasGlobalGateBlocker = true;
        const msg = `[Blocker] ${domain.name}: ${criterion.criterionText} (Risk Score: ${riskScore}/25)`;
        domainBlockers.push(msg);
        activeBlockers.push(msg);
      }
    });

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
