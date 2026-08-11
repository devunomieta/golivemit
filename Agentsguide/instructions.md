# Project Guidelines & Agent Instructions

> [!IMPORTANT]
> **MANDATORY AGENT DIRECTIVE**: Any AI agent, session, or developer working on this project MUST read and adhere to all instructions in this file (`Agentsguide/instructions.md`) before initiating any new or existing task.

---

## 1. Governance & Instruction Modification Policy
- **User Approval Required for Edits**: This instruction file (`Agentsguide/instructions.md`) CANNOT be modified or edited by any AI agent unless explicit, direct approval is granted by the USER in the chat.
- **Controlled Additions**: Whenever the USER requests a new instruction or rule to be added, it must be drafted and presented for explicit confirmation before altering this file.

---

## 2. Git & Security Practices (`.gitignore`)
- **Ignore Sensitive Files**: All sensitive files—including environment credentials (`.env*`), API secret keys, database credentials, temporary scratch files, test scripts, local diagnostic logs, and debug dumps—MUST be explicitly added to `.gitignore`.
- **Zero Credential Exposure**: Never commit API keys, service role secrets, or database URLs to version control.

---

## 3. Icon & Visual Guidelines
- **Strict Prohibition on Emojis**: Do NOT use raw Unicode emojis anywhere in UI components, notifications, buttons, headers, or reports.
- **Lucide Icons**: Use SVG icons exclusively via the `lucide-react` library (e.g., `<AlertTriangle />`, `<CheckCircle2 />`, `<XCircle />`, `<ShieldAlert />`, `<TrendingUp />`).

---

## 4. Supabase SQL Migration Rules
- **Incremental SQL Files**: Never edit or overwrite an existing migration file in `supabase/migrations/`.
- **Naming Convention**: Create timestamped or numbered sequential migration files for every schema modification (e.g., `001_initial_schema.sql`, `002_add_developer_role.sql`, `003_gate_rule_rls.sql`).
- **Idempotent Statements**: Always write migration scripts using `IF NOT EXISTS` or `CREATE OR REPLACE` to prevent runtime failure during fresh environments.

---

## 5. Code Optimization & Quality Standards
- **Clean Architecture**: Modular TypeScript with clear separation between UI components, custom hooks, Supabase server actions, and domain utility functions.
- **Type Safety**: Avoid using `any`. Write explicit TypeScript interfaces/types for all database tables, API inputs/outputs, and component props.
- **Performance**: Use React `useCallback`, `useMemo`, and Server Components appropriately to minimize re-renders and payload sizes.

---

## 6. Build & Validation Rules
- **Mandatory Lint & Typecheck**: Every build execution must run `npm run type-check` and `npm run lint` before executing `next build`.
- **Package Script Requirement**: Ensure `package.json` includes:
  ```json
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "npm run type-check && npm run lint && next build"
  }
  ```

---

## 7. Core System Governance Rules

1. **Strict Gate Blocker Priority**:
   - The decision engine must enforce hard blocker overrides. If `has_gate_blocker === true`, the recommendation MUST evaluate to `NO_GO` regardless of numerical score percentage.

2. **Audit Logging Enforcement**:
   - Any database mutation affecting `assessments`, `assessment_responses`, `readiness_criteria`, or `approvals` MUST trigger an entry in `audit_logs`.

3. **Supabase RLS Integrity**:
   - Ensure Row Level Security (RLS) policies validate that contributors can only modify criteria assigned to their role or assigned release.

4. **Self-Contained Verification**:
   - After completing any major component or API route, run `npm run build` locally to verify zero build errors, zero TypeScript errors, and zero lint warnings.
