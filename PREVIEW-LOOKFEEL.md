# Preview look & feel — LEGO / institutional palette

This branch (`preview/lookfeel-lego`) applies a **test-only** visual theme for Vercel preview deployments. It does **not** change product copy, flows, or logic.

## Purpose

Replace the warm terracotta palette with the LEGO / institutional colors approved in Jaime’s training deck, so stakeholders can review the new look in isolation before any production rollout.

## Token map

| Token | Production (main) | Preview (this branch) |
| --- | --- | --- |
| `--primary` | `#B84F37` | `#C8453C` |
| `--primary-dark` | `#8F3928` | `#0E2038` |
| `--secondary` | `#718556` | `#1F8A79` |
| `--accent` | `#E9A67A` | `#E8A33D` |
| `--ink` | `#26211F` | `#0E2038` |
| `--muted` | `#736A62` | `#5E7186` |
| `--bg` | `#FBF5EE` | `#F3F6FA` |
| `--surface` | `#FFFDF9` | `#FFFFFF` |
| `--surface-strong` | `#FFFFFF` | `#FFFFFF` |
| `--callout` | `#F4E3D0` | `#E9EFF6` |
| `--cita` | `#EDE8DD` | `#DCE3EC` |
| `--border` | `#DACAB7` | `#A8B7C7` |
| `--secondary-soft` | _(n/a)_ | `#CDE6DE` |
| `--danger-soft` | _(n/a)_ | `#F0D5D2` |
| `--info` | _(n/a)_ | `#3A6EA5` |

Shadows use navy-tinted `rgba(14, 32, 56, …)` instead of warm brown.

## Files touched

- `src/styles.css` — `:root` tokens, gradients, shadows, and hardcoded rgba/hex aligned to the new palette
- `src/pages/CoverPage.jsx` — unobtrusive “Look & feel de prueba” badge on the landing hero
- `src/components/RadarChart.jsx` — chart stroke/fill colors for madre/hija series
- `src/pages/IndividualReportPage.jsx` — radar color props
- `src/lib/pdfExport.js` — PDF capture background
- `src/lib/pdfExport.test.js` — expected background in unit test

Typography (Georgia headings / Inter body) is unchanged.

## How to review

1. Open the PR’s Vercel preview URL.
2. Confirm the landing page shows the test badge and cooler navy/teal palette.
3. Spot-check reports and charts for updated primary/secondary colors.

**Do not merge to `main` until design sign-off.**
