# Preview look & feel — LEGO institutional redesign

Branch: `preview/lookfeel-lego` · **Test only — do not merge to `main`.**

## Before vs after

| Area | Production (main) | Preview (this branch) |
| --- | --- | --- |
| **Typography** | Georgia serif headings + Inter body | **Outfit** display + **Public Sans** body |
| **Landing layout** | Single rounded cream card, centered serif hero, 3-column soft panels | Navy chrome bar, split hero (copy + mosaic), numbered feature strip with top accents |
| **Access / roles** | 3 equal vertical cards in a row | Full-width horizontal role rows with numbered badges |
| **Shell** | One floating white blob on warm radial gradient | Flat cool grid background, sheets with gradient top rule |
| **Buttons** | Coral gradient pills | Teal institutional rectangles (`6px` radius) |
| **Logo** | Serif ME/WE with rotated divider | Sans lockup: coral ME / gold slash / teal WE |
| **Cards** | 28px radius, warm fills | 10–14px radius, white surfaces, colored top/left rules |
| **Dashboard** | Terracotta progress + pill badges | Teal/info progress bars, compact status rows |
| **Reports** | Cream hero band | Navy report hero, square score tile, institutional index cards |

## Palette (LEGO deck)

| Token | Hex | Use |
| --- | --- | --- |
| Navy | `#0E2038` | Headings, chrome, report hero |
| Teal | `#1F8A79` | Primary actions, WE mark, progress |
| Blue | `#3A6EA5` | Links, focus rings, accents |
| Gold | `#E8A33D` | Eyebrows, score orb, mosaic |
| Coral | `#C8453C` | ME mark, cuidado zones |
| BG | `#F3F6FA` / `#DCE3EC` | Page + surfaces |

## Structural UI changes (not just hex)

1. **New font stack** loaded in `index.html` (Google Fonts).
2. **Landing** (`CoverPage.jsx`): `landing-chrome`, split `landing-hero`, `hero-mosaic`, `feature-strip` — new DOM structure.
3. **Access** (`RolePage.jsx`): `access-header` + `role-list` / `role-row` — replaces 3-column `RoleCard` grid.
4. **Shell** (`ui.jsx`): `variant="landing|access"`, transparent containers, `site-footer`, redesigned `BrandMark` lockup, `StatusCard` layout.
5. **Design system** (`styles.css`): full rewrite — spacing scale, radii, shadows, component chrome.
6. **Reports/charts**: navy `report-hero`, square `score-orb`, teal/info chart colors (unchanged data).

## Test badge

Landing chrome shows **“Look & feel de prueba”** (gold on navy).

## Files changed

- `index.html` — font preconnect + Outfit/Public Sans
- `src/styles.css` — institutional design system
- `src/components/ui.jsx` — shell variants, brand, status card
- `src/pages/CoverPage.jsx` — landing layout redesign
- `src/pages/RolePage.jsx` — access layout redesign
- `src/components/RadarChart.jsx` — chart colors (prior pass)
- `src/pages/IndividualReportPage.jsx` — radar props (prior pass)
- `src/lib/pdfExport.js` — PDF background (prior pass)

## How to verify

1. Open PR #5 Vercel preview or republish `dist/` to here.now from `preview/lookfeel-lego-public`.
2. **3-second test:** landing should show navy header bar + mosaic — not a single cream card.
3. Tap **Entrar** → role screen should be horizontal rows, not 3 tall cards.
4. Confirm badge on landing; spot-check dashboard and a report for teal buttons and navy hero.

**Do not merge to `main` until Jaime signs off.**
