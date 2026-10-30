// Copy guard: fails when user-facing files promise outcomes the Prep Score can't back up.
// Run with `npm run lint:copy` (also runs before every build). For a legitimate code use,
// put `copy-guard-ignore` in a comment on the same line.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOTS = ['src', 'public', 'index.html'];
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx', '.html', '.json', '.md', '.txt', '.css']);
const BANNED = ['job-ready', 'job ready', 'get hired', 'guaranteed', 'crack the interview', '% ready'];

const files = (path) => (statSync(path).isDirectory() ? readdirSync(path).flatMap((name) => files(join(path, name))) : [path]);

const problems = [];
for (const file of ROOTS.flatMap(files).filter((f) => EXTENSIONS.has(extname(f)))) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.includes('copy-guard-ignore')) return;
    const lower = line.toLowerCase();
    for (const phrase of BANNED) if (lower.includes(phrase)) problems.push(`${file}:${i + 1}: "${phrase}"`);
  });
}

if (problems.length) {
  console.error(`Copy guard: banned phrases found (the Prep Score measures preparation, not outcomes):\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('Copy guard: no banned phrases.');
