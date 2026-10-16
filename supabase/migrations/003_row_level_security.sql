-- Supabase SQL Migration: 003_row_level_security.sql
-- Thesis Section 4.19 / Snippet 4.6 Synchronization
-- Enforces Row-Level Security on assessment_responses and related tables

-- 1. Enable RLS on assessment_responses
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if exists to allow clean idempotency
DROP POLICY IF EXISTS "Evaluators can read permitted responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "Evaluators can update permitted responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "Evaluators can insert permitted responses" ON public.assessment_responses;

-- 3. Thesis Snippet 4.6: Row-Level Security SELECT policy
CREATE POLICY "Evaluators can read permitted responses" ON public.assessment_responses 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.assessments a 
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE a.id = assessment_responses.assessment_id 
      AND (
        p.role_name = 'admin'
        OR p.role_name = 'approver'
        OR p.id = assessment_responses.updated_by
      )
  )
);

-- 4. Enable RLS and insert/update policies for evaluators
CREATE POLICY "Evaluators can update permitted responses" ON public.assessment_responses 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.assessments a 
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE a.id = assessment_responses.assessment_id 
      AND (
        p.role_name = 'admin'
        OR p.role_name = 'project_manager'
        OR p.id = assessment_responses.updated_by
      )
  )
);

CREATE POLICY "Evaluators can insert permitted responses" ON public.assessment_responses 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.assessments a 
    JOIN public.profiles p ON p.id = auth.uid() 
    WHERE a.id = assessment_responses.assessment_id 
      AND (
        p.role_name = 'admin'
        OR p.role_name = 'project_manager'
        OR p.id = assessment_responses.updated_by
      )
  )
);
