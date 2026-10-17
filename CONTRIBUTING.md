# Contributing to resQlink

Thanks for your interest in improving resQlink — an **engineering prototype**
of a Rwanda emergency-response platform. Contributions that make the project
more correct, honest, accessible or maintainable are especially welcome.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

> **Reminder:** this is a prototype with **simulated data and integrations**.
> It is not connected to any real emergency service. Any contribution must
> preserve that honesty — never present simulated behaviour as real.

## Getting set up

Prerequisites: **Node.js 20+** (developed and tested on 22) and npm.

```bash
git clone https://github.com/shema-f/ResQlink.git
cd ResQlink
npm install
cp .env.example .env   # every variable is optional for the demo
npm run dev            # API + web app on http://localhost:3000
```

Open <http://localhost:3000>. The amber prototype strip in the header
confirms you are running the labelled demo build.

## Before you open a pull request

Run the same checks CI runs:

```bash
npm run lint    # typecheck gate (tsc --noEmit)
npm test        # API test suite (node:test + tsx)
npm run build   # production bundle
```

All three must pass. New behaviour should come with tests; bug fixes should
include a test that fails without the fix when practical.

## Coding conventions

- **TypeScript everywhere.** `npm run lint` is a hard gate — no `any` where a
  real type exists, no suppressions just to make the gate pass.
- **Zero-new-dependency by default.** Prefer the standard library or what is
  already in `package.json`. If a dependency is genuinely the right call,
  justify it in the pull request.
- **Honest labelling is a feature, not a comment.** Simulated integrations
  (OTP/SMS/USSD, dispatch data) must stay visibly simulated in the UI, the
  API responses and the docs. Real-world facts (emergency numbers, institution
  names) must stay sourced — see the README "Data provenance" table and keep
  it accurate.
- Match the existing style: small focused components, structured JSON API
  responses (`{ success, message, data }`), provenance comments on datasets.
- No hardcoded personal paths, machine settings, credentials or real personal
  data — ever.

## Testing

Tests live in [`tests/server.test.ts`](tests/server.test.ts) and run against
the real Express app in-process (ephemeral port, no Vite, no external
services). Add cases to the existing `describe` blocks, or a new block, for:

- new endpoints and validation rules,
- authorization behaviour (demo vs production mode),
- failure paths (4xx/5xx with structured errors).

## Reporting issues

- **Bugs:** use the bug report template. Include what you did, what you
  expected, what happened, and your OS / Node version.
- **Security vulnerabilities:** follow [SECURITY.md](SECURITY.md) — do **not**
  open a public issue.
- **Features:** use the feature request template. Remember the roadmap in the
  README before proposing work already planned.

## Pull request process

1. Fork and create a branch from `main` (e.g. `fix/otp-expiry-message`).
2. Make focused, reviewable changes — one concern per PR.
3. Update documentation (README, CHANGELOG `[Unreleased]`, `.env.example`)
   when behaviour or configuration changes.
4. Open the PR with the template filled in; describe *why*, and how you
   verified it.
5. A maintainer will review. Small, well-tested PRs merge fastest.

## Good first contributions

- Accessibility improvements (labels, focus states, contrast) in
  `src/components/`.
- Translation fixes or additions in `src/data/translations.ts` (EN/RW/FR).
- Tests for untested endpoints in `server.ts`.
- Documentation clarity — if something confused you, it will confuse others.

By contributing, you agree that your contributions are licensed under the
[Apache License 2.0](LICENSE), the same license that covers the project.
