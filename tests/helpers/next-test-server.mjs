import { spawn } from "node:child_process";
import net from "node:net";

const OUTPUT_LIMIT = 4_000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function appendOutput(current, chunk) {
  return (current + chunk).slice(-OUTPUT_LIMIT);
}

function assertPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const reservation = net.createServer();
    reservation.once("error", () => reject(new Error(`Porta de teste ${port} já está em uso`)));
    reservation.listen(port, "127.0.0.1", () => reservation.close((error) => error ? reject(error) : resolve()));
  });
}

async function waitForExit(child, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (child.exitCode === null && Date.now() < deadline) await delay(25);
}

function signalOwnProcess(child, signal) {
  if (child.exitCode !== null) return;
  try {
    if (process.platform === "win32") child.kill(signal);
    else process.kill(-child.pid, signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

export async function startNextTestServer({ port, env = {}, timeoutMs = 30_000, command = process.execPath, args } = {}) {
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error("Porta de teste inválida");
  await assertPortAvailable(port);
  const child = spawn(command, args || ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: process.cwd(),
    detached: process.platform !== "win32",
    env: { ...process.env, ...env, PORT: String(port), NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => { output = appendOutput(output, chunk.toString()); });
  child.stderr.on("data", (chunk) => { output = appendOutput(output, chunk.toString()); });
  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    signalOwnProcess(child, "SIGTERM");
    await waitForExit(child, 2_000);
    if (child.exitCode === null) {
      signalOwnProcess(child, "SIGKILL");
      await waitForExit(child, 2_000);
    }
  };

  const deadline = Date.now() + timeoutMs;
  try {
    while (Date.now() < deadline) {
      if (child.exitCode !== null) break;
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/auth/session`, { signal: AbortSignal.timeout(500) });
        if (response.status > 0) return { baseUrl: `http://127.0.0.1:${port}`, stop };
      } catch {}
      await delay(100);
    }
    throw new Error(`Servidor Next não iniciou em ${timeoutMs}ms. Saída:\n${output || "(sem saída)"}`);
  } catch (error) {
    await stop();
    throw error;
  }
}
