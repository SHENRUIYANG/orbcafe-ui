#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const result = spawnSync('./node_modules/.bin/tsc', ['--noEmit', '--pretty', 'false'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 1024 * 1024 * 32,
});
const diagnostics = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

const filesFor = (name) => {
  const files = new Set();
  const pattern = new RegExp(`^(src\\/[^\\n(]+)\\([^\\n]+Cannot find name '${name}'`, 'gm');
  let match;
  while ((match = pattern.exec(diagnostics))) files.add(match[1]);
  return files;
};

const alphaFiles = filesFor('alpha');
const modeFiles = filesFor('mode');

for (const file of new Set([...alphaFiles, ...modeFiles])) {
  let source = readFileSync(file, 'utf8');

  if (alphaFiles.has(file) && source.includes('orbAlpha')) {
    source = source.replace(/\balpha\s*\(/g, 'orbAlpha(');
  }

  if (modeFiles.has(file)) {
    source = source.replace(/\bmode\b/g, 'getOrbCompatMode()');
    source = source.replace(/import \{ useOrbMode, orbAlpha \}/g, 'import { orbAlpha }');
    source = source.replace(/import \{ useOrbMode \}/g, '');
  }

  writeFileSync(file, source);
}

console.log(`Normalized ${modeFiles.size} mode files and ${alphaFiles.size} alpha files.`);
