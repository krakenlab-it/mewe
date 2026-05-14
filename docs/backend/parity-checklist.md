# Pre-Cutover Parity Checklist

Use this checklist before enabling production traffic on Supabase mode.

## Mother Flow

- [ ] Create new pair and receive 6-char code.
- [ ] Resume existing pair with code.
- [ ] Progress is saved per answer refresh/reload.
- [ ] Completion produces individual report.
- [ ] PDF download still works.

## Daughter Flow

- [ ] Join by valid pair code.
- [ ] Invalid code errors are user-readable.
- [ ] Profile + consent persistence verified.
- [ ] Completion produces individual report.

## Comparative Flow

- [ ] Mother sees lock state until both complete.
- [ ] Comparative report unlocks immediately after second completion.
- [ ] Brecha and radar values match legacy calculations.

## Admin Flow

- [ ] Login works only for `facilitator_admin`.
- [ ] Dashboard list renders all pairs.
- [ ] Detail view shows both roles and indices.
- [ ] CSV export generates expected columns.
- [ ] Delete pair removes participant data and logs audit row.

## Security / Data Integrity

- [ ] RLS enabled on all app tables.
- [ ] Anonymous user cannot list all pairs.
- [ ] Random authenticated user cannot read foreign pair snapshot.
- [ ] `admin_actions_audit` records delete operations.
- [ ] `pair_access_attempts` records failed joins.

## Operational Signals

- [ ] RPC errors visible in client logs and monitor dashboard.
- [ ] Auth errors visible in Supabase Auth logs.
- [ ] Table growth monitored (`responses`, `computed_indices`, `admin_actions_audit`).

## Release Decision

- [ ] No open P0/P1 issues.
- [ ] Product owner sign-off on parity.
- [ ] Rollback switch (`MEWE_BACKEND_MODE=local`) verified.
