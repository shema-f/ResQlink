# Changelog

## [Unreleased]

### Changed

- Replaced non-existent mobile-store links, government-looking identifiers and
  invented adoption/performance metrics with real GitHub/API documentation
  links and explicit prototype facts.
- Updated referral links to use the current deployment origin rather than an
  unverified production domain.
- Clarified the public landing copy in Kinyarwanda, English and French: the
  project is independent, uses synthetic data and is not connected to emergency
  services.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-17

First public release of the resQlink engineering prototype. All incidents,
identities, responder units and audit entries are **fabricated demo data**;
phone verification is demo-mode only (no SMS gateway is integrated).

### Added

- Citizen SOS reporting with automatic priority triage and payload validation.
- Command dispatch dashboard with incident status lifecycle rules
  (unknown status → `400`, terminal states → `409`, `resolvedAt` stamping).
- Responder portal with acknowledge → en route → on scene → all clear flow,
  honest offline/pending/failure sync states and Socket.IO realtime updates
  (`incident:new`, `incident:updated`, `responder:moved`).
- "Uwera" AI triage copilot (Gemini when `GEMINI_API_KEY` is set, guided
  keyword fallback otherwise) in Kinyarwanda, English and French.
- Nearest-facility search using WGS84/PostGIS-style KNN; optional real
  PostgreSQL/PostGIS via `DATABASE_URL`, in-memory fallback otherwise.
- OpenStreetMap/Leaflet maps with optional Google Maps view.
- API test suite (`tests/server.test.ts`, node:test + tsx) covering incident
  creation, authorization, status transitions, failure scenarios, and rate
  limiting — 27 tests.
- Prototype labelling throughout the UI (header strip, footer, honest meta),
  and a documented data-provenance table separating verified facts from
  illustrative demo data.

### Security

- Dispatch mutations require `x-dispatch-api-key` in production and **fail
  closed** (503) when no key is configured; constant-time key comparison.
- Simulated identity refused on production paths: OTP request answers 503
  outside demo mode and the fixed demo code is rejected.
- Dependency-free per-IP rate limiting on OTP (10/min) and AI (30/min)
  endpoints, tunable via `RATE_LIMIT_OTP` / `RATE_LIMIT_AI`.
- Security headers on all responses: `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.
- No secrets, credentials or personal data in the repository; `.env.example`
  contains placeholders only.

### Changed

- Package metadata published as `resqlink` (previously the template default
  `react-example`), version 0.1.0, Apache-2.0 license.
- Startup log prints the browsable `http://localhost:<port>` address instead
  of the `0.0.0.0` bind wildcard.
- Removed inert AI Studio scaffolding (`metadata.json`) and AI Studio
  template language from `.env.example`.

[Unreleased]: https://github.com/shema-f/ResQlink/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/shema-f/ResQlink/releases/tag/v0.1.0
