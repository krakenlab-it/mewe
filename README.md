# MeWe

ME WE web app with Vite frontend and Supabase backend (DB-first architecture).

## Local development

```bash
npm install
npm run dev
```

For offline development without Supabase, create `.env.local`:

```env
VITE_MEWE_BACKEND_MODE=local
VITE_MEWE_LOCAL_ADMIN_PASS=your-dev-password
```

## Deploy to Vercel

1. Connect the repository to Vercel and set these environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_MEWE_BACKEND_MODE` | `supabase` |

Do **not** set `VITE_MEWE_LOCAL_ADMIN_PASS` in production.

2. Configure Supabase Auth (dashboard → Authentication → URL configuration):

   - Set **Site URL** to your Vercel domain (e.g. `https://mewe.vercel.app`)
   - Add the same URL to **Redirect URLs**
   - Enable **Anonymous sign-ins**

3. Create facilitator admin users:

   - Create an email/password user in Supabase Auth
   - Set `app_metadata.app_role` to `facilitator_admin` (User Management → user → Edit → App Metadata)

4. Apply database migrations:

   ```bash
   supabase db push
   ```

5. Seed the question bank (either login once as admin in the app, or run `node supabase/seeds/seed-question-bank.mjs` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`).

6. Deploy and run the parity checklist in [`docs/backend/parity-checklist.md`](docs/backend/parity-checklist.md).

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm test` — run Vitest
