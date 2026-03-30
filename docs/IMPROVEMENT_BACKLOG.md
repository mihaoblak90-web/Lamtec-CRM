# Lamtec CRM Improvement Backlog (Practical, Execution-Ready)

This is a concrete "make it better" plan focused on what matters most for a modern CRM and what can realistically be delivered in stages.

## North-star outcomes
- Sales reps save time (less manual entry, better prioritization).
- Managers trust forecasts (clean pipeline hygiene and stage governance).
- Leadership sees reliable metrics (adoption, conversion, cycle-time).
- IT can run it safely (SSO, RBAC, audit logs, backups, monitoring).

---

## 0) Immediate repo health fixes (this week)

1. **Keep typecheck green at all times**
   - Fix broken imports/types immediately.
   - Add CI check that blocks merges on `npm run lint`.

2. **Eliminate accidental frontend secret exposure**
   - Any AI/provider keys must stay server-side.
   - Frontend calls backend APIs only.

3. **Add contribution guardrails**
   - PR template: scope, test evidence, rollout notes.
   - Branch protection + required checks.

---

## 1) Product changes that provide biggest ROI first

## A. Sales execution quality
1. **Stage governance**
   - Each deal stage requires mandatory fields (economic buyer, next step, close date confidence).
   - "Cannot move stage" until required data is complete.

2. **Next-step discipline**
   - Every active deal must have:
     - a next action,
     - an owner,
     - a due date.
   - Overdue actions auto-highlight in dashboard.

3. **Forecast confidence scoring**
   - Confidence score based on recency, stakeholder coverage, and activity quality.
   - Managers see risk flags before commit calls.

## B. Relationship intelligence
1. **Account 360 timeline**
   - Unified timeline for calls, meetings, notes, quote versions, and action updates.

2. **Stakeholder coverage map**
   - Visual view of roles covered vs missing (buyer, technical approver, finance).

3. **Documented decision history**
   - Decisions and blockers tied to opportunity timeline.

## C. AI copilots (high leverage)
1. **Meeting-to-action autopilot**
   - Transcript/minutes → decisions, risks, tasks with owners and due dates.

2. **Deal risk copilot**
   - Explain why a deal is risky (no exec sponsor, stale activity, low multi-threading).

3. **Executive brief generation**
   - Weekly account summary generated automatically.

---

## 2) Technical upgrades to support those outcomes

1. **Move data from mock frontend state to backend APIs + Postgres**
   - Start with Contacts, Companies, Deals, Meeting Minutes.

2. **Authentication + authorization**
   - SSO + role model:
     - Sales Rep
     - Sales Manager
     - Key Account Manager
     - Admin

3. **Workflow automation service**
   - Trigger-based rules:
     - overdue task reminders,
     - stage-change checks,
     - stale deal alerts.

4. **Operational excellence baseline**
   - Sentry errors, request tracing, uptime checks, backup verification.

---

## 3) Go-live path (company-ready)

## Phase 1: Pilot foundation (2–3 weeks)
- Deploy frontend + API + Postgres in production-like environment.
- Enable SSO and RBAC.
- Import core customer/deal data.
- Run pilot with 10–20 users.

## Phase 2: Process hardening (3–4 weeks)
- Enforce stage rules and task SLAs.
- Add dashboard KPIs for manager coaching.
- Iterate on UX pain points from pilot feedback.

## Phase 3: AI and scale (3–4 weeks)
- Launch meeting/action copilot and deal health scoring.
- Add conversational search with strict data permissions.
- Expand to full org.

---

## 4) KPIs to prove improvement
- Forecast accuracy trend.
- Win rate by segment.
- Average cycle time.
- % opportunities with valid next step.
- % deals with full stakeholder coverage.
- Weekly active users and action completion rate.

---

## 5) Suggested "do this next" list
1. Fix all current type errors and enforce CI quality gates.
2. Implement backend API + Postgres for 4 core entities.
3. Add SSO + RBAC before broad rollout.
4. Run a pilot cohort and capture daily feedback.
5. Build meeting-to-action AI copilot after data model is stable.
