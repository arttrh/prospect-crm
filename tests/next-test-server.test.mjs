import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { startNextTestServer } from "./helpers/next-test-server.mjs";

const fixture = fileURLToPath(new URL("./fixtures/test-server.mjs", import.meta.url));

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForHttp(port) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Servidor externo não iniciou");
}

test("inicia o processo próprio, espera readiness e encerra uma vez", async () => {
  const port = await freePort();
  const server = await startNextTestServer({ port, command: process.execPath, args: [fixture], env: { TEST_SERVER_MODE: "ready" } });
  assert.equal(server.baseUrl, `http://127.0.0.1:${port}`);
  await server.stop();
  await server.stop();
});

test("falha por timeout e encerra somente o processo que iniciou", async () => {
  const port = await freePort();
  await assert.rejects(
    startNextTestServer({ port, timeoutMs: 100, command: process.execPath, args: [fixture], env: { TEST_SERVER_MODE: "hang" } }),
    /não iniciou/i,
  );
});

test("porta ocupada não sinaliza o processo externo", async () => {
  const port = await freePort();
  const external = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [fixture], {
      env: { ...process.env, PORT: String(port), TEST_SERVER_MODE: "ready" }, stdio: "ignore",
    });
    child.once("error", reject);
    child.once("spawn", () => resolve(child));
  });
  await waitForHttp(port);
  try {
    let started;
    let error;
    try {
      started = await startNextTestServer({ port, timeoutMs: 100, command: process.execPath, args: [fixture], env: { TEST_SERVER_MODE: "ready" } });
    } catch (caught) { error = caught; }
    await started?.stop();
    assert.match(error?.message || "", /porta.*uso/i);
    assert.equal(external.exitCode, null);
  } finally {
    if (external.exitCode === null) {
      external.kill("SIGTERM");
      await once(external, "exit");
    }
  }
});
