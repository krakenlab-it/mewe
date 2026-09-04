# Sprint tracking

This folder tracks MeWe development sprints. Each sprint doc lists goals, status, and links to shipped work.

## Current sprint

| Sprint | Dates | Theme | Status |
|--------|-------|-------|--------|
| [Sprint 03 — Quality & accessibility](./sprint-03-quality-a11y.md) | 21–25 Jul 2026 | CI, e2e coverage, WCAG-aligned UI | **In progress** (cutover prep) |

## Past sprints

| Sprint | Dates | Theme | Outcome |
|--------|-------|-------|---------|
| [Sprint 02 — Backend parity](./sprint-02-backend-parity.md) | May–Jun 2026 | Supabase migration, RPC flows, exports | Complete |
| [Sprint 01 — Foundation](./sprint-01-foundation.md) | May 2026 | Vite + React + Supabase bootstrap | Complete |

## How we track progress

- **Shipped work** — merged PRs linked in each sprint doc
- **Automated checks** — GitHub Actions CI on every push/PR ([workflow](../../.github/workflows/ci.yml))
- **Manual validation** — [parity checklist](../backend/parity-checklist.md) before production cutover
- **Weekly summaries** — [progress folder](../progress/) for stakeholder-friendly recaps

## Status legend

| Label | Meaning |
|-------|---------|
| Done | Merged and verified |
| In progress | Active work this sprint |
| Blocked | Waiting on dependency or decision |
| Next | Planned but not started |
