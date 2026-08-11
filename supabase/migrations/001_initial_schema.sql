-- Supabase SQL Migration: 001_initial_schema.sql
-- GoLive DSS Initial Schema Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role_name TEXT NOT NULL CHECK (role_name IN ('admin', 'project_manager', 'developer', 'qa', 'devops', 'security', 'business', 'approver')),
    department TEXT DEFAULT 'Engineering',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name TEXT NOT NULL,
    department TEXT NOT NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Releases Table
CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    release_name TEXT NOT NULL,
    target_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'under_assessment' CHECK (status IN ('draft', 'under_assessment', 'pending_approval', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Readiness Domains Table
CREATE TABLE IF NOT EXISTS readiness_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_name TEXT NOT NULL UNIQUE,
    default_weight NUMERIC(5,2) NOT NULL CHECK (default_weight >= 0 AND default_weight <= 100),
    description TEXT,
    display_order INT DEFAULT 1
);

-- 5. Readiness Criteria Table
CREATE TABLE IF NOT EXISTS readiness_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID REFERENCES readiness_domains(id) ON DELETE CASCADE,
    criterion_text TEXT NOT NULL,
    assigned_role TEXT NOT NULL CHECK (assigned_role IN ('developer', 'qa', 'devops', 'security', 'business')),
    gate_rule_flag BOOLEAN DEFAULT FALSE,
    weight NUMERIC(5,2) DEFAULT 10.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    overall_score NUMERIC(5,2) DEFAULT 0.0,
    recommendation TEXT DEFAULT 'NO_GO' CHECK (recommendation IN ('GO', 'CONDITIONAL_GO', 'NO_GO')),
    has_gate_blocker BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'submitted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Assessment Responses Table
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    criterion_id UUID REFERENCES readiness_criteria(id) ON DELETE CASCADE,
    likelihood INT NOT NULL CHECK (likelihood >= 1 AND likelihood <= 5),
    impact INT NOT NULL CHECK (impact >= 1 AND impact <= 5),
    calculated_risk_score INT GENERATED ALWAYS AS (likelihood * impact) STORED,
    comment TEXT,
    evidence_url TEXT,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_assessment_criterion UNIQUE (assessment_id, criterion_id)
);

-- 8. Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    decision TEXT NOT NULL CHECK (decision IN ('GO', 'CONDITIONAL_GO', 'NO_GO')),
    conditions_text TEXT,
    conditions_owner TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    affected_table TEXT NOT NULL,
    affected_record_id UUID,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- SEED DATA: 10 READINESS DOMAINS
-- ========================================================
INSERT INTO readiness_domains (domain_name, default_weight, description, display_order) VALUES
('Functional Readiness', 15.00, 'Core user journeys passed, business rules validated, UAT sign-off obtained', 1),
('Defect Readiness', 15.00, 'Zero open critical defects, high defects have approved workarounds', 2),
('Security Readiness', 10.00, 'Access control reviewed, vulnerabilities assessed, sensitive data protected', 3),
('Performance Readiness', 8.00, 'Load, stress, and response time checks completed where applicable', 4),
('Data Readiness', 10.00, 'Migration completed, reconciliation performed, data quality exceptions reviewed', 5),
('Deployment Readiness', 12.00, 'Deployment plan, release notes, environment readiness, rollback plan confirmed', 6),
('Operational Readiness', 10.00, 'Monitoring, support ownership, incident process, hypercare plan confirmed', 7),
('User & Business Readiness', 10.00, 'Training, communication, process readiness, Product Owner sign-off confirmed', 8),
('Compliance Readiness', 5.00, 'Privacy (NDPA 2023), regulatory, or internal governance checks completed', 9),
('Documentation Readiness', 5.00, 'User guide, support guide, known issues documented', 10)
ON CONFLICT (domain_name) DO NOTHING;

-- ========================================================
-- SEED DATA: STANDARD READINESS CRITERIA & GATE RULES
-- ========================================================
INSERT INTO readiness_criteria (domain_id, criterion_text, assigned_role, gate_rule_flag, weight)
SELECT id, 'Core User Acceptance Testing (UAT) Sign-off Obtained', 'business', TRUE, 15.0 FROM readiness_domains WHERE domain_name = 'Functional Readiness'
UNION ALL
SELECT id, 'Zero Open Critical (Severity 1) Defects in Candidate Build', 'qa', TRUE, 15.0 FROM readiness_domains WHERE domain_name = 'Defect Readiness'
UNION ALL
SELECT id, 'Automated Regression Suite Pass Rate >= 95%', 'qa', FALSE, 10.0 FROM readiness_domains WHERE domain_name = 'Defect Readiness'
UNION ALL
SELECT id, 'Build Pass & Code Coverage >= 80% Certified by Developers', 'developer', FALSE, 10.0 FROM readiness_domains WHERE domain_name = 'Functional Readiness'
UNION ALL
SELECT id, 'Database Schema Migration Dry-Run & Reconciliation Passed', 'developer', TRUE, 12.0 FROM readiness_domains WHERE domain_name = 'Data Readiness'
UNION ALL
SELECT id, 'SAST/DAST Vulnerability Scans Passed (Zero Critical Vulnerabilities)', 'security', TRUE, 15.0 FROM readiness_domains WHERE domain_name = 'Security Readiness'
UNION ALL
SELECT id, 'Verified Production Rollback & Recovery Plan Configured', 'devops', TRUE, 15.0 FROM readiness_domains WHERE domain_name = 'Deployment Readiness'
UNION ALL
SELECT id, 'Production Environment Parity & Infrastructure Health Validated', 'devops', FALSE, 10.0 FROM readiness_domains WHERE domain_name = 'Deployment Readiness'
UNION ALL
SELECT id, 'Peak Load & Response Time Thresholds Validated (<500ms)', 'qa', FALSE, 10.0 FROM readiness_domains WHERE domain_name = 'Performance Readiness'
UNION ALL
SELECT id, 'Service Desk & Hypercare Operational Support Ownership Defined', 'business', FALSE, 10.0 FROM readiness_domains WHERE domain_name = 'Operational Readiness'
UNION ALL
SELECT id, 'Nigeria Data Protection Act (NDPA 2023) & Privacy Review Approved', 'security', FALSE, 10.0 FROM readiness_domains WHERE domain_name = 'Compliance Readiness';
