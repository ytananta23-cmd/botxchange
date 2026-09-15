<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# BotXchange — Frontend

React + TypeScript + Vite client for BotXchange, a Delta Exchange India
trading-bot dashboard. This app talks to the companion Node/Express API in
`botxchange-backend` — see that project's README for how to run it.

Originally scaffolded in AI Studio: https://ai.studio/apps/997f5cbe-da35-430c-973a-7153da03f5e3

## Run locally

**Prerequisites:** Node.js, and the backend running (see `botxchange-backend/README.md`).

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and point `VITE_API_BASE_URL` at your
   backend, e.g. `http://localhost:4000/api` for local dev. The WebSocket
   connection is derived from this same URL automatically.
3. Run the app:
   `npm run dev`

This starts the dev server on **port 3000** (hard-coded in the `dev` script
in `package.json`). The backend defaults to port **4000** for exactly this
reason — the two would otherwise collide if both are run locally at once.

## Mock mode

`src/api/client.ts` has a `USE_MOCK` constant. Set it to `true` to run the
UI entirely against the fixtures in `src/api/mockData.ts`, with no backend
required — useful for UI-only work. It's `false` by default so the app talks
to the real backend.

## Notes

- This project no longer uses the Gemini API directly; earlier AI Studio
  scaffolding referenced a `GEMINI_API_KEY`, but nothing in the current
  source reads it, so it isn't needed.
- `npm run lint` runs `tsc --noEmit` for a type-check (no separate ESLint
  config is set up).
