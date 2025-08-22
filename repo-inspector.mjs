// repo-inspector.mjs
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const exists = p => fs.existsSync(path.join(ROOT, p));
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const report = [];
const push = s => report.push(s);

push('# BLR WORLD HUB — Repo Snapshot\n');

const files = [
  'package.json','.firebaserc','firebase.json','firestore.rules','firestore.indexes.json',
  'storage.rules','functions/package.json','functions/index.js','functions/src/index.ts',
  'src/main.tsx','src/main.jsx','src/App.tsx','src/App.vue','next.config.js','vite.config.ts','vite.config.js'
];

files.forEach(f => push(`- ${f}: ${exists(f) ? 'FOUND' : 'missing'}`));

if (exists('package.json')) {
  const pkg = readJson('package.json');
  push('\n## package.json');
  push('```json'); push(JSON.stringify({name: pkg.name, deps: pkg.dependencies, devDeps: pkg.devDependencies}, null, 2)); push('```');
}
if (exists('functions/package.json')) {
  const fpkg = readJson('functions/package.json');
  push('\n## functions/package.json');
  push('```json'); push(JSON.stringify({engines: fpkg.engines, deps: fpkg.dependencies}, null, 2)); push('```');
}
if (exists('firebase.json')) {
  const fjson = readJson('firebase.json');
  push('\n## firebase.json');
  push('```json'); push(JSON.stringify(fjson, null, 2)); push('```');
}
fs.writeFileSync('repo_report.md', report.join('\n'), 'utf8');
console.log('Wrote repo_report.md');
