import { cp, mkdir, readFile, writeFile, symlink, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const source = resolve(root, 'vendor/diego-astro');
const stage = resolve(root, '.template-build/diego');
await mkdir(stage, { recursive: true });
try { await access(resolve(source, 'node_modules/astro')); }
catch {
  const installation = spawnSync('npm', ['ci', '--prefix', source, '--ignore-scripts', '--no-audit', '--no-fund'], { stdio: 'inherit' });
  if (installation.status !== 0) throw new Error('Could not install original Astro engine');
}
for (const name of ['src', 'public', 'package.json', 'tsconfig.json']) {
  await cp(resolve(source, name), resolve(stage, name), { recursive: true });
}
try { await symlink(resolve(source, 'node_modules'), resolve(stage, 'node_modules'), 'dir'); }
catch (error) { if (error.code !== 'EEXIST') throw error; }
await cp(resolve(stage, 'src/config/site.ts'), resolve(stage, 'src/config/site-base.ts'));
await cp(resolve(root, 'scripts/template-config.ts'), resolve(stage, 'src/config/site.ts'));
await cp(resolve(source, 'astro.config.mjs'), resolve(stage, 'astro.config.mjs'));
const build = spawnSync(process.execPath, [resolve(source, 'node_modules/astro/astro.js'), 'build', '--root', stage], { cwd: stage, stdio: 'inherit' });
if (build.status !== 0) throw new Error('Original Astro engine build failed');
let html = await readFile(resolve(stage, 'dist/index.html'), 'utf8');
html = html.replaceAll('/_astro/', '/_diego/_astro/').replaceAll('/fonts/', '/_diego/fonts/');
await mkdir(resolve(root, '.generated'), { recursive: true });
await writeFile(resolve(root, '.generated/diego-template.html'), html);
await cp(resolve(stage, 'dist/_astro'), resolve(root, 'public/_diego/_astro'), { recursive: true });
await cp(resolve(source, 'public/fonts'), resolve(root, 'public/_diego/fonts'), { recursive: true });
const provenance = JSON.parse(await readFile(resolve(source, 'PROVENANCE.json'), 'utf8'));
for (const file of provenance.protectedFiles) {
  const bytes = await readFile(resolve(source, file.path));
  const digest = createHash('sha1').update('blob ' + bytes.length).update(Buffer.from([0])).update(bytes).digest('hex');
  if (digest !== file.sha) throw new Error('Upstream source modified: ' + file.path);
  const staged = await readFile(resolve(stage, file.path));
  if (!bytes.equals(staged)) throw new Error('Build changed protected source: ' + file.path);
}
console.log('Original Diego Astro engine built and verified (' + provenance.protectedFiles.length + ' protected source files).');
