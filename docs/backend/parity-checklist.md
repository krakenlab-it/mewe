# Pre-Cutover Parity Checklist

Use this checklist before enabling production traffic on Supabase mode.

> **Automation note (Sprint 03):** CI now covers many backend flows via `tests/e2e/`. Items marked *(CI)* have automated coverage; still run the full manual pass in staging before go-live. See [Sprint 03](../sprints/sprint-03-quality-a11y.md) for the automated vs manual matrix.

## Mother Flow

- [ ] Create new pair and receive 6-char code. *(CI: pair create + DB rows)*
- [ ] Resume existing pair with code. *(CI: snapshot upsert + claim)*
- [ ] Progress is saved per answer refresh/reload. *(CI: question_progress + responses)*
- [ ] Completion produces individual report. *(CI: indices + completion flags)*
- [ ] PDF download still works.

## Daughter Flow

- [ ] Join by valid pair code. *(CI: claim_pair_access)*
- [ ] Invalid code errors are user-readable. *(CI: failed claim + pair_access_attempts)*
- [ ] Profile + consent persistence verified.
- [ ] Completion produces individual report.

## Comparative Flow

- [ ] Mother sees lock state until both complete.
- [ ] Comparative report unlocks immediately after second completion. *(CI: comparative report RPC)*
- [ ] Brecha and radar values match legacy calculations.

## Admin Flow

- [ ] Login works only for `facilitator_admin`. *(CI: is_facilitator_admin)*
- [ ] Dashboard list renders all pairs. *(CI: list_pair_snapshots)*
- [ ] Detail view shows both roles and indices.
- [ ] CSV export generates expected columns.
- [ ] Delete pair removes participant data and logs audit row. *(CI: admin delete + audit)*

## Security / Data Integrity

- [ ] RLS enabled on all app tables. *(CI: schema-health e2e)*
- [ ] Anonymous user cannot list all pairs.
- [ ] Random authenticated user cannot read foreign pair snapshot.
- [ ] `admin_actions_audit` records delete operations. *(CI: admin e2e)*
- [ ] `pair_access_attempts` records failed joins. *(CI: pair-lifecycle e2e)*

## Operational Signals

- [ ] RPC errors visible in client logs and monitor dashboard.
- [ ] Auth errors visible in Supabase Auth logs.
- [ ] Table growth monitored (`responses`, `computed_indices`, `admin_actions_audit`).

## Release Decision

- [ ] No open P0/P1 issues.
- [ ] Product owner sign-off on parity.
- [ ] Rollback switch (`MEWE_BACKEND_MODE=local`) verified.
