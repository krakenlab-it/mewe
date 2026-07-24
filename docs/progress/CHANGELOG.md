# Changelog

All notable changes to the MeWe platform. For sprint-level tracking see [sprints](../sprints/README.md).

## [Unreleased]

### Planned

- Staging parity validation and production cutover
- Product owner sign-off on go-live criteria

---

## 2026-07-23 — Accessibility & usability

**PR:** [#3](https://github.com/krakenlab-it/mewe/pull/3)

- Skip navigation, visible focus states, screen reader announcements
- Accessible dialog system replacing native `alert` / `confirm` / `prompt`
- Progress indicators with ARIA labels on test and dashboard pages
- Radar chart data table fallback for screen readers
- `prefers-reduced-motion` support
- Automated axe accessibility tests in Vitest

---

## 2026-07-22 — CI quality gates & Supabase e2e

**PR:** [#2](https://github.com/krakenlab-it/mewe/pull/2)

- GitHub Actions: lint, unit tests, build, Supabase local DB e2e
- E2e tests for pair lifecycle, admin flows, schema health
- `scripts/export-supabase-env.sh` and npm e2e/supabase scripts
- Migration: grant `service_role` table access for CI verification
- README CI documentation

---

## 2026-06-24 — Production auth & exports

- Hardened production authentication
- PDF and CSV export parity with legacy behavior

---

## 2026-05-13 — React migration & core flows

- Migrated from legacy HTML to Vite + React
- Supabase RPC access fixes
- Role flows (mother, daughter, admin)
- UI polish and legal copy restoration
- Initial Vitest coverage

---

## 2026-05-13 — Initial release

- Vite app bootstrap
- Supabase backend integration
- Core database schema (db-first rewrite)
