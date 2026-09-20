# Replit parity — exact port

Production mewe at `/` now mounts the Replit client (colors, layout, 428px mobile shell, activities, games, connection, rewards, terms/checkboxes). **Entry is login → dashboard** (KAN-90): no marketing cover, no splash, no test-profile gate. The assessment remains at `/taller`.

## How to open both apps on this VM

| App | Command | Port | URL |
|---|---|---|---|
| Replit reference (live visual source) | `npm run ref` | **5173** | http://localhost:5173 |
| Production mewe (this branch) | `npm run dev` | **5174** | http://localhost:5174 |

Replit proxy target (no secrets): `https://juntas-fuertes--yepezmancheno.replit.app`.

## Demo

- Email: `demo@mewe.test`
- Password: `MeWeDemo2026!`
- Seeded pairs: María Fernanda Páez ↔️ Valentina Páez; Gabriela Torres ↔️ Emilia Torres
- Unlinked demo (to generate a fresh QR/code): `sofia.demo@mewe.test` / `MeWeDemo2026!`

## Screen checklist

- [ ] Login / register tabs, demo credentials, purple/pink/indigo gradient
- [ ] Ecuador LOPDP terms checkbox + “Ver detalles completos” dialog + unsubscribe checkbox
- [ ] Home: mood tracker, connection card, Torres / Tiny Monsters / Escucho, Pamela teaser, charms
- [ ] `/activities` personalized catalog + workshop games
- [ ] `/connection` generate / enter pair code
- [ ] `/progress` mood + achievements
- [ ] `/chat` Pamela assistant
- [ ] `/profile` partner + settings (notifications, LOPDP, help, logout)
- [ ] Charms / rewards (Para Mamá / Para Hija, locked special piece)
- [ ] Calendar create/complete/weekly, timer snooze that persists, WhatsApp wa.me + optional webhook
- [ ] `/taller` still loads the 96-question assessment

## What was missing before (#6 / #7)

Prior interactive ports only stubbed a terracotta dashboard with 3 workshop cards. They did not ship Replit login/terms, games, connection QR/codes, charm rewards, Pamela chat, Replit colors (`#6366f1` purple/pink/indigo), or the 428px mobile shell.

## Smoke

1. `npm run lint && npm test && npm run build`
2. Start both ports above.
3. Login with the demo account on 5174.
4. Walk home → activities → connection → progress → chat → profile.
5. Open register tab and confirm the terms checkbox gates **ACEPTAR**.
6. Open `/taller` and confirm the assessment still boots.

## Assets

Exact Replit filenames live in `attached_assets/`, including the 1024×1024 mother-daughter charm/LEGO photos from the Drive dump (`image_1754076796918.png` and siblings). Production does **not** ship Express/Neon: `/` uses the Replit client + a local `/api` adapter (localStorage, optional Supabase `mewe_replit_store`). `/taller` remains the 96-question assessment on the existing Supabase path.

## Production feature path (no secrets)

- **WhatsApp:** settings persist on `/api/users/:id/notification-settings`. Test send writes `/api/users/:id/whatsapp-messages`, opens `wa.me`, and optionally POSTs to `VITE_MEWE_WHATSAPP_WEBHOOK_URL`. Browser reminders use the Notification API at the preferred time.
- **Timer / calendar:** snooze PATCHes the activity time via `/api/scheduled-activities/:id/snooze`. Dismiss confirms the activity. Weekly schedule and templates write real calendar rows.
- **User / contracts:** profile edit PATCHes `/api/users/:id`. Register stores LOPDP consent. Profile **Privacidad y datos** reopens the same agreement and can revoke/re-accept it. Logout clears token + session.
