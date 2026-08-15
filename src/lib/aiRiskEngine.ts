/**
 * AI Risk Prediction & Mitigation Recommendation Engine
 * Evaluates Deployment Risk Index (DRI) and generates automated remediation strategies
 */

import { OverallAssessmentResult, ReadinessCriterion, CriterionResponse } from './scoringEngine';

export interface AIRiskAnalysis {
  deploymentRiskIndex: number; // 0 - 100%
  riskTier: 'LOW_RISK' | 'MODERATE_RISK' | 'CRITICAL_RISK';
  contributoryFactors: Array<{
    category: string;
    impactScore: number;
    description: string;
  }>;
  recommendedMitigations: Array<{
    id: string;
    title: string;
    description: string;
    ownerRole: string;
    category: string;
    priority: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  }>;
}

/**
 * Calculates Deployment Risk Index (DRI) and recommends automated mitigations
 */
export function calculateAIRiskAnalysis(
  assessmentResult: OverallAssessmentResult,
  criteria: ReadinessCriterion[],
  responses: Record<string, CriterionResponse>
): AIRiskAnalysis {
  const { overallScore, hasGateBlocker, activeBlockers, domainBreakdown } = assessmentResult;

  // 1. Calculate Base Risk Component (Inverse of Readiness Score)
  const scoreRisk = Math.max(0, 100 - overallScore);

  // 2. Calculate Blocker Penalty
  const blockerPenalty = activeBlockers.length * 25;

  // 3. Calculate Evaluator Variance / High-Risk Criteria Penalty
  let highRiskCount = 0;
  let variancePenalty = 0;

  criteria.forEach((c) => {
    const resp = responses[c.id];
    if (resp) {
      const riskScore = resp.likelihood * resp.impact;
      if (riskScore > 12) {
        highRiskCount++;
        variancePenalty += (riskScore - 12) * 2;
      }
    }
  });

  // Calculate composite Deployment Risk Index (DRI) capped at 100%
  const rawDRI = (scoreRisk * 0.45) + (blockerPenalty * 0.35) + (variancePenalty * 0.20);
  const deploymentRiskIndex = Math.min(100, Math.round(rawDRI));

  // Determine Risk Tier
  const riskTier: AIRiskAnalysis['riskTier'] = 
    deploymentRiskIndex >= 60 || hasGateBlocker ? 'CRITICAL_RISK' :
    deploymentRiskIndex >= 30 ? 'MODERATE_RISK' : 'LOW_RISK';

  // Contributory Risk Factors
  const contributoryFactors: AIRiskAnalysis['contributoryFactors'] = [];

  if (hasGateBlocker) {
    contributoryFactors.push({
      category: 'Hard Gate Blocker',
      impactScore: 40,
      description: `${activeBlockers.length} mandatory readiness gate condition(s) are failing.`,
    });
  }

  // Find lowest domain
  const sortedDomains = [...domainBreakdown].sort((a, b) => a.readinessPercentage - b.readinessPercentage);
  if (sortedDomains.length > 0 && sortedDomains[0].readinessPercentage < 80) {
    contributoryFactors.push({
      category: 'Domain Sub-Optimal',
      impactScore: 30,
      description: `${sortedDomains[0].domainName} has low readiness score (${sortedDomains[0].readinessPercentage}%).`,
    });
  }

  if (highRiskCount > 0) {
    contributoryFactors.push({
      category: 'High-Risk Criteria',
      impactScore: 20,
      description: `${highRiskCount} criteria evaluated with elevated likelihood/impact score (>12/25).`,
    });
  }

  // Recommended Mitigations Generator
  const recommendedMitigations: AIRiskAnalysis['recommendedMitigations'] = [];

  if (hasGateBlocker) {
    recommendedMitigations.push({
      id: 'mit-1',
      title: 'Enforce Zero-Downtime Rollback & Feature Flag Isolation',
      description: 'Isolate failing gate modules using dark launch feature flags. Dev Lead must verify automated dry-run rollback in staging.',
      ownerRole: 'Dev Lead / SecOps',
      category: 'Deployment Safety',
      priority: 'CRITICAL',
    });
  }

  if (sortedDomains.some((d) => d.domainId === 'd2' && d.readinessPercentage < 80)) {
    recommendedMitigations.push({
      id: 'mit-2',
      title: 'Mandatory Load Benchmark & Circuit Breaker Review',
      description: 'Run 100% capacity load simulation (k6 benchmark). Enable automated circuit breaker triggers for API endpoints.',
      ownerRole: 'Infrastructure Lead',
      category: 'Performance & Scalability',
      priority: 'HIGH',
    });
  }

  if (sortedDomains.some((d) => d.domainId === 'd4' && d.readinessPercentage < 80)) {
    recommendedMitigations.push({
      id: 'mit-3',
      title: 'Support Escalation On-Call Roster Verification',
      description: 'Confirm Tier 3 engineering escalation roster and 24/7 hypercare bridge availability prior to traffic cutover.',
      ownerRole: 'Service Desk Lead',
      category: 'Support Readiness',
      priority: 'HIGH',
    });
  }

  // Fallback default mitigation if clean
  if (recommendedMitigations.length === 0) {
    recommendedMitigations.push({
      id: 'mit-default',
      title: 'Standard Canary Deployment & Health Check Monitoring',
      description: 'Proceed with 10% traffic canary rollout window accompanied by automated APM error rate monitoring.',
      ownerRole: 'Release Manager',
      category: 'Standard Governance',
      priority: 'MEDIUM',
    });
  }

  return {
    deploymentRiskIndex,
    riskTier,
    contributoryFactors,
    recommendedMitigations,
  };
}
