# HabitGrid v2

A full-featured productivity and habit tracking app. Frontend-only, no build tools required — open `index.html` in any modern browser.

## Architecture

```
src/
├── core/
│   ├── constants.js   — All fixed values, route names, STORAGE_KEYS
│   ├── api.js         — Data layer abstraction (localStorage now, swap for fetch later)
│   ├── store.js       — Central state + pub/sub observer + all async actions
│   ├── router.js      — Hash-based SPA router with auth guards
│   └── theme.js       — Dark/light/system theme manager
├── utils/
│   ├── date.js        — Pure date helpers, no side effects
│   ├── stats.js       — Pure analytics (streaks, totals, trends)
│   └── io.js          — File export (JSON/CSV) and import
├── components/
│   ├── shared.js      — Reusable HTML primitives (stat card, progress bar, badges)
│   ├── modal.js       — Modal manager with stack support
│   ├── habitModal.js  — Add/Edit habit form (Promise-based)
│   ├── toast.js       — Toasts + confetti
│   └── topbar.js      — Sticky nav bar (subscribes to store)
├── pages/
│   ├── auth.js        — Login / Register (auth-ready structure)
│   ├── tracker.js     — Main monthly habit grid
│   ├── history.js     — Monthly history + trend chart
│   └── settings.js    — Preferences, export/import, reset
└── main.js            — Bootstrap: store → theme → topbar → router
```

## Adding a Backend

The `src/core/api.js` file is the only layer that needs changing:
- Replace `readKey`/`writeKey` with `fetch()` calls in `AuthAPI`, `HabitsAPI`, `CompletionsAPI`
- Keep `store.js`, all pages, and all components exactly as-is
- Add request headers (e.g. `Authorization: Bearer <token>`) in `api.js` once you have real sessions

## Features

- **Monthly habit grid** — sticky name column, week groupings, day toggles
- **Dashboard** — 5 live stat cards (habits, today, streaks, monthly %)
- **Filters** — All / Done Today / Missed Today + category
- **History page** — 6-month trend bar chart, per-habit breakdown cards
- **Settings page** — theme (light/dark/system), accent colour picker, default goal, export/import, reset
- **Auth page** — login + register UI (localStorage-backed, backend-ready)
- **Data export** — JSON backup + per-month CSV
- **Data import** — restore from JSON backup
- **Dark mode** — full CSS token system, no flash on load
- **Responsive** — works on mobile, tablet, and desktop
- **Keyboard shortcuts** — Escape closes modal, Ctrl+Enter saves
