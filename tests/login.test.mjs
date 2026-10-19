import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

const port = 44000 + Math.floor(Math.random() * 1000);
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForServer(process) {
  let output = "";
  process.stderr.on("data", (chunk) => { output += chunk; });
  process.stdout.on("data", (chunk) => { output += chunk; });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/session`);
      if (response.status === 401) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Servidor Next não iniciou:\n${output}`);
}

test("limita falhas de login e rejeita JSON malformado", { timeout: 120_000 }, async () => {
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    env: { ...process.env, CRM_ACCESS_PASSWORD: "synthetic-test-password", SESSION_SECRET: "test-session-secret", NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(server);
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
    server.kill();
    await new Promise((resolve) => server.once("exit", resolve));
  }
});
