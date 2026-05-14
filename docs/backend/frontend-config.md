# Frontend Configuration for Supabase Mode

Before loading `me_we_plataforma.html` in production, inject these globals:

```html
<script>
  window.MEWE_BACKEND_MODE = "auto";
  window.MEWE_SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
  window.MEWE_SUPABASE_PUBLISHABLE_KEY = "YOUR_PUBLISHABLE_KEY";
  window.MEWE_LOCAL_ADMIN_PASS = "override-local-only";
</script>
```

Notes:

- `MEWE_BACKEND_MODE=local` disables Supabase and forces localStorage.
- `MEWE_BACKEND_MODE=auto` tries Supabase first, then falls back to local storage if unavailable.
- Never expose service-role keys in frontend code.
