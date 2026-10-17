# Security Policy

## Status of this project

resQlink is an **engineering prototype with simulated data and integrations**.
It is **not** connected to any real emergency service, SMS/USSD gateway,
identity registry or production database. There are no real user accounts and
no real personal data in this repository — every incident, identity, responder
unit and audit entry in the demo is fabricated.

That said, the *software* is taken seriously: people run it locally and may
deploy it, so vulnerabilities matter.

## Reporting a vulnerability

Please report vulnerabilities **privatively** via GitHub Security Advisories:

**https://github.com/shema-f/ResQlink/security/advisories/new**

- Do **not** open a public issue for security reports.
- Include: what you did, the impact you observed, reproduction steps, and
  your environment (OS, Node version).
- You will get an acknowledgement as soon as practical, an honest assessment
  of scope/impact, and credit in the advisory and CHANGELOG if you want it
  (unless you prefer to stay anonymous).

## Supported versions

Only the latest release on `main` receives fixes.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | ✅        |

## Threat model (prototype scope)

In scope for security review:

- The Express API in `server.ts` (input validation, authorization, injection).
- The demo OTP/identity flow and its mode gates (`DEMO_MODE`, `NODE_ENV`).
- The dispatch API-key mechanism (`x-dispatch-api-key`).
- Client-side handling of session state and API keys.
- Dependency and build-chain risks.

Explicitly out of scope / known limitations (documented, not bugs to hide):

- **No real authentication.** The OTP flow is simulated; `123456` is accepted
  in demo mode by design, and OTP codes are echoed in API responses. Production
  mode refuses to simulate this at all (503). Real identity verification is
  roadmap work.
- **Rate limiting is basic.** A dependency-free per-IP fixed-window limiter
  covers the OTP and AI endpoints (10/min and 30/min by default, tunable via
  `RATE_LIMIT_OTP` / `RATE_LIMIT_AI`). There is no global limiter, no
  distributed state, and no protection at the CDN/WAF layer.
- **No CSP.** Security headers (`nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer`) are set, but a Content-Security-Policy is
  deliberately not configured because the app loads Google Fonts and the
  optional Google Maps loader and Vite injects inline styles in dev.
- **In-memory store.** Data resets on restart; there is no persistence layer
  to secure in the default configuration.
- **The browser-side dispatch key** (`VITE_DISPATCH_API_KEY`) is visible to
  anyone who can load the page — only set it in a deployment you control and
  understand.
- **No HTTPS termination** — run behind a TLS-terminating proxy in any shared
  or public deployment.

## Security-relevant behaviour that is intentional

- Dispatch mutations **fail closed** in production: with no `DISPATCH_API_KEY`
  configured they answer `503` instead of staying open.
- API-key comparison is constant-time (`crypto.timingSafeEqual`).
- Status transitions are validated (unknown → `400`, terminal incidents can
  never be reopened → `409`).
- Incident creation validates payload shape and numeric ranges.
- The client never seeds a pre-verified phone identity; sessions only exist
  after an explicit verification step in that browser.

If you believe any of these protections can be bypassed, that is a bug worth
reporting.
