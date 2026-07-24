# AGENTS.md

## Cursor Cloud specific instructions

ME WE is a single-service app: a Vite + React frontend (`src/`) backed by Supabase
(DB-first; RPCs in `supabase/`). Standard commands live in `package.json` and `README.md`.

### Running locally without Supabase credentials
The dev server defaults to `auto` backend mode (tries Supabase, falls back to
localStorage). To force the offline path and avoid any Supabase calls, run in `local`
mode by setting `VITE_MEWE_BACKEND_MODE=local`. Either create a gitignored `.env.local`
(see `.env.example` for keys) or pass it inline:

```bash
VITE_MEWE_BACKEND_MODE=local npm run dev
```

`.env.local` is gitignored, so it will not exist after a fresh clone — recreate it if needed.

- `npm run dev` serves on port **5174** with `--strictPort` (fails if the port is taken; it does not auto-pick another).
- In `local` mode the facilitator-admin login password comes from `VITE_MEWE_LOCAL_ADMIN_PASS` (defaults to `mewe2026` if unset).
- `requiresSupabaseBackend()` returns true whenever the build is `PROD`, so `npm run build` / `npm run preview` of a production bundle expect real `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` at runtime. The plain `npm run build` step itself does not need them.

### Tests
`npm test` (Vitest). Note: 3 tests in `src/lib/csvExport.test.js` and
`src/lib/pdfExport.test.js` currently fail on the pinned Vitest 4.x (the pdf mock is
used as a constructor, and a CSV column-adjacency assertion). These are pre-existing and
unrelated to environment setup.
