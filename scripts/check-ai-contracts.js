const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

const requiredFiles = [
  'src/index.ts',
  'README.md',
  'skills/orbcafe-kanban-detail/SKILL.md',
  'skills/orbcafe-kanban-detail/references/recipes.md',
  'skills/orbcafe-kanban-detail/references/guardrails.md',
  'skills/orbcafe-ui-component-usage/SKILL.md',
  'skills/orbcafe-ui-component-usage/references/module-contracts.md',
  'skills/orbcafe-ui-component-usage/references/module-contracts.json',
  'skills/orbcafe-ui-component-usage/references/public-export-index.md',
  'skills/orbcafe-ui-component-usage/references/skill-routing-map.md'
];

const expectedModules = [
  'StdReport',
  'GraphDetailAgent',
  'LayoutNavigation',
  'PivotAINav',
  'Kanban',
  'AgentUI'
];

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function resolveLocalModule(fromFile, specifier) {
  const basePath = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }

  return null;
}

function collectExports(entryFile, visited = new Set()) {
  const resolvedFile = path.resolve(entryFile);
  if (visited.has(resolvedFile)) return new Set();
  visited.add(resolvedFile);

  const source = fs.readFileSync(resolvedFile, 'utf8');
  const exports = new Set();

  const directPatterns = [
    /export\s+(?:const|function|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g,
    /export\s*\{\s*([^}]+)\s*\}(?!\s*from)/g
  ];

  for (const pattern of directPatterns) {
    let match;
    while ((match = pattern.exec(source))) {
      const payload = match[1];
      for (const rawPart of payload.split(',')) {
        const part = rawPart.trim();
        if (!part) continue;
        const aliasMatch = part.match(/(?:type\s+)?([A-Za-z0-9_]+)(?:\s+as\s+([A-Za-z0-9_]+))?/);
        const exportName = aliasMatch ? aliasMatch[2] || aliasMatch[1] : part;
        if (exportName) exports.add(exportName);
      }
    }
  }

  const reExportPatterns = [
    /export\s+\*\s+from\s+['"](.+?)['"]/g,
    /export\s+(?:type\s+)?\{\s*([^}]+)\s*\}\s+from\s+['"](.+?)['"]/g
  ];

  let match;
  while ((match = reExportPatterns[0].exec(source))) {
    const target = resolveLocalModule(resolvedFile, match[1]);
    if (!target) continue;
    for (const name of collectExports(target, visited)) exports.add(name);
  }

  while ((match = reExportPatterns[1].exec(source))) {
    const names = match[1];
    for (const rawPart of names.split(',')) {
      const part = rawPart.trim();
      if (!part) continue;
      const aliasMatch = part.match(/(?:type\s+)?([A-Za-z0-9_]+)(?:\s+as\s+([A-Za-z0-9_]+))?/);
      const exportName = aliasMatch ? aliasMatch[2] || aliasMatch[1] : part;
      if (exportName) exports.add(exportName);
    }

    const target = resolveLocalModule(resolvedFile, match[2]);
    if (!target) continue;
    for (const name of collectExports(target, visited)) exports.add(name);
  }

  return exports;
}

function main() {
  for (const relativePath of requiredFiles) {
    assert(fileExists(relativePath), `Missing required file: ${relativePath}`);
  }

  const rootReadme = readFile('README.md');
  assert(
    rootReadme.includes('skills/orbcafe-ui-component-usage/references/module-contracts.md'),
    'README.md must reference module-contracts.md'
  );
  assert(
    rootReadme.includes('Hook-first') && rootReadme.includes('Component-first'),
    'README.md must explain Hook-first and Component-first'
  );

  const contracts = JSON.parse(readFile('skills/orbcafe-ui-component-usage/references/module-contracts.json'));
  assert(Array.isArray(contracts.modules), 'module-contracts.json must include a modules array');
  assert(Array.isArray(contracts.shared_rules), 'module-contracts.json must include shared_rules');

  const moduleNames = contracts.modules.map((module) => module.name);
  assert(
    moduleNames.length === new Set(moduleNames).size,
    'module-contracts.json contains duplicate module names'
  );
  assert(
    expectedModules.every((moduleName) => moduleNames.includes(moduleName)),
    'module-contracts.json is missing one or more expected modules'
  );

  const rootExports = collectExports(path.join(repoRoot, 'src/index.ts'));

  for (const moduleContract of contracts.modules) {
    assert(
      ['hook-first', 'component-first', 'mixed'].includes(moduleContract.mode),
      `Invalid mode for module ${moduleContract.name}: ${moduleContract.mode}`
    );
    assert(
      Array.isArray(moduleContract.public_entries) && moduleContract.public_entries.length > 0,
      `Module ${moduleContract.name} must declare public_entries`
    );
    assert(
      Array.isArray(moduleContract.canonical_examples) && moduleContract.canonical_examples.length > 0,
      `Module ${moduleContract.name} must declare canonical_examples`
    );

    for (const examplePath of moduleContract.canonical_examples) {
      assert(fileExists(examplePath), `Canonical example missing for ${moduleContract.name}: ${examplePath}`);
    }

    for (const exportName of moduleContract.public_entries) {
      assert(rootExports.has(exportName), `Public entry "${exportName}" for ${moduleContract.name} is not exported from src/index.ts`);
    }

    const publicHooks = Array.isArray(moduleContract.public_hooks) ? moduleContract.public_hooks : [];
    for (const hookName of publicHooks) {
      assert(rootExports.has(hookName), `Public hook "${hookName}" for ${moduleContract.name} is not exported from src/index.ts`);
    }

    if (moduleContract.mode === 'hook-first') {
      assert(publicHooks.length > 0, `Hook-first module ${moduleContract.name} must expose at least one public hook`);
    }

    if (moduleContract.mode === 'component-first') {
      assert(publicHooks.length === 0, `Component-first module ${moduleContract.name} should not expose public_hooks in module-contracts.json`);
    }
  }

  const routingMap = readFile('skills/orbcafe-ui-component-usage/references/skill-routing-map.md');
  assert(routingMap.includes('orbcafe-agentui-chat'), 'skill-routing-map.md must route AgentUI requests');
  assert(routingMap.includes('orbcafe-kanban-detail'), 'skill-routing-map.md must route Kanban requests');

  const publicExportIndex = readFile('skills/orbcafe-ui-component-usage/references/public-export-index.md');
  assert(publicExportIndex.includes('AgentUI/*'), 'public-export-index.md must list AgentUI exports');
  assert(publicExportIndex.includes('Kanban/*'), 'public-export-index.md must list Kanban exports');

  console.log('ai_contracts_ok');
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
