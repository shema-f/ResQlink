/**
 * resQlink API test suite (node:test + tsx — no extra dependencies).
 *
 * Covers the four areas requested for portfolio hardening:
 *   1. Incident creation (success + priority rules + validation)
 *   2. Authorization  (dispatch API key: demo open, production fail-closed)
 *   3. Status transitions (lifecycle rules, terminal states)
 *   4. Failure scenarios (404/400/409/401/503 paths, OTP simulation gates)
 *
 * The server module exposes `createApp()` which builds Express + Socket.IO
 * without binding a port or booting Vite, so each suite runs in-process.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { createApp, type ServerOptions } from '../server.ts';

const DISPATCH_KEY = 'test-dispatch-key-1234567890';

interface Harness {
  base: string;
  close: () => Promise<void>;
}

async function startApp(options: ServerOptions = {}): Promise<Harness> {
  // Generous rate-limit defaults so unrelated suites can never flake against
  // the per-IP OTP/AI budgets; the limiter itself is tested explicitly in the
  // "rate limiting & security headers" block with deliberately low limits.
  const server = await createApp({
    serveClient: false,
    otpRateLimit: 1000,
    aiRateLimit: 1000,
    ...options
  });
  await new Promise<void>((resolve, reject) => {
    server.httpServer.once('error', reject);
    server.httpServer.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.httpServer.address() as AddressInfo;
  return {
    base: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.httpServer.closeAllConnections();
        server.httpServer.close((err) => (err ? reject(err) : resolve()));
      })
  };
}

type ApiResponse = { status: number; body: any };

async function api(
  base: string,
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse> {
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  let body: any = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  return { status: res.status, body };
}

function jsonInit(method: string, payload: unknown, headers: Record<string, string> = {}): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(payload)
  };
}

// ===========================================================================
// 1 + 3 + 4. Demo-mode API: creation, transitions, failure scenarios, OTP
// ===========================================================================
describe('demo mode (default options)', () => {
  let h: Harness;
  before(async () => {
    h = await startApp();
  });
  after(async () => {
    await h.close();
  });

  test('health reports prototype + demo mode honestly', async () => {
    const { status, body } = await api(h.base, '/api/health');
    assert.equal(status, 200);
    assert.equal(body.status, 'UP');
    assert.equal(body.prototype, true);
    assert.equal(body.demoMode, true);
    assert.equal(body.identityVerification, 'SIMULATED_DEMO_ONLY');
    assert.equal(body.dispatchAuth, 'OPEN_DEMO');
    assert.equal(body.rnpCommandLink, 'SIMULATED');
  });

  test('POST /api/incidents creates a TRIAGED incident with a public ID', async () => {
    const { status, body } = await api(h.base, '/api/incidents', jsonInit('POST', {}));
    assert.equal(status, 201);
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'TRIAGED');
    assert.equal(body.data.priority, 'MODERATE');
    assert.match(body.data.publicId, /^RW-2026-\d{5}$/);
    assert.ok(body.data.id, 'incident receives an internal id');
  });

  test('POST /api/incidents escalates priority for unconscious casualties', async () => {
    const { status, body } = await api(
      h.base,
      '/api/incidents',
      jsonInit('POST', { peopleAffected: 2, unconsciousCount: 1 })
    );
    assert.equal(status, 201);
    assert.equal(body.data.priority, 'CRITICAL');
  });

  test('POST /api/incidents marks road blockage as HIGH priority', async () => {
    const { status, body } = await api(
      h.base,
      '/api/incidents',
      jsonInit('POST', { roadBlocked: true })
    );
    assert.equal(status, 201);
    assert.equal(body.data.priority, 'HIGH');
  });

  test('POST /api/incidents rejects invalid payloads (400s)', async () => {
    const badBodies: unknown[] = [
      { peopleAffected: -1 },
      { unconsciousCount: 'many' },
      { location: { latitude: 'abc' } },
      ['not', 'an', 'object']
    ];
    for (const payload of badBodies) {
      const { status, body } = await api(h.base, '/api/incidents', jsonInit('POST', payload));
      assert.equal(status, 400, `expected 400 for ${JSON.stringify(payload)}`);
      assert.equal(body.success, false);
    }
  });

  test('POST /api/incidents rejects malformed JSON (400)', async () => {
    const res = await fetch(`${h.base}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{this is not json'
    });
    assert.equal(res.status, 400);
  });

  test('status transitions walk the lifecycle and set resolvedAt', async () => {
    const created = await api(h.base, '/api/incidents', jsonInit('POST', { peopleAffected: 1 }));
    const id = created.body.data.id as string;

    for (const next of ['DISPATCHED', 'RESPONDER_EN_ROUTE', 'ON_SCENE'] as const) {
      const { status, body } = await api(h.base, `/api/incidents/${id}`, jsonInit('PATCH', { status: next }));
      assert.equal(status, 200, `transition to ${next} should succeed`);
      assert.equal(body.data.status, next);
    }

    const resolved = await api(h.base, `/api/incidents/${id}`, jsonInit('PATCH', { status: 'RESOLVED' }));
    assert.equal(resolved.status, 200);
    assert.equal(resolved.body.data.status, 'RESOLVED');
    assert.ok(resolved.body.data.resolvedAt, 'resolvedAt is stamped on RESOLVED');
  });

  test('terminal incidents cannot transition (409)', async () => {
    const created = await api(h.base, '/api/incidents', jsonInit('POST', {}));
    const id = created.body.data.id as string;
    await api(h.base, `/api/incidents/${id}`, jsonInit('PATCH', { status: 'RESOLVED' }));

    const { status, body } = await api(
      h.base,
      `/api/incidents/${id}`,
      jsonInit('PATCH', { status: 'DISPATCHED' })
    );
    assert.equal(status, 409);
    assert.equal(body.success, false);
    assert.match(body.message, /terminal/i);
  });

  test('unknown status value is rejected (400)', async () => {
    const created = await api(h.base, '/api/incidents', jsonInit('POST', {}));
    const id = created.body.data.id as string;
    const { status, body } = await api(
      h.base,
      `/api/incidents/${id}`,
      jsonInit('PATCH', { status: 'TELEPORTED' })
    );
    assert.equal(status, 400);
    assert.match(body.message, /Unknown status/);
  });

  test('PATCH for an unknown incident returns 404', async () => {
    const { status, body } = await api(
      h.base,
      '/api/incidents/inc-does-not-exist',
      jsonInit('PATCH', { status: 'RESOLVED' })
    );
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });

  test('responder heartbeat for an unknown unit returns 404', async () => {
    const { status, body } = await api(
      h.base,
      '/api/responders/location',
      jsonInit('POST', { responderId: 'resp-nope', latitude: -1.95, longitude: 30.09 })
    );
    assert.equal(status, 404);
    assert.equal(body.success, false);
  });

  test('invalid referral code returns 400', async () => {
    const bad = await api(h.base, '/api/referral/ab');
    assert.equal(bad.status, 400);
    const claim = await api(h.base, '/api/referral/claim', jsonInit('POST', {}));
    assert.equal(claim.status, 400);
  });

  test('OTP demo flow: request returns an explicit demoCode, verify accepts it', async () => {
    const phone = '+250788000111';
    const req = await api(h.base, '/api/auth/otp/request', jsonInit('POST', { phoneNumber: phone }));
    assert.equal(req.status, 200);
    assert.equal(req.body.simulated, true);
    assert.match(req.body.message, /No real SMS was sent/i);
    assert.equal(typeof req.body.demoCode, 'string');
    assert.match(req.body.demoCode, /^\d{6}$/);

    const verify = await api(
      h.base,
      '/api/auth/otp/verify',
      jsonInit('POST', { phoneNumber: phone, otpCode: req.body.demoCode })
    );
    assert.equal(verify.status, 200);
    assert.equal(verify.body.success, true);
    assert.equal(verify.body.user.verified, true);
    assert.equal(verify.body.user.simulated, true);
  });

  test('OTP failure paths: missing/short phone, no session, wrong code', async () => {
    const missing = await api(h.base, '/api/auth/otp/request', jsonInit('POST', {}));
    assert.equal(missing.status, 400);

    const short = await api(h.base, '/api/auth/otp/request', jsonInit('POST', { phoneNumber: '123' }));
    assert.equal(short.status, 400);

    const noSession = await api(
      h.base,
      '/api/auth/otp/verify',
      jsonInit('POST', { phoneNumber: '+250788000222', otpCode: '111111' })
    );
    assert.equal(noSession.status, 400);

    const phone = '+250788000333';
    await api(h.base, '/api/auth/otp/request', jsonInit('POST', { phoneNumber: phone }));
    const wrong = await api(
      h.base,
      '/api/auth/otp/verify',
      jsonInit('POST', { phoneNumber: phone, otpCode: '000000' })
    );
    assert.equal(wrong.status, 400);
  });
});

// ===========================================================================
// 2. Authorization: production-like mode with dispatch auth enforced
// ===========================================================================
describe('production-like mode (simulation off, dispatch auth on)', () => {
  let h: Harness;
  before(async () => {
    process.env.DISPATCH_API_KEY = DISPATCH_KEY;
    h = await startApp({ demoMode: false, requireDispatchAuth: true });
  });
  after(async () => {
    await h.close();
    delete process.env.DISPATCH_API_KEY;
  });

  test('health reports production flags', async () => {
    const { status, body } = await api(h.base, '/api/health');
    assert.equal(status, 200);
    assert.equal(body.prototype, true);
    assert.equal(body.demoMode, false);
    assert.equal(body.identityVerification, 'DISABLED_NO_SMS_GATEWAY');
    assert.equal(body.dispatchAuth, 'X_DISPATCH_API_KEY_REQUIRED');
  });

  test('PATCH without API key is rejected (401)', async () => {
    const { status, body } = await api(
      h.base,
      '/api/incidents/inc-101',
      jsonInit('PATCH', { status: 'ON_SCENE' })
    );
    assert.equal(status, 401);
    assert.equal(body.success, false);
  });

  test('PATCH with a wrong API key is rejected (401)', async () => {
    const { status } = await api(
      h.base,
      '/api/incidents/inc-101',
      jsonInit('PATCH', { status: 'ON_SCENE' }, { 'x-dispatch-api-key': 'wrong-key' })
    );
    assert.equal(status, 401);
  });

  test('PATCH with the correct API key succeeds (200)', async () => {
    const created = await api(h.base, '/api/incidents', jsonInit('POST', {}));
    const id = created.body.data.id as string;
    const { status, body } = await api(
      h.base,
      `/api/incidents/${id}`,
      jsonInit('PATCH', { status: 'DISPATCHED' }, { 'x-dispatch-api-key': DISPATCH_KEY })
    );
    assert.equal(status, 200);
    assert.equal(body.data.status, 'DISPATCHED');
  });

  test('DB connection test without key never dials out (401)', async () => {
    const { status } = await api(
      h.base,
      '/api/database/test-connection',
      jsonInit('POST', { connectionString: 'postgresql://example.invalid/db' })
    );
    assert.equal(status, 401);
  });

  test('outbound SMS and inbound webhook without key are rejected (401)', async () => {
    const send = await api(h.base, '/api/sms/send', jsonInit('POST', { message: 'test' }));
    assert.equal(send.status, 401);
    const webhook = await api(h.base, '/api/sms/webhook', jsonInit('POST', { from: '+250', text: 'ACCIDENT' }));
    assert.equal(webhook.status, 401);
  });

  test('OTP request is refused (503) and never leaks a code', async () => {
    const { status, body } = await api(
      h.base,
      '/api/auth/otp/request',
      jsonInit('POST', { phoneNumber: '+250788000444' })
    );
    assert.equal(status, 503);
    assert.equal(body.success, false);
    assert.equal(body.demoCode, undefined);
    assert.match(body.message, /not integrated/i);
  });

  test('master demo code 123456 is not accepted outside demo mode', async () => {
    const { status } = await api(
      h.base,
      '/api/auth/otp/verify',
      jsonInit('POST', { phoneNumber: '+250788000444', otpCode: '123456' })
    );
    assert.equal(status, 400);
  });
});

// ===========================================================================
// 2b. Authorization fails closed when production has no configured key
// ===========================================================================
describe('production-like mode without DISPATCH_API_KEY fails closed', () => {
  let h: Harness;
  before(async () => {
    delete process.env.DISPATCH_API_KEY;
    h = await startApp({ demoMode: false, requireDispatchAuth: true });
  });
  after(async () => {
    await h.close();
  });

  test('dispatch mutation answers 503 instead of staying open', async () => {
    const { status, body } = await api(
      h.base,
      '/api/incidents/inc-101',
      jsonInit('PATCH', { status: 'ON_SCENE' })
    );
    assert.equal(status, 503);
    assert.match(body.message, /DISPATCH_API_KEY/);
  });
});

// ===========================================================================
// 2c. Labelled local demo stays open (no key required)
// ===========================================================================
describe('local demo (auth not enforced)', () => {
  let h: Harness;
  before(async () => {
    delete process.env.DISPATCH_API_KEY;
    h = await startApp({ requireDispatchAuth: false });
  });
  after(async () => {
    await h.close();
  });

  test('dispatch mutation works without a key in the labelled demo', async () => {
    const created = await api(h.base, '/api/incidents', jsonInit('POST', {}));
    const id = created.body.data.id as string;
    const { status } = await api(h.base, `/api/incidents/${id}`, jsonInit('PATCH', { status: 'DISPATCHED' }));
    assert.equal(status, 200);
  });
});

// ===========================================================================
// 5. Rate limiting & security headers (dependency-free per-IP limiter)
// ===========================================================================
describe('rate limiting & security headers', () => {
  let h: Harness;
  before(async () => {
    h = await startApp({ otpRateLimit: 3, aiRateLimit: 2 });
  });
  after(async () => {
    await h.close();
  });

  test('OTP request endpoint answers 429 with Retry-After past its budget', async () => {
    for (let i = 0; i < 3; i += 1) {
      const ok = await api(h.base, '/api/auth/otp/request', jsonInit('POST', { phoneNumber: '+250788000111' }));
      assert.equal(ok.status, 200, `request ${i + 1} should pass`);
    }
    const limited = await api(h.base, '/api/auth/otp/request', jsonInit('POST', { phoneNumber: '+250788000111' }));
    assert.equal(limited.status, 429);
    assert.equal(limited.body.success, false);
    assert.match(limited.body.message, /Too many requests/);
  });

  test('AI assistant endpoint is rate limited independently', async () => {
    const first = await api(h.base, '/api/ai/assistant', jsonInit('POST', { message: 'hello' }));
    assert.equal(first.status, 200);
    const second = await api(h.base, '/api/ai/assistant', jsonInit('POST', { message: 'hello again' }));
    assert.equal(second.status, 200);
    const limited = await api(h.base, '/api/ai/assistant', jsonInit('POST', { message: 'one too many' }));
    assert.equal(limited.status, 429);
  });

  test('security headers ride on every API response', async () => {
    const res = await fetch(`${h.base}/api/health`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'DENY');
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
  });
});
