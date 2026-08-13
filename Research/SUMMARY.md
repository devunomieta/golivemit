# Research and Project Summary: GoLive MIT

## Project Metadata
- Project Title: Design and Development of a Risk-Based Go-Live Readiness Decision Support System (DSS) for Enterprise Software Delivery
- Author: Akpo Mamuzou Raphael
- Matriculation Number: 2025/A/MIT/0214
- Student ID: 301803855
- Institution: MIVA Open University — Master's In Information Technology (MIT)
- Academic Session: 2025/2026 (May 2026)
- Source Document: Research/golivedoc.docx

---

## 1. Executive Summary and Core Objectives

Enterprise software delivery often suffers from flawed go-live decisions driven by scattered spreadsheets, subjective opinions, last-minute pressure, and fragmented feedback across QA, Security, DevOps, and Business teams. 

The primary objective of GoLive MIT is to build a full-stack Web-Based Risk-Based Go-Live Readiness Decision Support System (DSS) that:
- Calculates quantified readiness scores.
- Evaluates hard Gate Rules (critical release blockers).
- Generates automated, rule-based recommendations (Go, Conditional Go, No-Go).
- Enforces multi-role sign-off and approval workflows.
- Maintains full auditability for compliance and governance.

---

## 2. Architectural and System Specifications

### A. 10 Readiness Domains and Default Weights

1. Functional Readiness (15% Weight)
   Core user journeys passed, business rules validated, and UAT sign-off completed.

2. Defect Readiness (15% Weight)
   Zero open critical defects; all high-severity defects have approved workarounds.

3. Security Readiness (10% Weight)
   Access control reviewed, vulnerability assessment complete, and sensitive data protected.

4. Performance Readiness (8% Weight)
   Load, stress, and response time checks completed under expected traffic levels.

5. Data Readiness (10% Weight)
   Data migration completed, reconciliation performed, and quality exceptions resolved.

6. Deployment Readiness (12% Weight)
   Release plan, release notes, environment readiness, and rollback plan confirmed.

7. Operational Readiness (10% Weight)
   Monitoring, support ownership, incident response, and hypercare plans ready.

8. User and Business Readiness (10% Weight)
   Staff training, user communication, process readiness, and Product Owner sign-off completed.

9. Compliance Readiness (5% Weight)
   Regulatory adherence (such as NDPA 2023), privacy policies, and internal governance checked.

10. Documentation Readiness (5% Weight)
    User guide, support desk playbook, and known issues or limitations documented.

---

### B. Risk Scoring and Decision Engine Logic

#### Evaluation Formula
Each criterion in an assessment is scored using:
- Inputs: Likelihood (scale 1 to 5) x Impact (scale 1 to 5) x Criterion Weight (%)
- Risk Score: Likelihood x Impact x Weight
- Overall Readiness Score (%): 100 - Normalized Risk Score

#### Decision Thresholds
- 80% to 100% -> Go
  Low residual risk and no active gate rule violations.

- 60% to 79% -> Conditional Go
  Moderate risk; requires explicit mitigation conditions, an assigned owner, and a deadline.

- Below 60% -> No-Go
  High residual risk; release must be postponed.

#### Hard Gate Rule Override
If any criterion flagged as a Gate Rule fails (such as a missing rollback plan, an open critical security vulnerability, or a failed data migration check), the system automatically forces a No-Go recommendation regardless of how high the overall numerical percentage score is.

---

### C. System User Roles (RBAC)

- Administrator: Manages users, configures domain and criteria weights, toggles gate rules, and reviews system logs.
- Project Manager: Manages projects and releases, initiates assessments, and assigns domain owners.
- Domain Contributor (QA, Security, DevOps, Business): Evaluates assigned criteria, inputs Likelihood and Impact scores, and attaches evidence or documentation links.
- Approver / Release Board / Sponsor: Reviews risk dashboards, issues final sign-off decisions (Go, Conditional Go, No-Go), and assigns mitigation actions.

---

## 3. Database Schema Overview (11 Core Entities)

- users: Auth accounts and profile credentials.
- roles: System role permissions (Admin, PM, Contributor, Approver).
- projects: Project metadata, owner, and department.
- releases: Specific software versions linked to projects.
- readiness_domains: Domain categories and weight settings.
- readiness_criteria: Evaluation items and gate rule flags.
- assessments: Assessment instances, aggregate score, and current state.
- assessment_responses: Individual criterion Likelihood and Impact scores with notes.
- approvals: Final decision notes, conditions, and sign-offs.
- audit_logs: Full historical activity trail.
- attachments: Uploaded evidence files and document links.

---

## 4. Key UI and UX Modules

1. Login and Authentication Screen
   Secure multi-role access control and authentication.

2. Executive Dashboard
   Aggregate readiness gauges, blockers summary, active approvals, and release timeline.

3. Project and Release Management Screen
   Project lifecycle setup, versioning, and scope assignment.

4. Criteria and Weight Configuration Screen
   Admin panel to adjust domain weights, customize criteria questions, and toggle gate rules.

5. Interactive Assessment Form
   Guided evaluation form with Likelihood and Impact inputs, gate rule badges, and file attachments.

6. Risk and Gate Summary Screen
   Visual domain score breakdown, blocker callouts, and residual risk evaluation.

7. Approval and Sign-off Panel
   Official decision submission workflow with conditional requirement tracking.

8. Reports and Audit Log Screen
   Exportable PDF or HTML readiness report and a complete activity log.
