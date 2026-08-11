# GoLive DSS: Risk-Based Release Readiness Decision Support System

> **Enterprise Software Release Readiness Governance Platform**  
> *Developed for MIVA Open University MIT Degree Capstone Project*

---

## 📌 Executive Summary

**GoLive DSS** is an enterprise-grade Decision Support System (DSS) designed to eliminate high-risk, subjective software release approvals. By replacing informal sign-offs with an automated, multi-domain risk evaluation model and hard **Gate Rule Blocker Overrides**, GoLive DSS empowers engineering leads, QA teams, DevOps engineers, and executive release boards to make data-driven, objective **GO**, **CONDITIONAL GO**, or **NO-GO** release decisions.

---

## 🚨 Problem Statement

In enterprise software engineering, premature or unvetted production deployments cost organizations millions in downtime, security breaches, data corruption, and SLA penalties. Traditional release governance suffers from critical systemic flaws:

1. **Subjective Sign-offs**: Release approvals frequently rely on informal verbal agreements or unstructured emails without quantitative risk scoring.
2. **Siloed Domain Assessments**: Security, QA, DevOps, and business compliance operate in isolation, missing compound cross-domain risks.
3. **Overlooked Critical Blockers**: High-severity technical defects (e.g., missing automated rollback scripts or unpatched zero-day vulnerabilities) are often drowned out by high average scores in minor criteria.
4. **Lack of Auditability**: Post-incident root cause investigations fail due to absent or incomplete governance audit trails detailing who authorized the deployment and under what conditions.

---

## 🚀 The Impact of the Solution

GoLive DSS solves these challenges by establishing a standardized, automated release gate engine:

* **Eliminates High-Risk Production Failures**: Automated **Gate Rule Blocker Overrides** immediately force a mandatory `NO_GO` recommendation if any critical gate criterion (such as a missing rollback script or unverified database migration) fails—regardless of how high other scores are.
* **Reduces Release Gate Latency**: Consolidates 10 readiness domains into a single command-center radar dashboard, cutting release review meetings from hours to minutes.
* **Enforces Multi-Persona Governance**: Enforces role-based assessment workflows across 8 specialized personas (**Admin**, **Project Manager**, **Developer**, **QA**, **DevOps**, **Security**, **Product Owner**, **Approver Board**).
* **Guarantees Complete Auditability**: Automatically records all risk evaluations, evidence attachments, and governance board votes into an immutable Supabase audit log for post-release compliance.

---

## 🛠️ Key Features

* **10-Domain Readiness Engine**:
  1. *Functional Readiness* (UAT & Pass Rates)
  2. *Defect Readiness* (Sev-1 / Sev-2 Defect Counts)
  3. *Security Readiness* (SAST/DAST & RBAC Scans)
  4. *Performance Readiness* (Latency & Stress Thresholds)
  5. *Data Readiness* (Migration Dry-Runs & Reconciliation)
  6. *Deployment Readiness* (Rollback & Environment Parity)
  7. *Operational Readiness* (Monitoring & Support Hypercare)
  8. *User & Business Readiness* (Training & PO Approval)
  9. *Compliance Readiness* (NDPA 2023 Privacy Audit)
  10. *Documentation Readiness* (Operations & Runbooks)
* **Automated Risk Normalization & Gate Overrides**:
  * Normalized score calculation based on $L \times I$ (Likelihood $\times$ Impact).
  * Automated recommendation thresholds:
    * **GO**: Score $\ge 80\%$ and zero active gate blockers.
    * **CONDITIONAL GO**: Score between $60\%$ and $79\%$ with required mitigation tracking.
    * **NO-GO**: Score $< 60\%$ OR $\ge 1$ active Gate Rule Blocker.
* **Command-Center Executive Dashboard**:
  * Interactive 10-domain Radar Heatmap powered by Recharts.
  * Real-time Readiness Gauge and active blocker alert banners.
* **Executive Audit Report Export**:
  * Printable/exportable formal release sign-off documentation for board records.
* **Desktop Viewport Enforcement**:
  * Screen-guard layer restricting command-center access to desktop resolutions ($1024\text{px}+$ viewports) for optimal data density.

---

## 🏗️ Technology Stack

* **Frontend**: Next.js 14+ (App Router), React 19, TypeScript.
* **Styling & Theme**: Vanilla CSS Tokens, Tailwind CSS, Custom Glassmorphism, Deep Midnight Slate Palette (`#070A12`).
* **Data Visualization**: Recharts (Radar Heatmaps & Radial Gauges).
* **Icons**: Lucide React (`lucide-react`).
* **Database & Persistence**: Supabase (PostgreSQL), `@supabase/supabase-js`.

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- npm or pnpm package manager

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/golivemit.git
cd golivemit
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run SQL Migrations in Supabase
Execute the sequential migration scripts located in `supabase/migrations/` in your Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql` (Creates base tables, RLS policies, indexes)
2. `supabase/migrations/002_auth_and_dummy_seed.sql` (Seeds profiles, test personas, initial audit logs)

### 5. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` on your desktop browser.

### 6. Build & Type Check Validation
To validate code quality and type safety:
```bash
npm run build
```

---

## 📜 License & Governance

Developed as an academic research and enterprise software governance solution for **MIVA Open University**. All rights reserved.
