-- Migration 002: Seed Auth Profiles and Audit Logs
-- Enables Supabase Auth integration, seed profiles, and initial audit logs.

-- 1. Insert seed profiles with standard test credentials metadata
INSERT INTO profiles (id, email, full_name, role_name, department) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@golive.io', 'Mamuzou Raphael (Admin)', 'admin', 'IT Governance'),
('22222222-2222-2222-2222-222222222222', 'pm@golive.io', 'Sarah Jenkins (PM)', 'project_manager', 'Software Delivery'),
('33333333-3333-3333-3333-333333333333', 'dev@golive.io', 'David Okonjo (Lead Dev)', 'developer', 'Core Engineering'),
('44444444-4444-4444-4444-444444444444', 'qa@golive.io', 'Anita Chen (QA Lead)', 'qa', 'Quality Assurance'),
('55555555-5555-5555-5555-555555555555', 'devops@golive.io', 'Marcus Vance (DevOps)', 'devops', 'Cloud Infra'),
('66666666-6666-6666-6666-666666666666', 'security@golive.io', 'Elena Rostova (Sec Lead)', 'security', 'InfoSec'),
('77777777-7777-7777-7777-777777777777', 'business@golive.io', 'Tunde Bakare (Product Owner)', 'business', 'Digital Products'),
('88888888-8888-8888-8888-888888888888', 'approver@golive.io', 'Dr. Charles Adams (Release Board)', 'approver', 'Executive Board')
ON CONFLICT (email) DO NOTHING;

-- 2. Seed Initial Projects & Releases
INSERT INTO projects (id, project_name, department, description) VALUES
('99999999-9999-9999-9999-999999999991', 'Core Banking API Modernization', 'Fintech Engineering', 'Migrating legacy core banking modules to microservices architecture.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO releases (id, project_id, release_name, target_date, status) VALUES
('99999999-9999-9999-9999-999999999992', '99999999-9999-9999-9999-999999999991', 'Payment Gateway Integration v2.4.0', '2026-08-25', 'under_assessment')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Initial Dummy Audit Logs for System Testing
INSERT INTO audit_logs (user_id, action, affected_table, details) VALUES
('11111111-1111-1111-1111-111111111111', 'SYSTEM_INIT', 'readiness_domains', '{"message": "Initialized 10 readiness domains and default weights"}'),
('22222222-2222-2222-2222-222222222222', 'CREATE_RELEASE', 'releases', '{"release_name": "Payment Gateway Integration v2.4.0", "target_date": "2026-08-25"}'),
('33333333-3333-3333-3333-333333333333', 'UPDATE_CRITERION', 'assessment_responses', '{"criterion": "Database Schema Migration", "status": "Passed dry-run"}'),
('55555555-5555-5555-5555-555555555555', 'FLAG_GATE_BLOCKER', 'assessment_responses', '{"criterion": "Production Rollback Plan", "issue": "Missing automated rollback script"}'),
('88888888-8888-8888-8888-888888888888', 'CAST_VOTE', 'approvals', '{"decision": "NO_GO", "reason": "Gate rule override active"}');
