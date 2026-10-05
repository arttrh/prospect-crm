import { createInterface } from 'node:readline';
import assert from 'node:assert/strict';

// Read the existing CRM password from stdin, never from source files or logs.
const input = createInterface({ input: process.stdin });
const password = await new Promise(resolve => input.once('line', value => { input.close(); resolve(value); }));
const origin = 'https://prospect-crm-gilt.vercel.app';
const login = await fetch(origin + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }), signal: AbortSignal.timeout(30000) });
assert.equal(login.status, 200, 'CRM authentication failed');
const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
assert.ok(cookie, 'No session returned');
const response = await fetch(origin + '/api/leads', { headers: { cookie }, signal: AbortSignal.timeout(30000) });
assert.equal(response.status, 200);
const { leads } = await response.json();
const matches = leads.filter(lead => lead.name === 'Oguro Odontologia - Dentista');
assert.equal(matches.length, 1, 'Expected exactly one Oguro lead');
const lead = matches[0];
const generated = await fetch(origin + '/api/sites/generate', { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ leadId: lead.id }), signal: AbortSignal.timeout(60000) });
const result = await generated.json();
assert.equal(generated.status, 200, result.error || 'Generation failed');
assert.equal(result.draft.templateId, 'diego-astro-original-4b967ad');
assert.match(result.provider, /flash/);
const preview = await fetch(result.draft.previewUrl, { signal: AbortSignal.timeout(30000) });
assert.equal(preview.status, 200);
const html = await preview.text();
assert.ok(html.includes('diego-astro-original-4b967ad'));
assert.ok(html.includes(lead.name));
assert.ok(!/Sheila|OAB\/SC|__CRM_/.test(html));
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
for (const script of scripts) {
  const asset = await fetch(new URL(script, origin), { signal: AbortSignal.timeout(30000) });
  assert.equal(asset.status, 200, 'Template script failed to load');
}
console.log(JSON.stringify({ success: true, provider: result.provider, engine: result.draft.templateId, previewUrl: result.draft.previewUrl, scriptsVerified: scripts.length }));
