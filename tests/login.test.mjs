import assert from "node:assert/strict";
import test from "node:test";
import { startNextTestServer } from "./helpers/next-test-server.mjs";

const port = 44000 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;

test("limita falhas de login e rejeita JSON malformado", { timeout: 120_000 }, async () => {
  const server = await startNextTestServer({ port, env: { CRM_ACCESS_PASSWORD: "synthetic-test-password", SESSION_SECRET: "test-session-secret" } });

  try {
    const ip = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    for (let i = 0; i < 5; i++) {
      const response = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify({ password: "wrong" }) });
      assert.equal(response.status, 401);
    }
    const limited = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify({ password: "wrong" }) });
    assert.equal(limited.status, 429);
    assert.equal((await limited.json()).error, "Muitas tentativas. Tente novamente mais tarde.");
    const malformed = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: "{" });
    assert.equal(malformed.status, 400);
    assert.deepEqual(await malformed.json(), { error: "Requisição inválida." });
  } finally {
    await server.stop();
  }
});
