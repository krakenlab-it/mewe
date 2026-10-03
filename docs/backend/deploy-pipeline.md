# MeWe Deploy Pipeline

This repository deploys the Vite frontend to Vercel and applies Supabase database migrations through GitHub Actions.

## Triggers

- **Automatic:** after CI succeeds on `main` (`.github/workflows/deploy.yml` via `workflow_run`)
- **Manual:** GitHub Actions → Deploy → Run workflow → choose `staging` or `production`

## Pipeline stages

1. Link Supabase project and run `supabase db push`
2. Deploy Supabase edge functions (`claim-pair-access`, `admin-export-csv`)
3. Build and deploy the frontend to Vercel
4. Run post-deploy smoke checks (`scripts/post-deploy-smoke.mjs`)

## Required GitHub secrets

Configure these in the repository (and per-environment overrides when needed):

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel team/org id |
| `VERCEL_PROJECT_ID` | Vercel project id |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token |
| `SUPABASE_PROJECT_REF` | Supabase project ref |
| `SUPABASE_DB_PASSWORD` | Database password for `db push` |
| `VITE_SUPABASE_URL` | Frontend + smoke-test Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend + smoke-test anon key |

## GitHub environments

Create two environments in GitHub:

- `staging` — preview deployments and staging Supabase project
- `production` — production Vercel domain and production Supabase project

Use environment protection rules for production (required reviewers, wait timer) as needed.

## Local smoke validation

After a deploy, validate the target URL and backend:

```bash
DEPLOY_URL=https://your-deployment-url \
SUPABASE_URL=https://YOUR_PROJECT.supabase.co \
SUPABASE_ANON_KEY=YOUR_ANON_KEY \
node scripts/post-deploy-smoke.mjs
```

## Rollback

- **Frontend:** redeploy a previous Vercel deployment from the Vercel dashboard
- **Database:** create and apply a reverse migration with `supabase migration new` + `supabase db push`
- **App behavior:** set `VITE_MEWE_BACKEND_MODE=local` only for emergency local-mode rollback (not recommended for production traffic)

## Related docs

- [Cutover runbook](./cutover-runbook.md)
- [Parity checklist](./parity-checklist.md)
- [Observability queries](./observability-queries.sql)
