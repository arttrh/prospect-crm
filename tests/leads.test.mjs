import assert from "node:assert/strict";
import test from "node:test";
import { startNextTestServer } from "./helpers/next-test-server.mjs";

const port = 43000 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;

test("PATCH /api/leads exige autenticação e rejeita campos inválidos", { timeout: 120_000 }, async () => {
  const server = await startNextTestServer({ port, env: { CRM_ACCESS_PASSWORD: "test-password", SESSION_SECRET: "test-session-secret" } });

  try {

    const unauthorized = await fetch(`${baseUrl}/api/leads`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: "demo-1", status: "REPLIED" }),
    });
    assert.equal(unauthorized.status, 401);
    assert.equal((await fetch(`${baseUrl}/api/leads`)).status, 401);

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: "test-password" }),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie")?.split(";")[0];
    assert.ok(cookie);

    assert.equal((await fetch(`${baseUrl}/api/auth/session`, { headers: { cookie } })).status, 200);

    async function patch(body) {
      return fetch(`${baseUrl}/api/leads`, {
        method: "PATCH", headers: { "content-type": "application/json", cookie }, body: JSON.stringify(body),
      });
    }

    async function rawPatch(body) {
      return fetch(`${baseUrl}/api/leads`, {
        method: "PATCH", headers: { "content-type": "application/json", cookie }, body,
      });
    }

    for (const body of ["{", ""]) {
      const response = await rawPatch(body);
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { error: "Dados inválidos" });
    }

    const missingId = await patch({ status: "REPLIED" });
    assert.equal(missingId.status, 400);
    assert.deepEqual(await missingId.json(), { error: "ID obrigatório" });
    const missingLead = await patch({ id: "missing-lead", status: "REPLIED" });
    assert.equal(missingLead.status, 500);
    assert.deepEqual(await missingLead.json(), { error: "Erro interno. Tente novamente mais tarde." });

    assert.equal((await patch({ id: "demo-1", status: "NOT_A_STATUS" })).status, 400);
    assert.equal((await patch({ id: "demo-1", preferredChannel: "SMS" })).status, 400);
    assert.equal((await patch({ id: "demo-1", nextFollowUpAt: "not-a-date" })).status, 400);
    assert.equal((await patch({ id: "demo-1", lastContactAt: "not-a-date" })).status, 400);
    for (const value of ["2026-10-19T12:00:00", "2026-02-30T12:00:00Z", "2026-10-19", "October 19, 2026"]) {
      assert.equal((await patch({ id: "demo-1", nextFollowUpAt: value })).status, 400, value);
    }
    assert.equal((await patch({ id: "demo-1", nextFollowUpAt: "2026-10-19T12:00:00+03:00" })).status, 200);

    const valid = await patch({
      id: "demo-1", status: "REPLIED", preferredChannel: "EMAIL", nextFollowUpAt: "2026-10-19T12:00:00.000Z", lastContactAt: null,
    });
    assert.equal(valid.status, 200);
    const { lead } = await valid.json();
    assert.equal(lead.status, "REPLIED");
    assert.equal(lead.preferredChannel, "EMAIL");
    assert.equal(lead.nextFollowUpAt, "2026-10-19T12:00:00.000Z");
    assert.equal(lead.lastContactAt, null);

    const protectedJsonRoutes = ["/api/ai/message", "/api/import/apify", "/api/sites/generate"];
    for (const path of protectedJsonRoutes) {
      for (const body of ["{", ""]) {
        const response = await fetch(`${baseUrl}${path}`, {
          method: "POST", headers: { "content-type": "application/json", cookie }, body,
        });
        assert.equal(response.status, 400, `${path} body=${JSON.stringify(body)}`);
        assert.deepEqual(await response.json(), { error: "Dados inválidos" });
      }
    }

    const logout = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST", headers: { cookie } });
    assert.equal(logout.status, 200);
    const expiredCookie = logout.headers.get("set-cookie")?.split(";")[0];
    assert.ok(expiredCookie);
    assert.equal((await fetch(`${baseUrl}/api/auth/session`, { headers: { cookie: expiredCookie } })).status, 401);
  } finally {
    await server.stop();
  }
});
