# Auth and RLS Model

## Identity Types

- Participant users (mother/daughter):
  - Authenticated via Supabase anonymous sign-in.
  - Bound to a pair role through `claim_pair_access`.
- Facilitator admin:
  - Supabase Auth credentialed account (email/password).
  - Must include `app_metadata.app_role = facilitator_admin`.

## Why This Model

- Preserves current UX (pair-code based onboarding) while moving access checks server-side.
- Avoids static frontend admin passwords.
- Keeps authorization out of `user_metadata` (user-editable).

## Policy Strategy

- RLS enabled for all application tables.
- Public table access is intentionally minimal.
- Multi-table writes/reads happen through RPC wrappers:
  - wrappers live in `public`,
  - privileged logic is in `private` schema `security definer` functions.

## Access Rules

- Pair members can read only their pair-scoped records.
- Admin can read all pairs and execute destructive operations.
- Admin-only actions are audited in `admin_actions_audit`.
- Access attempts are logged in `pair_access_attempts`.

## Critical Security Notes

- Admin authorization derives from `auth.jwt() -> app_metadata -> app_role`.
- `service_role` is permitted for controlled server-side scripts only.
- Service role keys must never be exposed in browser code.
