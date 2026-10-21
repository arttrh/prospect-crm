import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const run = (...paths) =>
  spawnSync(process.execPath, ["scripts/agent-brief.mjs", ...paths], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

const expected = (areas, checks = ["npm run lint", "npx tsc --noEmit"]) => ({
  areas,
  crossArea: areas.length > 1,
  checks,
});

test("classifies backend routes and server-only libraries", () => {
  for (const path of [
    "src/app/route.ts",
    "src/app/api/leads/route.ts",
    "src/lib/api.ts",
    "src/lib/apify.ts",
    "src/lib/auth.ts",
    "src/lib/db.ts",
    "src/lib/diego-engine.ts",
    "src/lib/site-template.ts",
    "oracle/schema.sql",
    "supabase/functions/import.ts",
    "tests/auth.test.mjs",
    "tests/leads.test.mjs",
    "tests/login.test.mjs",
    "tests/template-engine.test.ts",
  ]) {
    const result = run(path);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      JSON.parse(result.stdout),
      expected(["backend"], [
        "npm run lint",
        "npx tsc --noEmit",
        "npm run test:auth",
        "node --test tests/leads.test.mjs",
        "node --test tests/login.test.mjs",
      ]),
    );
  }
});

test("normalizes relative prefixes without accepting absolute paths", () => {
  const relative = run("./src/app/api/leads/route.ts");
  assert.equal(relative.status, 0, relative.stderr);
  assert.deepEqual(
    JSON.parse(relative.stdout),
    expected(["backend"], [
      "npm run lint",
      "npx tsc --noEmit",
      "npm run test:auth",
      "node --test tests/leads.test.mjs",
      "node --test tests/login.test.mjs",
    ]),
  );

  const absolute = run(`${process.cwd()}/src/app/api/leads/route.ts`);
  assert.equal(absolute.status, 0, absolute.stderr);
  assert.deepEqual(JSON.parse(absolute.stdout), expected(["shared"]));
});

test("classifies UI files", () => {
  for (const path of [
    "src/components/crm-app.tsx",
    "src/app/page.tsx",
    "src/app/globals.css",
    "tests/crm.spec.ts",
    "tests/site-preview.spec.ts",
  ]) {
    const result = run(path);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      JSON.parse(result.stdout),
      expected(["ui"], ["npm run lint", "npx tsc --noEmit", "npx playwright test"]),
    );
  }
});

test("classifies QA files", () => {
  for (const path of ["playwright.config.ts", ".github/workflows/tests.yml"]) {
    const result = run(path);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), expected(["qa"]));
  }
});

test("classifies controller files", () => {
  for (const path of [
    "AGENTS.md",
    "docs/STATE.md",
    "scripts/agent-brief.mjs",
    "tests/agent-brief.test.mjs",
    "miniagents.md",
  ]) {
    const result = run(path);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), expected(["controller"]));
  }
});

test("classifies shared paths as shared", () => {
  for (const path of [
    "src/lib/contact.ts",
    "src/lib/demo-data.ts",
    "src/lib/types.ts",
    "package.json",
  ]) {
    const result = run(path);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), expected(["shared"]));
  }
});

test("classifies an unknown path as shared", () => {
  const result = run("unknown/file.txt");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), expected(["shared"]));
});

test("marks a backend and UI list as cross-area", () => {
  const result = run("src/app/api/leads/route.ts", "src/components/crm-app.tsx");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    JSON.parse(result.stdout),
    expected(["backend", "ui"], [
      "npm run lint",
      "npx tsc --noEmit",
      "npm run test:auth",
      "node --test tests/leads.test.mjs",
      "node --test tests/login.test.mjs",
      "npx playwright test",
    ]),
  );
});

test("exits with code 2 when no paths are provided", () => {
  const result = run();
  assert.equal(result.status, 2);
});

test("runs agent-brief before the rest of npm test", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  assert.match(packageJson.scripts.test, /^npm run test:agent-brief && /);
});
