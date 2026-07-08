# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR (proxies API routes to `http://localhost:3000`).
- `npm run build` — Production build (outputs to `dist/`).
- `npm run preview` — Serve the production build locally.
- `npm run lint` — Run ESLint over the project.

There is no test suite configured.

## Overview

WAWave is a React 19 + Vite SPA frontend for a WhatsApp bulk-messaging service. It links a user's WhatsApp account via QR, uploads recipient lists, and dispatches throttled bulk message campaigns ("jobs") with anti-spam pacing.

## Architecture

**API layer (`src/api/`).** All HTTP goes through `client.js`, a single axios instance. It injects the bearer token from `localStorage.getItem('token')` on every request, and on any `401` it clears the token and hard-redirects to `/login`. Each other file in `src/api/` is a thin wrapper exposing functions per backend domain (`auth`, `wa`, `messages`, `settings`, `subscription`). Backend base URL comes from `VITE_API_URL` (empty in dev so the Vite proxy handles it — see `vite.config.js` for the proxied path prefixes: `/auth`, `/wa`, `/message`, `/upload`, `/settings`, `/admin`, `/health`).

**Auth & global state (`src/context/AuthContext.jsx`).** `AuthProvider` wraps the app and is the single source of truth for `user`, `subscription`, and `usage`. On mount it calls `getMe()` if a token exists. `signIn(token, userData)` persists the token and refetches; `signOut()` clears `token` + `waStatus` from localStorage. Consume via the `useAuth()` hook.

**Routing (`src/App.jsx`).** `BrowserRouter` with all app routes (except `/login`) wrapped in `PrivateRoute`, which gates on `useAuth()` — shows a loading state while auth resolves, redirects to `/login` if no user. Each route maps to one screen in `src/screens/`.

**Layout (`src/components/Shell.jsx`).** Every authenticated screen renders inside `<Shell title sub badges>`, which provides the sidebar (nav + account menu + upgrade prompt) and topbar. The sidebar **polls `getWaStatus()` every 5s** to show WhatsApp connection state, caching the last result in `localStorage` under `waStatus` to avoid flicker on transient errors. Note the `NAV` array in this file defines which screens appear in the sidebar — it is a subset of the routes in `App.jsx`.

**Screens (`src/screens/`).** One file per route. The core flow lives in `SendMessages.jsx`: upload a recipient file → `uploadRecipients` returns an upload id → `sendBulk` starts a job → poll `getJob(id)` for progress. `Jobs.jsx` and `MessageLogs.jsx` track and inspect dispatch history.

## Conventions & gotchas

- **Styling is plain CSS**, not a framework. Global styles live in `src/styles.css` (the `wa-*` class names) with utility classes (`text-sm`, `text-gray`, `text-mono`); some components also use inline `style={{}}` objects. There is no Tailwind/CSS-modules.
- **Phone number handling** is centralized in `src/utils/numbers.js`. Use `normalizeNumber(raw, dialCode)` to convert input to E.164 — do not reimplement parsing. `COUNTRIES` holds the supported dial codes for the country picker.
- **File uploads / non-Latin text:** CSV files are read in-browser with SheetJS (`xlsx`). CSVs must be decoded explicitly as UTF-8 (`file.text()`) — SheetJS's array-mode default falls back to Latin-1 and mangles Sinhala/Tamil/emoji into mojibake. See the comment in `SendMessages.jsx`.
- **Subscription gating:** `subscription.plan` from `useAuth()` drives upgrade prompts. Tiers are `pro`, `proplus`, `unlimited`, `ultra` (ultra = API access). New users have `subscription: null` (no plan) and are locked until they subscribe on `/pricing`. Billing is **Dodo Payments**: `/pricing` calls `startCheckout(plan)` → backend returns `checkoutUrl` → `window.location` redirects to Dodo's hosted checkout. On return (`?checkout=success`) the page calls `refresh()`; the plan is actually granted server-side by the Dodo webhook, so `refresh` may need a moment. `selectPlan` (free activation) still exists for dev but the backend 403s it when Dodo is configured. The plan list in `Pricing.jsx` mirrors the backend `src/utils/plans.js` catalog.
