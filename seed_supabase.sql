-- GoLive DSS Supabase Database Seed & Schema Migration Script

-- DROP existing tables if they were created with incompatible UUID types in Supabase UI
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.approvals CASCADE;
DROP TABLE IF EXISTS public.assessment_responses CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;
DROP TABLE IF EXISTS public.releases CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.readiness_criteria CASCADE;
DROP TABLE IF EXISTS public.readiness_domains CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role_name TEXT NOT NULL,
  department TEXT DEFAULT 'IT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Readiness Domains Table
CREATE TABLE public.readiness_domains (
  id TEXT PRIMARY KEY,
  domain_name TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Readiness Criteria Table
CREATE TABLE public.readiness_criteria (
  id TEXT PRIMARY KEY,
  domain_id TEXT REFERENCES public.readiness_domains(id) ON DELETE CASCADE,
  criterion_text TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 10,
  assigned_role TEXT NOT NULL,
  gate_rule_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projects Table
CREATE TABLE public.projects (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  owner_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Releases Table
CREATE TABLE public.releases (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  release_name TEXT NOT NULL,
  target_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Assessments Table
CREATE TABLE public.assessments (
  id TEXT PRIMARY KEY,
  release_id TEXT REFERENCES public.releases(id) ON DELETE CASCADE,
  created_by TEXT,
  status TEXT DEFAULT 'under_assessment',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Assessment Responses Table
CREATE TABLE public.assessment_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id TEXT REFERENCES public.assessments(id) ON DELETE CASCADE,
  criterion_id TEXT REFERENCES public.readiness_criteria(id) ON DELETE CASCADE,
  likelihood INTEGER NOT NULL DEFAULT 3,
  impact INTEGER NOT NULL DEFAULT 3,
  calculated_risk_score INTEGER NOT NULL DEFAULT 9,
  comment TEXT,
  evidence_url TEXT,
  evidence_filename TEXT,
  evidence_type TEXT,
  evidence_metadata TEXT,
  comments_thread TEXT,
  assigned_role_override TEXT,
  assigned_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_assessment_criterion UNIQUE (assessment_id, criterion_id)
);


-- 8. Approvals Table
CREATE TABLE public.approvals (
  id TEXT PRIMARY KEY,
  assessment_id TEXT REFERENCES public.assessments(id) ON DELETE CASCADE,
  approver_id TEXT,
  decision TEXT NOT NULL,
  comments TEXT,
  evidence_url TEXT,
  evidence_file_name TEXT,
  evidence_file_data TEXT,
  conditions_text TEXT,
  conditions_owner TEXT,
  due_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Audit Logs Table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  affected_table TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Enable Read/Write for Anon & Authenticated Roles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow All Access" ON public.profiles;
CREATE POLICY "Allow All Access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON public.readiness_domains;
CREATE POLICY "Allow All Access" ON public.readiness_domains FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON public.readiness_criteria;
CREATE POLICY "Allow All Access" ON public.readiness_criteria FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON public.projects;
CREATE POLICY "Allow All Access" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON public.releases;
CREATE POLICY "Allow All Access" ON public.releases FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON public.assessments;
CREATE POLICY "Allow All Access" ON public.assessments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON public.assessment_responses;
CREATE POLICY "Allow All Access" ON public.assessment_responses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON public.approvals;
CREATE POLICY "Allow All Access" ON public.approvals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Access" ON public.audit_logs;
CREATE POLICY "Allow All Access" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.profiles (id, full_name, email, role_name, department) VALUES
  ('u1', 'Mamuzou Raphael (Admin)', 'm.akpo3855@miva.edu.ng', 'admin', 'IT Governance'),
  ('u2', 'Sarah Jenkins (PM)', 'sarah.j@company.com', 'project_manager', 'Software Delivery'),
  ('u3', 'David Okonjo (Lead Dev)', 'david.o@company.com', 'developer', 'Core Engineering'),
  ('u4', 'Anita Chen (QA Lead)', 'anita.c@company.com', 'qa', 'Quality Assurance'),
  ('u5', 'Marcus Vance (DevOps)', 'marcus.v@company.com', 'devops', 'Cloud Infra'),
  ('u6', 'Elena Rostova (Sec Lead)', 'elena.r@company.com', 'security', 'InfoSec'),
  ('u7', 'Tunde Bakare (Product Owner)', 'tunde.b@company.com', 'business', 'Digital Products'),
  ('u8', 'Dr. Charles Adams (Release Board)', 'charles.a@company.com', 'approver', 'Executive Board')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role_name = EXCLUDED.role_name,
  department = EXCLUDED.department;


INSERT INTO public.readiness_domains (id, domain_name, weight, description) VALUES
  ('d1', 'Business & Product Alignment', 10, 'Business value validation, user readiness, and stakeholder sign-off.'),
  ('d2', 'Code Quality & Testing', 15, 'Code coverage, regression pass rate, static code analysis, and open defects.'),
  ('d3', 'Security & Compliance', 15, 'Vulnerability scans, penetration testing, compliance checks, and access controls.'),
  ('d4', 'Infrastructure & Performance', 10, 'Capacity planning, load testing performance, and environment parity.'),
  ('d5', 'Deployment & Operations', 10, 'Deployment automation, rollback readiness, and release runbook validation.'),
  ('d6', 'Service Desk & Support', 10, 'Support team training, documentation, and escalation paths.'),
  ('d7', 'Data & Analytics', 5, 'Data migration validation, analytics tracking, and database safety.'),
  ('d8', 'Legal & Regulatory', 5, 'Legal approvals, privacy compliance (GDPR/NDPA), and licensing checks.'),
  ('d9', 'Monitoring & Observability', 10, 'Telemetry, alerting rules, log aggregation, and APM dashboards.'),
  ('d10', 'Change Management', 10, 'CAB approvals, maintenance window scheduling, and user communication.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.readiness_criteria (id, domain_id, criterion_text, weight, assigned_role, gate_rule_flag) VALUES
  ('c1', 'd1', 'User Acceptance Testing (UAT) completed with 100% sign-off from Product Lead.', 10, 'business', true),
  ('c2', 'd2', 'Unit & Integration test coverage equals or exceeds 80%.', 8, 'developer', false),
  ('c3', 'd2', 'Zero Sev-1 / Sev-2 unhandled defects open in the candidate release build.', 10, 'qa', true),
  ('c4', 'd2', 'Automated regression suite executed with pass rate >= 95%.', 7, 'qa', false),
  ('c5', 'd3', 'SAST & DAST vulnerability scans completed with zero Critical or High findings.', 10, 'security', true),
  ('c6', 'd3', 'Authentication and authorization policies verified against security standard.', 5, 'security', false),
  ('c7', 'd4', 'Performance load testing meets target SLA under 2x peak traffic.', 6, 'devops', false),
  ('c8', 'd4', 'Database schema migrations tested on production-like staging DB with 0 data loss.', 8, 'developer', true),
  ('c9', 'd5', 'Automated rollback script verified with data restoration dry-run.', 8, 'devops', true),
  ('c10', 'd5', 'Staging environment parity verified against production configuration.', 5, 'devops', false),
  ('c11', 'd6', 'Tier-1 & Tier-2 Support teams trained on new features and escalation runbooks.', 5, 'project_manager', false),
  ('c12', 'd6', 'End-user release notes and help center documentation published.', 3, 'business', false),
  ('c13', 'd8', 'NDPA & GDPR data privacy compliance checklist signed off by Legal counsel.', 5, 'admin', true),
  ('c14', 'd10', 'Change Advisory Board (CAB) approval received and change ticket logged.', 10, 'approver', true),
  ('c15', 'd7', 'Data pipeline migration & analytics tracking verification completed.', 8, 'developer', false),
  ('c16', 'd9', 'APM telemetry dashboard, error logging & alerting threshold rules configured.', 10, 'devops', true)
ON CONFLICT (id) DO UPDATE SET
  domain_id = EXCLUDED.domain_id,
  criterion_text = EXCLUDED.criterion_text,
  weight = EXCLUDED.weight,
  assigned_role = EXCLUDED.assigned_role,
  gate_rule_flag = EXCLUDED.gate_rule_flag;

INSERT INTO public.projects (id, project_name, department, description, owner_name) VALUES
  ('p1', 'Core Banking API Modernization', 'Fintech Engineering', 'Modernizing core transaction APIs to microservices architecture.', 'David Okonjo'),
  ('p2', 'Customer Self-Service Portal v3.0', 'Digital Channels', 'Next-gen web application portal for omnichannel self-service banking.', 'Sarah Jenkins')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.releases (id, project_id, release_name, target_date, status) VALUES
  ('r1', 'p1', 'Payment Gateway Integration v2.4.0', '2026-08-25', 'under_assessment'),
  ('r2', 'p2', 'Portal Self-Service v3.0.0-RC1', '2026-09-10', 'draft')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessments (id, release_id, created_by, status) VALUES
  ('ass-r1', 'r1', 'u1', 'under_assessment'),
  ('ass-r2', 'r2', 'u2', 'under_assessment')
ON CONFLICT (id) DO NOTHING;

-- Seed baseline assessment responses for candidate builds r1 and r2
INSERT INTO public.assessment_responses (assessment_id, criterion_id, likelihood, impact, calculated_risk_score, comment, evidence_url) VALUES
  ('ass-r1', 'c1', 1, 5, 5, 'UAT completed with 100% sign-off from Product Owner.', 'https://jira.company.com/uat-signoff-882'),
  ('ass-r1', 'c2', 2, 3, 6, 'Coverage at 84.5% on SonarQube.', 'https://sonar.company.com/build/4910'),
  ('ass-r1', 'c3', 1, 5, 5, 'Zero Sev-1 defects remaining in candidate release build.', 'https://jira.company.com/defects/sev1-zero'),
  ('ass-r1', 'c4', 2, 3, 6, 'Automated suite pass rate at 97.2%.', 'https://jenkins.company.com/job/regression/102'),
  ('ass-r1', 'c5', 1, 5, 5, 'Veracode SAST scan clear of high/critical vulnerabilities.', 'https://security.company.com/scans/771'),
  ('ass-r1', 'c6', 2, 4, 8, 'JWT access token policy enforced.', NULL),
  ('ass-r1', 'c7', 2, 3, 6, 'JMeter load test averaged 280ms latency under 5000 users.', NULL),
  ('ass-r1', 'c8', 2, 5, 10, 'Migration script executed on staging DB with 0 data drift.', NULL),
  ('ass-r1', 'c9', 4, 5, 20, 'Rollback script missing automated data restoration steps!', 'https://github.com/company/infra/issues/409'),
  ('ass-r1', 'c10', 2, 3, 6, 'Staging environment matches prod specs.', NULL),
  ('ass-r1', 'c11', 2, 3, 6, 'Tier 2 service desk agents briefed.', NULL),
  ('ass-r1', 'c12', 2, 2, 4, 'User guides distributed to internal staff.', NULL),
  ('ass-r1', 'c13', 2, 4, 8, 'NDPA 2023 data compliance checklist verified.', NULL),
  ('ass-r1', 'c14', 2, 2, 4, 'Release notes finalized in Confluence.', NULL),
  
  ('ass-r2', 'c1', 1, 4, 4, 'UAT 100% completed by Digital Product Lead.', 'https://jira.company.com/portal-uat'),
  ('ass-r2', 'c2', 1, 3, 3, 'Code coverage at 88.2%.', NULL),
  ('ass-r2', 'c3', 1, 4, 4, 'Zero open critical defects.', NULL),
  ('ass-r2', 'c4', 1, 2, 2, 'Regression suite pass rate 99.1%.', NULL),
  ('ass-r2', 'c5', 1, 4, 4, 'Security scan passed zero critical vulnerabilities.', NULL),
  ('ass-r2', 'c6', 1, 3, 3, 'OAuth2 authentication verified.', NULL),
  ('ass-r2', 'c7', 1, 2, 2, 'Average API latency 190ms.', NULL),
  ('ass-r2', 'c8', 1, 3, 3, 'Database migration tested.', NULL),
  ('ass-r2', 'c9', 1, 3, 3, 'Automated production rollback script verified!', 'https://github.com/company/infra/pull/112'),
  ('ass-r2', 'c10', 1, 2, 2, 'Staging environment parity verified.', NULL),
  ('ass-r2', 'c11', 1, 2, 2, 'Support team trained.', NULL),
  ('ass-r2', 'c12', 1, 2, 2, 'Customer release notes published.', NULL),
  ('ass-r2', 'c13', 1, 3, 3, 'NDPA compliance sign-off obtained.', NULL),
  ('ass-r2', 'c14', 1, 2, 2, 'Operations guide published.', NULL)
ON CONFLICT (assessment_id, criterion_id) DO NOTHING;

