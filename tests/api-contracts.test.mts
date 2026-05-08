/**
 * API contract tests for Feel Better Club.
 *
 * These tests hit the running Next.js dev/prod server at BASE_URL.
 * Start the server first: npm run dev (or npm start)
 *
 * Run only these: npx vitest run tests/api-contracts.test.mts
 */
import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

/**
 * Check if the server is reachable before running tests.
 * If not, skip the entire suite gracefully.
 */
let serverAvailable = false;

beforeAll(async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/upcoming`, {
      signal: AbortSignal.timeout(3000),
    });
    serverAvailable = res.ok || res.status < 500;
  } catch {
    serverAvailable = false;
  }
});

// ---------------------------------------------------------------------------
// GET /api/schedules?date=YYYY-MM-DD
// ---------------------------------------------------------------------------

describe("GET /api/schedules", () => {
  it("returns an array for a valid date", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(`${BASE_URL}/api/schedules?date=${today}`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it("returns 400 when date param is missing", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/schedules`);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});

// ---------------------------------------------------------------------------
// GET /api/upcoming
// ---------------------------------------------------------------------------

describe("GET /api/upcoming", () => {
  it("returns an array with max 3 items", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/upcoming`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeLessThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// GET /api/schedules/next?className=X
// ---------------------------------------------------------------------------

describe("GET /api/schedules/next", () => {
  it("returns { date } or { date: null } for a class name", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(
      `${BASE_URL}/api/schedules/next?className=Mobility`,
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("date");
    // date is either a string like "2026-05-10" or null
    if (body.date !== null) {
      expect(typeof body.date).toBe("string");
      expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("returns 400 when className param is missing", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/schedules/next`);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});

// ---------------------------------------------------------------------------
// POST /api/contact
// ---------------------------------------------------------------------------

describe("POST /api/contact", () => {
  it("returns 201 with valid body", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test-vitest@example.com",
        message: "This is a test from the test suite",
      }),
    });
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body).toHaveProperty("success", true);
  });

  it("returns 400 when name is missing", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        message: "No name provided",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "not-an-email",
        message: "Invalid email test",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is too short", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        message: "Hi",
      }),
    });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/requests
// ---------------------------------------------------------------------------

describe("POST /api/requests", () => {
  it("returns 201 with valid body", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test-vitest@example.com",
        phone: "+34 600 000 000",
        groupSize: "3",
        preferredDate: "Weekday mornings",
        notes: "Automated test",
      }),
    });
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body).toHaveProperty("success", true);
  });

  it("returns 400 when name is missing", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async (ctx) => {
    if (!serverAvailable) ctx.skip();

    const res = await fetch(`${BASE_URL}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "bad-email",
      }),
    });
    expect(res.status).toBe(400);
  });
});
