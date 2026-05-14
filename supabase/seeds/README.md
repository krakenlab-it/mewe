# Seeding Question Bank

This directory contains scripts to seed the question catalog used by backend scoring.

## Script

- `seed-question-bank.mjs`:
  - extracts `PREGUNTAS` from `me_we_plataforma.html`
  - sends them to `seed_question_bank` RPC for `mother_v1` and `daughter_v1`

## Usage

```bash
SUPABASE_URL="https://<project>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
node supabase/seeds/seed-question-bank.mjs
```

Run this after migrations are applied.
