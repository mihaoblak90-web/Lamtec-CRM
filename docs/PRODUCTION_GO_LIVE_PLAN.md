# Production Go-Live Plan

This plan describes how to launch Lamtec CRM for real company usage with low risk.

## 1) Recommended target architecture

- **Frontend**: React/Vite static assets hosted on Vercel, Netlify, or Cloudflare Pages.
- **API backend**: Node/TypeScript service hosted on Fly.io, Render, Railway, or AWS ECS/Fargate.
- **Database**: Managed PostgreSQL (Neon, Supabase, RDS, or Cloud SQL).
- **Cache/queue**: Redis (Upstash/Elasticache) for background jobs and rate-limits.
- **Storage**: S3-compatible bucket for attachments (meeting files, exports).
- **Auth**: SSO provider (Entra ID/Google/Okta) with role mapping.
- **Observability**: Sentry + OpenTelemetry + centralized logs.

---

## 2) Minimum production checklist

### Security
- [ ] No API/LLM keys in frontend bundles.
- [ ] HTTPS everywhere.
- [ ] Secure secrets management (platform secrets manager).
- [ ] RBAC enforced on every API endpoint.
- [ ] Audit log enabled for create/update/delete.

### Reliability
- [ ] Automated DB backups and restore drill tested.
- [ ] Health checks and readiness endpoints.
- [ ] Error monitoring and on-call alert routing.
- [ ] Basic load test completed.

### Data and operations
- [ ] Migration scripts in CI/CD.
- [ ] Seed/demo scripts separated from prod data paths.
- [ ] Data retention + export/deletion process documented.

### Release readiness
- [ ] Smoke test suite for core flows (login, create contact, create deal, update action).
- [ ] UAT sign-off from sales leadership.
- [ ] Internal user training completed.

---

## 3) Suggested rollout strategy

1. **Pilot (10–20 users, 2 weeks)**
   - Sales managers + key account representatives.
   - Daily feedback loop and hotfix window.

2. **Wave 1 (department-wide)**
   - Enable all sales users.
   - Weekly release cadence.

3. **Wave 2 (cross-functional)**
   - Add engineering, operations, finance viewers/contributors.

4. **General availability**
   - SLA targets + support model + ongoing roadmap.

---

## 4) CI/CD setup (practical)

- **On PR**: type-check, lint, unit tests, API contract checks.
- **On merge to main**:
  - Build frontend + backend.
  - Run DB migrations.
  - Deploy backend.
  - Deploy frontend.
  - Run post-deploy smoke tests.
- **Branch protections**: required checks + code review.

---

## 5) Cost-effective hosting path for immediate launch

If you need to go live quickly with minimal operations burden:

- Frontend: **Vercel**
- Backend API: **Render**
- Postgres: **Neon**
- Redis: **Upstash**
- Storage: **Cloudflare R2**
- Auth: **Clerk/Auth0** (or SSO directly if already standardized internally)

This stack is fast to launch and can later migrate to a consolidated cloud platform.

---

## 6) First-week go-live runbook

- Day 1: Deploy pilot environment; validate SSO and permissions.
- Day 2: Import initial contacts/companies/deals from existing sources.
- Day 3: Enable email/calendar sync for pilot users.
- Day 4: Run sales workflow rehearsal (lead → opportunity → quote).
- Day 5: Review incidents, adoption metrics, and backlog.

---

## 7) Immediate next actions for Lamtec

1. Build API + database foundation and migrate away from client-side mock data.
2. Implement authentication and role-based access.
3. Define a pilot group and success metrics.
4. Stand up production-grade hosting and monitoring.
5. Schedule phased rollout and training.
2. Implement authentication and role-based access.
3. Define a pilot group and success metrics.
4. Stand up production-grade hosting and monitoring.
5. Schedule phased rollout and training.
