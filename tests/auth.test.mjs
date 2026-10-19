import assert from "node:assert/strict";
import test from "node:test";
import { sessionSecretConfigured } from "../src/lib/auth.ts";

test("requires SESSION_SECRET before issuing a CRM session", () => {
  const previous = process.env.SESSION_SECRET;

  try {
    delete process.env.SESSION_SECRET;
    assert.equal(sessionSecretConfigured(), false);

    process.env.SESSION_SECRET = "test-session-secret";
    assert.equal(sessionSecretConfigured(), true);
  } finally {
    if (previous === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previous;
  }
});
