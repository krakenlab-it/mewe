# Migration, Rollout, and Cutover Runbook

## 1) Environment Setup

- Configure frontend globals (served safely, not hardcoded secrets):
  - `MEWE_SUPABASE_URL`
  - `MEWE_SUPABASE_PUBLISHABLE_KEY`
  - optional: `MEWE_BACKEND_MODE` (`auto` or `local`)
- Create facilitator accounts in Supabase Auth and set `app_metadata.app_role=facilitator_admin`.

## 2) Database Deployment

- Apply migration:
  - `supabase db push` (local) or deployment pipeline equivalent.
- Verify objects:
  - tables, functions, and policies exist.
- Verify RLS is enabled for all domain tables.

## 3) Question Bank Seeding

- Login as admin in the app once.
- The app automatically calls `seed_question_bank` for:
  - `mother_v1`
  - `daughter_v1`
- Confirm `questions` row count > 0 in SQL editor.

## 4) Compatibility Rollout

Phased strategy aligned with DB-first migration:

1. `auto` mode in staging:
   - Supabase path primary.
   - Local fallback if initialization fails.
2. Validate parity with real flows.
3. Force Supabase in production by providing env and monitoring initialization.
4. Optional hardening step:
   - remove local fallback in production deployment.

## 5) Parity Test Matrix

Automated coverage (Sprint 03): GitHub Actions runs `tests/e2e/` on every merge — pair lifecycle, admin flows, schema health. See [Sprint 03 automated vs manual matrix](../sprints/sprint-03-quality-a11y.md#automated-vs-manual-coverage).

Run the full manual matrix in staging before go-live:

- Mother:
  - create pair, pause/continue, complete test, view report.
- Daughter:
  - join by code, profile completion, complete test, view report.
- Comparative:
  - unlock only when both complete.
- Admin:
  - login with Auth role claim, list pairs, open details, export CSV, delete pair.
- Recovery:
  - page reload/session restore for mother, daughter, admin.

## 6) Observability and Incident Signals

Track and alert on:

- Auth failures (`loginAdmin`, anonymous auth bootstrap failures).
- Pair claim failures (`pair_access_attempts` spikes).
- RPC errors (`upsert_pair_snapshot`, `get_pair_snapshot`).
- Admin destructive actions (`admin_actions_audit`).

## 7) Rollback Plan

- Immediate app rollback: set `MEWE_BACKEND_MODE=local`.
- Database rollback:
  - create reverse migration if needed,
  - preserve `admin_actions_audit` and raw exports before destructive rollback.

## 8) Go/No-Go Criteria

Go live only when:

- No open P0/P1 auth or data-integrity issues.
- Parity matrix passes in staging.
- Admin operations tested with real facilitator account.
- Audit and access-attempt logs are visible and queryable.
