<div align="center">

# resQlink — Rwanda Emergency Response Platform

**An engineering prototype by [Ferrivox]**

[![Status](https://img.shields.io/badge/status-prototype%20%2F%20demo-orange)](#status-prototype)
[![Tests](https://img.shields.io/badge/tests-24%20passing-brightgreen)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-typed-blue)](#stack)
[![React](https://img.shields.io/badge/React-19-61dafb)](#stack)

**One-tap SOS, live dispatch workflows and an AI emergency copilot — designed
for Rwanda's 112 / 113 / 912 / 111 emergency ecosystem.**

</div>

> ## ⚠️ Status: PROTOTYPE — NOT A REAL EMERGENCY SERVICE
>
> This repository is a **demonstration / portfolio build**. It is **not**
> connected to the Rwanda National Police, SAMU, the Fire & Rescue Brigade,
> any SMS/USSD gateway, or any emergency dispatch centre. **All incidents,
> responder units, GPS tracks, audit logs, identities and referral data are
> simulated.** Phone verification runs in demo mode only — no real SMS is ever
> sent.
>
> **If you are in danger, call the real numbers: 112 (general), 113 (traffic),
> 912 (ambulance), 111 (fire).** Do not rely on this app in an emergency.
>
> The same disclosure is permanently visible inside the app itself (the amber
> strip in the header) so nobody can mistake a running demo for a live system.

---

## Why this project exists

Rwanda's emergency numbers are short and well known, but the *workflow around
them* — sharing an exact location, triaging casualties, tracking which unit is
en route — is where minutes are lost. resQlink explores that workflow end to
end:

- **Citizen SOS** — report an incident with type, casualty counts, GPS pin and
  photo/audio hints; priority is triaged automatically.
- **Command dashboard** — dispatch view with status lifecycle, responder
  assignment, nearest-facility search (WGS84/PostGIS-style KNN) and audit trail.
- **Responder portal** — acknowledge → en route → on scene → all clear, with
  optimistic UI, honest offline/pending/failure states and live Socket.IO
  movement.
- **Uwera AI copilot** — Gemini-powered triage guidance in Kinyarwanda, English
  and French, with a keyword-driven offline fallback when no API key is set.
- **Offline-first thinking** — SMS preview, USSD *113# session simulator and
  hotlines surfaced at every step (all simulated in this build).
- **Maps** — OpenStreetMap/Leaflet out of the box, Google Maps when
  `VITE_GOOGLE_MAPS_API_KEY` is configured.

## Status: prototype

| Area | State in this build |
| --- | --- |
| Web UI, dashboards, i18n (EN/RW/FR), theming | Working, client-side |
| REST API + Socket.IO realtime | Working (Express, in-memory store) |
| Phone OTP / identity | **Simulated, demo mode only** (no SMS gateway) |
| SMS / USSD gateways | **Simulated responses only** |
| RNP / SAMU dispatch integration | **None — data is fabricated** |
| PostgreSQL/PostGIS | Optional; falls back to in-memory WGS84 store |
| Gemini AI copilot | Live only if `GEMINI_API_KEY` is set; otherwise guided fallback |
| Automated tests | 24 API tests (creation, auth, transitions, failures) |

Everything marked *simulated* or *none* is deliberately labelled instead of
faked as real: see [Security & modes](#security--modes) and
[Data provenance](#data-provenance).

## Stack

- **TypeScript** everywhere — `tsc --noEmit` gate (`npm run lint`)
- **React 19 + Vite 8 + Tailwind CSS 4** SPA with route-level code splitting
- **Express 4 + Socket.IO 4** server that also drives Vite in middleware mode
  (single `npm run dev` process serves API + assets + HMR)
- **node:test + tsx** for the API test suite — no extra test dependencies
- Optional: PostgreSQL/PostGIS (`DATABASE_URL`), Google Maps, Gemini API

## Getting started

**Prerequisites:** Node.js 20+ (tested on 22), npm.

```bash
npm install        # install dependencies
cp .env.example .env   # fill in the keys you need (all optional for the demo)
npm run dev        # API + web app on http://localhost:3000
```

Then open <http://localhost:3000>. The amber prototype strip at the top of the
app confirms you are looking at the demo build.

```bash
npm test           # API test suite (node:test)
npm run lint       # typecheck gate (tsc --noEmit)
npm run build      # production bundle → dist/
npm start          # run the server (serves dist/ when NODE_ENV=production)
```

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | Enables the live Uwera AI copilot | unset → guided fallback |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps view | unset → OpenStreetMap |
| `DATABASE_URL` | PostgreSQL/PostGIS connection string | unset → in-memory store |
| `DISPATCH_API_KEY` | Server secret for dispatch mutations (`x-dispatch-api-key`) | unset → **fail closed (503) in production**, open in demo |
| `VITE_DISPATCH_API_KEY` | Browser copy of the key (only if you trust the dashboard) | unset |
| `DEMO_MODE` | Enables simulated OTP/identity behaviours | `true` outside `NODE_ENV=production` |
| `CORS_ORIGIN` | Allowed Socket.IO origin when auth is enforced | same-origin |
| `PORT` | HTTP port | `3000` |

## Security & modes

The server has two honest modes (reported by `GET /api/health` as
`demoMode` and `dispatchAuth`):

**Demo mode** (default for `npm run dev`):
- OTP codes are echoed to the caller (`demoCode`) and the fixed code `123456`
  is accepted — clearly labelled as simulated in the API response and the UI.
- Dispatch endpoints are open, matching the labelled local demo.

**Production mode** (`NODE_ENV=production`):
- **No simulated identity or verification runs.** `/api/auth/otp/request`
  answers `503` with an explicit "SMS delivery is not integrated" message
  instead of pretending a code was sent, and `123456` is never accepted.
- **Dispatch mutations fail closed** — incident status changes, responder
  heartbeats, SMS send/webhook and database connection tests require the
  `x-dispatch-api-key` header; with no `DISPATCH_API_KEY` configured they
  answer `503` rather than staying open. Key comparison is constant-time.
- Socket.IO CORS defaults to same-origin unless `CORS_ORIGIN` is set.

Additional hardening in this build:

- Status-transition rules: unknown statuses → `400`; terminal incidents
  (`RESOLVED` / `CANCELLED`) can never be reopened → `409`.
- Incident-creation payload validation (numeric ranges, finite coordinates,
  JSON-object body) → `400` instead of inventing incidents from garbage.
- The client never seeds a pre-verified phone number; a session only exists
  after an explicit (demo) OTP verification in that browser.
- Store-badges, structured data and meta descriptions no longer claim real
  store listings or fabricated ratings.

## API surface (selection)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/health` | — | Status, prototype & mode flags |
| GET/POST | `/api/incidents` | — | List / create (priority triage, validation) |
| PATCH | `/api/incidents/:id` | dispatch key (prod) | Status transition rules enforced |
| GET | `/api/facilities/nearby?lat&lng` | — | Nearest facilities (WGS84 KNN) |
| POST | `/api/auth/otp/request` | — | **Demo:** returns `demoCode`; **prod:** 503 |
| POST | `/api/auth/otp/verify` | — | `123456` accepted in demo only |
| GET | `/api/responders` | — | Demo responder fleet |
| POST | `/api/responders/location` | dispatch key (prod) | GPS heartbeat |
| POST | `/api/sms/send`, `/api/sms/webhook` | dispatch key (prod) | Simulated gateway |
| POST | `/api/ussd/session` | — | *113# session simulator |
| POST | `/api/ai/assistant` | — | Gemini or guided fallback |
| POST | `/api/database/test-connection` | dispatch key (prod) | Postgres/PostGIS probe |

Realtime (Socket.IO): `incident:new`, `incident:updated`, `responder:moved`,
`connection:ack`.

## Data provenance: verified vs illustrative

Honesty about data matters most in a public-safety project. This is exactly
what in this build is real, what is a real-world fact re-checked from public
sources, and what is fabricated:

| Data | Classification | Notes |
| --- | --- | --- |
| **112** general emergency, **912** ambulance | **Verified** | Published on [gov.rw/emergency](https://www.gov.rw/emergency) |
| **113** traffic accidents, **111** fire brigade | **Verified** | Published by Rwanda National Police ([police.gov.rw](https://www.police.gov.rw), RNP official channels) |
| 3511 (police misconduct), 997 (anti-corruption), 114 (maritime) | **Commonly published — re-check before relying on** | Used in copy and the AI prompt; not independently re-verified for this build |
| RNP HQ `+250 788 311 155`, `info@police.gov.rw` | **Verified public contact** | From police.gov.rw documents; shown as reference only — this project is **not affiliated** with RNP |
| Facility **names** (CHUK, King Faisal Hospital, Rwanda Military Hospital, Kibagabaga, RNP stations…) | **Real institutions** | Exist and are correctly located in Rwanda |
| Facility **coordinates & phone numbers** | **Illustrative** | Approximations for demo routing; **not** verified directory data — do not dial from this app |
| Incidents (`RW-2026-xxxxx`), casualty details, reporter names | **Fabricated demo data** | No real event or person is depicted |
| Responder units, plates, GPS tracks, ETAs | **Fabricated demo data** | Simulated movement in the heartbeat loop |
| Audit log entries, referral codes/leaderboard | **Fabricated demo data** | |
| OTP codes, session tokens, SMS/USSD exchanges | **Simulated** | No gateway integration; demo mode only |
| "App Store / Google Play" badges & download links | **Illustrative** | No store listing exists; structured data was stripped of fake ratings |

Seed data carries the same disclaimer inline — see the provenance comments in
[`server.ts`](server.ts) and [`src/data/rwandaData.ts`](src/data/rwandaData.ts).

## Testing

```bash
npm test
```

24 tests in [`tests/server.test.ts`](tests/server.test.ts) run against the real
Express app in-process (ephemeral port, no Vite, no external services):

- **Incident creation** — success shape, priority rules (unconscious → CRITICAL,
  road blocked → HIGH), payload validation, malformed JSON → 400.
- **Authorization** — dispatch key required in production-like mode
  (401 wrong/missing, 200 correct, 503 fail-closed with no key), open in the
  labelled demo; guarded endpoints never touch downstream systems unauthorized.
- **Status transitions** — full lifecycle walk, `resolvedAt` stamping, 409 for
  terminal incidents, 400 for unknown statuses, 404 for unknown incidents.
- **Failure scenarios** — unknown responder, invalid referrals, OTP request/
  verify failure paths, and proof that production mode refuses simulation
  (503 without `demoCode`, `123456` rejected).

## Project structure

```
├── server.ts            # Express + Socket.IO API, modes, guards, seed data
├── tests/server.test.ts # node:test API suite
├── schema.sql           # PostgreSQL/PostGIS schema (optional real DB)
├── index.html           # App shell + honest meta/structured data
├── src/
│   ├── App.tsx          # Shell, routing, session state, prototype footer
│   ├── components/      # Dashboards, SOS, responder, maps, auth, AI chat
│   ├── data/            # Demo datasets + provenance comments, translations
│   ├── services/api.ts  # REST + Socket.IO client (dispatch key aware)
│   └── routes/          # Lazy view chunks (code splitting)
└── vite.config.ts       # React + Tailwind, HMR control
```

## Roadmap / known limitations

- Real SMS/USSD delivery (Africa's Talking or similar) — the endpoints are
  shaped for it, but nothing is integrated; production mode refuses to pretend.
- Real authentication (verified phone identities, dispatcher roles, sessions)
  — today: a demo OTP flow plus an API key for dispatch mutations.
- Persistence beyond the in-memory store (schema.sql is ready; `DATABASE_URL`
  plugs in a real pool).
- Official operational validation — none of this has been exercised with real
  responders, and it must not be until partners review it.

## About Ferrivox

**Ferrivox** builds careful, honest software. resQlink is a portfolio
demonstration of full-stack engineering — realtime systems, geospatial logic,
AI integration and disciplined disclosure of what a prototype does and does not
do. Priorities in this codebase: **reliability, honest demo labelling, and
security before features.**

---

<div align="center">

resQlink by **Ferrivox** · prototype build · not affiliated with the Rwanda
National Police, SAMU or any emergency service

In an emergency, call **112 / 113 / 912 / 111**.

</div>
