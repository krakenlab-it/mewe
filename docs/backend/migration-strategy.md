# Migration Strategy (localStorage -> Supabase)

## Current Implementation in App

The app now boots with a dual-mode storage adapter:

- Local adapter (legacy behavior)
- Supabase adapter (RPC-backed)

Selection logic:

- `MEWE_BACKEND_MODE=local` -> force local.
- `MEWE_BACKEND_MODE=auto` -> use Supabase when configured, otherwise fallback local.

## Compatibility Safeguards

- Legacy `dupla` JSON shape preserved end-to-end.
- Existing frontend function signatures unchanged (`guardarDupla`, `cargarDupla`, etc.).
- Session restore path (`mewe_session`) preserved.
- Admin login supports:
  - Supabase Auth (primary),
  - local password fallback for non-prod/local scenarios.

## Rollout Sequence

1. Apply migration to staging DB.
2. Configure frontend with Supabase URL + publishable key.
3. Validate create/resume/join/report/admin flows.
4. Seed question bank from frontend source (`seed-question-bank.mjs` or admin login auto-seed).
5. Release with `MEWE_BACKEND_MODE=auto`.
6. Observe logs; if stable, keep Supabase as default.
7. Optional hardening: remove local fallback and legacy password.

## Rollback

- Set `MEWE_BACKEND_MODE=local` and redeploy frontend.
- Keep Supabase data intact for forensic comparison and later retry.
