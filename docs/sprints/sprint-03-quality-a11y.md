# Sprint 03 — Quality & accessibility

**Dates:** 21–25 July 2026  
**Status:** In progress (cutover prep)  
**Goal:** Harden the platform with automated testing and accessible UI before production cutover.

---

## Sprint goals

| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | CI pipeline (lint, unit, build) | Done | PR [#2](https://github.com/krakenlab-it/mewe/pull/2) |
| 2 | Supabase local DB e2e tests | Done | PR [#2](https://github.com/krakenlab-it/mewe/pull/2) |
| 3 | WCAG-aligned UI improvements | Done | PR [#3](https://github.com/krakenlab-it/mewe/pull/3) |
| 4 | Manual parity validation in staging | Next | Use [parity checklist](../backend/parity-checklist.md) |
| 5 | Product owner sign-off | Next | After staging parity pass |
| 6 | Production cutover | Next | See [cutover runbook](../backend/cutover-runbook.md) |

---

## Delivered this sprint

### CI & testing (22 Jul)

- [x] GitHub Actions workflow with quality + e2e jobs
- [x] Pair lifecycle e2e (`tests/e2e/pair-lifecycle.e2e.test.js`)
- [x] Admin flows e2e (`tests/e2e/admin.e2e.test.js`)
- [x] Schema health e2e (`tests/e2e/schema-health.e2e.test.js`)
- [x] `service_role` table access migration for CI
- [x] README CI / local e2e documentation

### Accessibility (23 Jul)

- [x] Skip link and focus-visible styles
- [x] Accessible dialog system (replaces native alerts)
- [x] Progress bars with ARIA labels
- [x] Radar chart data table fallback
- [x] Reduced-motion CSS support
- [x] Automated axe tests (`src/a11y.test.jsx`)

---

## Automated vs manual coverage

| Flow | Automated (CI) | Manual (staging) |
|------|----------------|------------------|
| Mother create / resume | Partial (RPC + DB rows) | Full UX + PDF |
| Daughter join / profile | Partial (claim + progress) | Full UX + consent UI |
| Comparative report unlock | Partial (indices + report RPC) | Visual parity (radar/brecha) |
| Admin list / delete / audit | Yes | Login with real facilitator account |
| RLS / security | Schema health e2e | Penetration-style spot checks |
| Accessibility | axe on key pages | Screen reader walkthrough |

---

## Risks & blockers

| Item | Severity | Owner | Status |
|------|----------|-------|--------|
| Staging parity not yet run end-to-end | Medium | Product / QA | Open |
| Production Supabase env not validated with real facilitators | Medium | DevOps | Open |

---

## Links

- [Weekly summary 20–24 Jul](../progress/week-2026-07-21.md)
- [Parity checklist](../backend/parity-checklist.md)
- [Cutover runbook](../backend/cutover-runbook.md)
- [Migration strategy](../backend/migration-strategy.md)
