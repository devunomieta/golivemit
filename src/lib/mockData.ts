import { 
  UserRole, 
  ReadinessDomain, 
  ReadinessCriterion, 
  CriterionResponse,
  AssessmentStatus
} from '@/lib/scoringEngine';

export type { 
  UserRole, 
  ReadinessDomain, 
  ReadinessCriterion, 
  CriterionResponse,
  AssessmentStatus
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export interface ProjectRecord {
  id: string;
  projectName: string;
  department: string;
  description: string;
  ownerName: string;
}

export interface ReleaseRecord {
  id: string;
  projectId: string;
  releaseName: string;
  targetDate: string;
  status: AssessmentStatus;
}

export interface AssessmentRecord {
  id: string;
  releaseId: string;
  createdBy: string;
  status: AssessmentStatus;
  responses: Record<string, CriterionResponse>;
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  assessmentId: string;
  approverName: string;
  decision: 'GO' | 'CONDITIONAL_GO' | 'NO_GO';
  comments?: string;
  evidenceUrl?: string;
  evidenceFileName?: string;
  evidenceFileData?: string;
  signatureStamp?: string;
  digitalSignatureName?: string;
  conditionsText?: string;
  conditionsOwner?: string;
  dueDate?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export const MOCK_USERS: UserProfile[] = [
  { id: 'u1', name: 'Mamuzou Raphael (Admin)', email: 'm.akpo3855@miva.edu.ng', role: 'admin', department: 'IT Governance' },
  { id: 'u2', name: 'Sarah Jenkins (PM)', email: 'sarah.j@company.com', role: 'project_manager', department: 'Software Delivery' },
  { id: 'u3', name: 'David Okonjo (Lead Dev)', email: 'david.o@company.com', role: 'developer', department: 'Core Engineering' },
  { id: 'u4', name: 'Anita Chen (QA Lead)', email: 'anita.c@company.com', role: 'qa', department: 'Quality Assurance' },
  { id: 'u5', name: 'Marcus Vance (DevOps)', email: 'marcus.v@company.com', role: 'devops', department: 'Cloud Infra' },
  { id: 'u6', name: 'Elena Rostova (Sec Lead)', email: 'elena.r@company.com', role: 'security', department: 'InfoSec' },
  { id: 'u7', name: 'Tunde Bakare (Product Owner)', email: 'tunde.b@company.com', role: 'business', department: 'Digital Products' },
  { id: 'u8', name: 'Dr. Charles Adams (Release Board)', email: 'charles.a@company.com', role: 'approver', department: 'Executive Board' },
];



export const INITIAL_DOMAINS: ReadinessDomain[] = [
  { id: 'd1', name: 'Functional Readiness', defaultWeight: 15, description: 'Core user journeys passed, business rules validated, UAT sign-off obtained' },
  { id: 'd2', name: 'Defect Readiness', defaultWeight: 15, description: 'Zero open critical defects, high defects have approved workarounds' },
  { id: 'd3', name: 'Security Readiness', defaultWeight: 10, description: 'Access control reviewed, vulnerabilities assessed, sensitive data protected' },
  { id: 'd4', name: 'Performance Readiness', defaultWeight: 8, description: 'Load, stress, and response time checks completed where applicable' },
  { id: 'd5', name: 'Data Readiness', defaultWeight: 10, description: 'Migration completed, reconciliation performed, data quality exceptions reviewed' },
  { id: 'd6', name: 'Deployment Readiness', defaultWeight: 12, description: 'Deployment plan, release notes, environment readiness, rollback plan confirmed' },
  { id: 'd7', name: 'Operational Readiness', defaultWeight: 10, description: 'Monitoring, support ownership, incident process, hypercare plan confirmed' },
  { id: 'd8', name: 'User & Business Readiness', defaultWeight: 10, description: 'Training, communication, process readiness, Product Owner sign-off confirmed' },
  { id: 'd9', name: 'Compliance Readiness', defaultWeight: 5, description: 'Privacy (NDPA 2023), regulatory, or internal governance checks completed' },
  { id: 'd10', name: 'Documentation Readiness', defaultWeight: 5, description: 'User guide, support guide, known issues documented' },
];

export const INITIAL_CRITERIA: ReadinessCriterion[] = [
  { id: 'c1', domainId: 'd1', criterionText: 'Core User Acceptance Testing (UAT) Sign-off Obtained', weight: 15, assignedRole: 'business', gateRuleFlag: true },
  { id: 'c2', domainId: 'd1', criterionText: 'Build Pass Rate & Code Coverage >= 80% Certified by Engineering', weight: 10, assignedRole: 'developer', gateRuleFlag: false },
  { id: 'c3', domainId: 'd2', criterionText: 'Zero Open Critical (Severity 1) Defects in Candidate Build', weight: 15, assignedRole: 'qa', gateRuleFlag: true },
  { id: 'c4', domainId: 'd2', criterionText: 'Automated Regression Suite Pass Rate >= 95%', weight: 10, assignedRole: 'qa', gateRuleFlag: false },
  { id: 'c5', domainId: 'd3', criterionText: 'SAST/DAST Vulnerability Scans Passed (Zero Critical Vulnerabilities)', weight: 15, assignedRole: 'security', gateRuleFlag: true },
  { id: 'c6', domainId: 'd3', criterionText: 'Identity & Role-Based Access Control (RBAC) Hardened', weight: 10, assignedRole: 'security', gateRuleFlag: false },
  { id: 'c7', domainId: 'd4', criterionText: 'Peak Load & Response Time Thresholds Validated (<500ms API latency)', weight: 10, assignedRole: 'qa', gateRuleFlag: false },
  { id: 'c8', domainId: 'd5', criterionText: 'Database Schema Migration Dry-Run & Reconciliation Passed', weight: 12, assignedRole: 'developer', gateRuleFlag: true },
  { id: 'c9', domainId: 'd6', criterionText: 'Verified Production Rollback & Automated Recovery Script Configured', weight: 15, assignedRole: 'devops', gateRuleFlag: true },
  { id: 'c10', domainId: 'd6', criterionText: 'Production Parity & Staging Environment Validation', weight: 10, assignedRole: 'devops', gateRuleFlag: false },
  { id: 'c11', domainId: 'd7', criterionText: 'Service Desk & Hypercare Support Ownership Confirmed', weight: 10, assignedRole: 'business', gateRuleFlag: false },
  { id: 'c12', domainId: 'd8', criterionText: 'End-User Training & Change Communication Released', weight: 10, assignedRole: 'business', gateRuleFlag: false },
  { id: 'c13', domainId: 'd9', criterionText: 'Nigeria Data Protection Act (NDPA 2023) Compliance Audit Sign-off', weight: 10, assignedRole: 'security', gateRuleFlag: false },
  { id: 'c14', domainId: 'd10', criterionText: 'System Operations Guide & Release Notes Exported', weight: 10, assignedRole: 'developer', gateRuleFlag: false },
  { id: 'c15', domainId: 'd5', criterionText: 'Data pipeline migration & analytics tracking verification completed', weight: 8, assignedRole: 'developer', gateRuleFlag: false },
  { id: 'c16', domainId: 'd7', criterionText: 'APM telemetry dashboard, error logging & alerting threshold rules configured', weight: 10, assignedRole: 'devops', gateRuleFlag: true },
];

export const INITIAL_PROJECTS: ProjectRecord[] = [
  { id: 'p1', projectName: 'Core Banking API Modernization', department: 'Fintech Engineering', description: 'Migrating legacy core banking modules to microservices architecture.', ownerName: 'David Okonjo' },
  { id: 'p2', projectName: 'Customer Self-Service Portal v3.0', department: 'Digital Channels', description: 'Web-based portal for account management and transaction history.', ownerName: 'Sarah Jenkins' },
];

export const INITIAL_RELEASES: ReleaseRecord[] = [
  { id: 'r1', projectId: 'p1', releaseName: 'Payment Gateway Integration v2.4.0', targetDate: '2026-08-25', status: 'under_assessment' },
  { id: 'r2', projectId: 'p2', releaseName: 'Portal Self-Service v3.0.0-RC1', targetDate: '2026-09-10', status: 'draft' },
];

export const MOCK_PROJECTS_STORE: ProjectRecord[] = [...INITIAL_PROJECTS];
export const MOCK_RELEASES_STORE: ReleaseRecord[] = [...INITIAL_RELEASES];

// Release r1 (Core Banking API): Has 1 Gate Blocker on c9 -> NO-GO (72%)
export const RESPONSES_RELEASE_R1: Record<string, CriterionResponse> = {
  c1: { criterionId: 'c1', likelihood: 1, impact: 5, calculatedRiskScore: 5, comment: 'UAT completed with 100% sign-off from Product Owner.', evidenceUrl: 'https://jira.company.com/uat-signoff-882' },
  c2: { criterionId: 'c2', likelihood: 2, impact: 3, calculatedRiskScore: 6, comment: 'Coverage at 84.5% on SonarQube.', evidenceUrl: 'https://sonar.company.com/build/4910' },
  c3: { criterionId: 'c3', likelihood: 1, impact: 5, calculatedRiskScore: 5, comment: 'Zero Sev-1 defects remaining in candidate release build.', evidenceUrl: 'https://jira.company.com/defects/sev1-zero' },
  c4: { criterionId: 'c4', likelihood: 2, impact: 3, calculatedRiskScore: 6, comment: 'Automated suite pass rate at 97.2%.', evidenceUrl: 'https://jenkins.company.com/job/regression/102' },
  c5: { criterionId: 'c5', likelihood: 1, impact: 5, calculatedRiskScore: 5, comment: 'Veracode SAST scan clear of high/critical vulnerabilities.', evidenceUrl: 'https://security.company.com/scans/771' },
  c6: { criterionId: 'c6', likelihood: 2, impact: 4, calculatedRiskScore: 8, comment: 'JWT access token policy enforced.' },
  c7: { criterionId: 'c7', likelihood: 2, impact: 3, calculatedRiskScore: 6, comment: 'JMeter load test averaged 280ms latency under 5000 users.' },
  c8: { criterionId: 'c8', likelihood: 2, impact: 5, calculatedRiskScore: 10, comment: 'Migration script executed on staging DB with 0 data drift.' },
  c9: { criterionId: 'c9', likelihood: 4, impact: 5, calculatedRiskScore: 20, comment: 'Rollback script missing automated data restoration steps!', evidenceUrl: 'https://github.com/company/infra/issues/409' },
  c10: { criterionId: 'c10', likelihood: 2, impact: 3, calculatedRiskScore: 6, comment: 'Staging environment matches prod specs.' },
  c11: { criterionId: 'c11', likelihood: 2, impact: 3, calculatedRiskScore: 6, comment: 'Tier 2 service desk agents briefed.' },
  c12: { criterionId: 'c12', likelihood: 2, impact: 2, calculatedRiskScore: 4, comment: 'User guides distributed to internal staff.' },
  c13: { criterionId: 'c13', likelihood: 2, impact: 4, calculatedRiskScore: 8, comment: 'NDPA 2023 data compliance checklist verified.' },
  c14: { criterionId: 'c14', likelihood: 2, impact: 2, calculatedRiskScore: 4, comment: 'Release notes finalized in Confluence.' },
};

// Release r2 (Customer Portal v3.0): High readiness, 0 Gate Blockers -> GO (89%)
export const RESPONSES_RELEASE_R2: Record<string, CriterionResponse> = {
  c1: { criterionId: 'c1', likelihood: 1, impact: 4, calculatedRiskScore: 4, comment: 'UAT 100% completed by Digital Product Lead.', evidenceUrl: 'https://jira.company.com/portal-uat' },
  c2: { criterionId: 'c2', likelihood: 1, impact: 3, calculatedRiskScore: 3, comment: 'Code coverage at 88.2%.' },
  c3: { criterionId: 'c3', likelihood: 1, impact: 4, calculatedRiskScore: 4, comment: 'Zero open critical defects.' },
  c4: { criterionId: 'c4', likelihood: 1, impact: 2, calculatedRiskScore: 2, comment: 'Regression suite pass rate 99.1%.' },
  c5: { criterionId: 'c5', likelihood: 1, impact: 4, calculatedRiskScore: 4, comment: 'Security scan passed zero critical vulnerabilities.' },
  c6: { criterionId: 'c6', likelihood: 1, impact: 3, calculatedRiskScore: 3, comment: 'OAuth2 authentication verified.' },
  c7: { criterionId: 'c7', likelihood: 1, impact: 2, calculatedRiskScore: 2, comment: 'Average API latency 190ms.' },
  c8: { criterionId: 'c8', likelihood: 1, impact: 3, calculatedRiskScore: 3, comment: 'Database migration tested.' },
  c9: { criterionId: 'c9', likelihood: 1, impact: 3, calculatedRiskScore: 3, comment: 'Automated production rollback script verified!', evidenceUrl: 'https://github.com/company/infra/pull/112' },
  c10: { criterionId: 'c10', likelihood: 1, impact: 2, calculatedRiskScore: 2, comment: 'Staging environment parity verified.' },
  c11: { criterionId: 'c11', likelihood: 1, impact: 2, calculatedRiskScore: 2, comment: 'Support team trained.' },
  c12: { criterionId: 'c12', likelihood: 1, impact: 2, calculatedRiskScore: 2, comment: 'Customer release notes published.' },
  c13: { criterionId: 'c13', likelihood: 1, impact: 3, calculatedRiskScore: 3, comment: 'NDPA compliance sign-off obtained.' },
  c14: { criterionId: 'c14', likelihood: 1, impact: 2, calculatedRiskScore: 2, comment: 'Operations guide published.' },
};

export const MOCK_RESPONSES_BY_RELEASE: Record<string, Record<string, CriterionResponse>> = {
  r1: { ...RESPONSES_RELEASE_R1 },
  r2: { ...RESPONSES_RELEASE_R2 },
};

export const INITIAL_RESPONSES: Record<string, CriterionResponse> = RESPONSES_RELEASE_R1;
