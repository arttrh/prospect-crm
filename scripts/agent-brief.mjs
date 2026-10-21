const paths = process.argv.slice(2);

if (paths.length === 0) process.exit(2);

const serverLibraries = new Set([
  "src/lib/api.ts",
  "src/lib/apify.ts",
  "src/lib/auth.ts",
  "src/lib/db.ts",
  "src/lib/diego-engine.ts",
  "src/lib/site-template.ts",
]);

function classify(path) {
  if (
    /^src\/app\/(?:.*\/)?route\.ts$/.test(path) ||
    serverLibraries.has(path) ||
    /^(oracle|supabase)\//.test(path)
  )
    return "backend";
  if (/^src\/components\//.test(path) || /^src\/app\/.*\.(tsx|css)$/.test(path)) return "ui";
  if (/^tests\//.test(path) || path === "playwright.config.ts" || /^\.github\/workflows\//.test(path))
    return "qa";
  if (
    path === "AGENTS.md" ||
    /^docs\//.test(path) ||
    path === "scripts/agent-brief.mjs" ||
    path === "miniagents.md"
  )
    return "controller";
  return "shared";
}

const areas = [...new Set(paths.map(classify))];
const checks = ["npm run lint", "npx tsc --noEmit"];

if (areas.includes("backend"))
  checks.push("node --test tests/auth.test.mjs tests/leads.test.mjs tests/login.test.mjs");
if (areas.includes("ui")) checks.push("npx playwright test");

console.log(JSON.stringify({ areas, crossArea: areas.length > 1, checks }));
