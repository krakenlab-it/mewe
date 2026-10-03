# MeWe Observability

MeWe observability combines client-side event tracking, database audit tables, and deploy-time smoke checks.

## Client-side events

The frontend emits structured events from `src/lib/observability.js` for:

- Auth failures (`auth.failure`)
- RPC failures (`rpc.failure`)
- Pair-code claim failures (`pair_claim.failure`)
- Uncaught client errors (`client.error`)

Events are written to the browser console in all environments. In production you can optionally forward them to a webhook.

### Frontend environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_MEWE_OBSERVABILITY_ENABLED` | `true` | Master switch for client telemetry |
| `VITE_MEWE_OBSERVABILITY_WEBHOOK_URL` | _(empty)_ | Optional POST endpoint for event delivery |
| `VITE_MEWE_OBSERVABILITY_SAMPLE_RATE` | `1` | Fraction of events to emit (`0`–`1`) |

Pair codes are redacted in telemetry (`AB****`).

## Database signals

Use `docs/backend/observability-queries.sql` in the Supabase SQL editor for:

- Pair access failure trends (`pair_access_attempts`)
- Admin destructive actions (`admin_actions_audit`)
- Pair completion funnel

## Deploy validation

`scripts/post-deploy-smoke.mjs` runs at the end of the deploy workflow and verifies:

1. Deployed frontend returns HTML with the app root
2. Anonymous Supabase auth succeeds
3. Core RPC `is_facilitator_admin` is callable

## Incident response checklist

When investigating production issues:

1. Check Vercel deployment logs for the failing release
2. Run observability SQL queries for access/auth spikes
3. Review Supabase Auth logs for bootstrap/login failures
4. Confirm deploy smoke checks passed for the current release
