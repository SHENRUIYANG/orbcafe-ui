#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';

const result = spawnSync('./node_modules/.bin/tsc', ['--noEmit', '--pretty', 'false'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 32,
});

const diagnostics = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
const missingByFile = new Map();
const pattern = /^(src\/[^(]+)\([^\n]+Cannot find name '([^']+)'/gm;
const excluded = new Set(['mode', 'alpha']);
let match;

while ((match = pattern.exec(diagnostics))) {
  const [, file, name] = match;
  if (excluded.has(name)) continue;
  if (!missingByFile.has(file)) missingByFile.set(file, new Set());
  missingByFile.get(file).add(name);
}

for (const [file, names] of missingByFile) {
  const absoluteFile = `${process.cwd()}/${file}`;
  let source = readFileSync(absoluteFile, 'utf8');
  const modulePathRaw = relative(dirname(absoluteFile), `${process.cwd()}/src/lib/orbis-compat`).replaceAll('\\', '/');
  const modulePath = modulePathRaw.startsWith('.') ? modulePathRaw : `./${modulePathRaw}`;
  const importLine = `import { ${[...names].sort().join(', ')} } from '${modulePath}';\n`;

  const directive = source.match(/^(['\"]use client['\"];?\s*)/);
  const insertAt = directive ? directive[0].length : 0;
  source = `${source.slice(0, insertAt)}${importLine}${source.slice(insertAt)}`;
  writeFileSync(absoluteFile, source);
}

console.log(`Updated ${missingByFile.size} files with ORBIS compatibility imports.`);
