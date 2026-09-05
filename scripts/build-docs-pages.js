const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const docs = path.join(root, "docs");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function write(rel, content) {
  const file = path.join(root, rel);
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content.replace(/\r\n/g, "\n"));
}

function copy(rel, targetRel, transform = (text) => text) {
  write(targetRel, transform(read(rel)));
}

function titleFromComponentSource(source) {
  const parts = source.split("/");
  if (parts[0] === "src" && parts[1] === "components") {
    const moduleName = parts[2];
    if (parts[3] === "README.md") return moduleName;
    if (parts[3] === "Hooks") return `${moduleName} Hooks`;
    if (parts[3] === "Components") return `${moduleName} Components`;
    if (parts[3] === "Utils") return `${moduleName} Utils`;
    return `${moduleName} ${path.basename(parts[3], ".md")}`;
  }
  if (source === "src/lib/transitions/README.md") return "Transitions";
  return path.basename(source, ".md");
}

function componentTarget(source) {
  const title = titleFromComponentSource(source);
  return `docs/components/${title.replace(/\s+/g, "-")}.md`;
}

function addPublishedHeader(source, title, content) {
  return [
    `# ${title}`,
    "",
    `Published copy of \`${source}\`.`,
    "",
    "---",
    "",
    content.replace(/^# .+\n+/, ""),
  ].join("\n");
}

const componentSources = [
  "src/components/Atoms/README.md",
  "src/components/Molecules/README.md",
  "src/components/StdReport/README.md",
  "src/components/StdReport/Hooks/README.md",
  "src/components/StdReport/stdreport.md",
  "src/components/CardPage/README.md",
  "src/components/Planning/README.md",
  "src/components/Planning/Hooks/README.md",
  "src/components/Pad/README.md",
  "src/components/Pad/Hooks/README.md",
  "src/components/PageLayout/README.md",
  "src/components/PageLayout/Hooks/README.md",
  "src/components/PageLayout/pagelayout.md",
  "src/components/Navigation-Island/README.md",
  "src/components/PivotTable/README.md",
  "src/components/GraphReport/README.md",
  "src/components/GraphReport/Components/README.md",
  "src/components/GraphReport/Hooks/README.md",
  "src/components/GraphReport/graphreport.md",
  "src/components/DetailInfo/README.md",
  "src/components/DetailInfo/Hooks/README.md",
  "src/components/Kanban/README.md",
  "src/components/Kanban/Hooks/README.md",
  "src/components/Kanban/Utils/README.md",
  "src/components/AgentUI/README.md",
  "src/components/Auth/README.md",
  "src/components/Auth/Hooks/README.md",
  "src/components/CustomizeAgent/README.md",
  "src/components/AINav/README.md",
  "src/components/Tree/README.md",
  "src/lib/transitions/README.md",
];

const componentLinkMap = new Map(
  componentSources.map((source) => [source, componentTarget(source).replace(/^docs\//, "")]),
);

function rewriteComponentLinks(source, content) {
  if (source === "src/components/Pad/README.md") {
    return content.replace(/\(\.\/Hooks\/README\.md\)/g, "(Pad-Hooks.md)");
  }
  return content;
}

const skillSources = [
  "skills/orbcafe-ui-component-usage/SKILL.md",
  "skills/orbcafe-ui-component-usage/references/component-glossary-i18n.md",
  "skills/orbcafe-ui-component-usage/references/component-map.md",
  "skills/orbcafe-ui-component-usage/references/ctree.md",
  "skills/orbcafe-ui-component-usage/references/implementation-recipes.md",
  "skills/orbcafe-ui-component-usage/references/integration-baseline.md",
  "skills/orbcafe-ui-component-usage/references/module-contracts.md",
  "skills/orbcafe-ui-component-usage/references/module-contracts.json",
  "skills/orbcafe-ui-component-usage/references/public-api-guardrails.md",
  "skills/orbcafe-ui-component-usage/references/public-export-index.md",
  "skills/orbcafe-ui-component-usage/references/skill-routing-map.md",
  "skills/orbcafe-ui-component-usage/references/value-help.md",
  "skills/orbcafe-stdreport-workflow/README.md",
  "skills/orbcafe-stdreport-workflow/SKILL.md",
  "skills/orbcafe-stdreport-workflow/references/component-selection.md",
  "skills/orbcafe-stdreport-workflow/references/guardrails.md",
  "skills/orbcafe-stdreport-workflow/references/recipes.md",
  "skills/orbcafe-cardpage-workflow/README.md",
  "skills/orbcafe-cardpage-workflow/SKILL.md",
  "skills/orbcafe-cardpage-workflow/references/component-selection.md",
  "skills/orbcafe-cardpage-workflow/references/guardrails.md",
  "skills/orbcafe-cardpage-workflow/references/recipes.md",
  "skills/orbcafe-planning-gantt/README.md",
  "skills/orbcafe-planning-gantt/SKILL.md",
  "skills/orbcafe-planning-gantt/references/guardrails.md",
  "skills/orbcafe-planning-gantt/references/recipes.md",
  "skills/orbcafe-pad-workflow/SKILL.md",
  "skills/orbcafe-pad-workflow/references/guardrails.md",
  "skills/orbcafe-pad-workflow/references/patterns.md",
  "skills/orbcafe-agentui-chat/README.md",
  "skills/orbcafe-agentui-chat/SKILL.md",
  "skills/orbcafe-agentui-chat/references/component-selection.md",
  "skills/orbcafe-agentui-chat/references/guardrails.md",
  "skills/orbcafe-agentui-chat/references/recipes.md",
  "skills/orbcafe-auth-workflow/SKILL.md",
  "skills/orbcafe-auth-workflow/references/guardrails.md",
  "skills/orbcafe-auth-workflow/references/recipes.md",
  "skills/orbcafe-graph-detail-ai/SKILL.md",
  "skills/orbcafe-graph-detail-ai/references/domain-selector.md",
  "skills/orbcafe-graph-detail-ai/references/guardrails.md",
  "skills/orbcafe-graph-detail-ai/references/recipes.md",
  "skills/orbcafe-kanban-detail/SKILL.md",
  "skills/orbcafe-kanban-detail/references/guardrails.md",
  "skills/orbcafe-kanban-detail/references/recipes.md",
  "skills/orbcafe-layout-navigation/SKILL.md",
  "skills/orbcafe-layout-navigation/references/guardrails.md",
  "skills/orbcafe-layout-navigation/references/navigation-island.md",
  "skills/orbcafe-layout-navigation/references/patterns.md",
  "skills/orbcafe-pivot-ainav/SKILL.md",
  "skills/orbcafe-pivot-ainav/references/domain-patterns.md",
  "skills/orbcafe-pivot-ainav/references/guardrails.md",
  "skills/orbcafe-pivot-ainav/references/recipes.md",
  "skills/orbcafe-brand-theme/SKILL.md",
];

ensureDir(docs);

const indexContent = read("README.md")
  .replace(/docs\/images\//g, "images/")
  .replace(/docs\/EXAMPLES\.md/g, "EXAMPLES.md")
  .replace(/docs\/VIBE_CODING\.md/g, "VIBE_CODING.md")
  .replace(/examples\/README\.md/g, "guides/examples-app.md")
  .replace(/MIGRATION_V2\.md/g, "guides/v2-migration.md")
  .replace(/BRAND_THEMING\.md/g, "guides/brand-theming.md")
  .replace(/skills\/orbcafe-ui-component-usage\/references\/module-contracts\.md/g, "skills/orbcafe-ui-component-usage/references/module-contracts.md")
  .replace(/src\/components\/StdReport\/README\.md/g, "components/StdReport.md")
  .replace(/src\/components\/Molecules\/README\.md/g, "components/Molecules.md")
  .replace(/src\/components\/Planning\/README\.md/g, "components/Planning.md")
  .replace(/src\/components\/Pad\/README\.md/g, "components/Pad.md")
  .replace(/src\/components\/AgentUI\/README\.md/g, "components/AgentUI.md")
  .replace(/src\/components\/PageLayout\/README\.md/g, "components/PageLayout.md")
  .replace(/src\/components\/PivotTable\/README\.md/g, "components/PivotTable.md")
  .replace(/src\/components\/DetailInfo\/README\.md/g, "components/DetailInfo.md")
  .replace(/src\/components\/Kanban\/README\.md/g, "components/Kanban.md");

write("docs/index.md", indexContent);

write(
  "docs/_config.yml",
  [
    "title: ORBCAFE UI",
    "description: React and Next.js enterprise UI components, examples, and AI coding skills.",
    "theme: jekyll-theme-minimal",
    "plugins:",
    "  - jekyll-relative-links",
    "relative_links:",
    "  enabled: true",
    "  collections: true",
    "",
  ].join("\n"),
);

copy("CHANGELOG.md", "docs/CHANGELOG.md");
copy("MIGRATION_V2.md", "docs/guides/v2-migration.md");
copy("BRAND_THEMING.md", "docs/guides/brand-theming.md");
copy("examples/README.md", "docs/guides/examples-app.md", (content) =>
  addPublishedHeader("examples/README.md", "Examples App", content),
);

const componentRows = [];
for (const source of componentSources) {
  const title = titleFromComponentSource(source);
  const target = componentTarget(source);
  copy(source, target, (content) => addPublishedHeader(source, title, rewriteComponentLinks(source, content)));
  componentRows.push(`| ${title} | [${path.basename(target)}](${path.basename(target)}) | \`${source}\` |`);
}

write(
  "docs/components/index.md",
  [
    "# Component Documentation",
    "",
    "Published component and hook documentation collected from the source tree.",
    "",
    "| Area | Page | Source |",
    "| --- | --- | --- |",
    ...componentRows,
    "",
  ].join("\n"),
);

for (const source of skillSources) {
  copy(source, `docs/${source}`);
}

const skillGroups = [...new Set(skillSources.map((source) => source.split("/").slice(0, 2).join("/")))];
const skillIndex = ["# ORBCAFE Skills", "", "Published AI-agent skills and reference files.", ""];
for (const group of skillGroups) {
  const name = group.split("/")[1];
  skillIndex.push(`## ${name}`, "");
  const entries = skillSources.filter((source) => source.startsWith(`${group}/`));
  for (const source of entries) {
    const rel = source.replace(/^skills\//, "");
    const label = rel.replace(`${name}/`, "");
    skillIndex.push(`- [${label}](${rel})`);
  }
  skillIndex.push("");
}
write("docs/skills/index.md", skillIndex.join("\n"));

write(
  "docs/guides/index.md",
  [
    "# Guides",
    "",
    "- [Migrate from v1 to v2](v2-migration.md)",
    "- [Brand theming (Open Design → ORBCAFE)](brand-theming.md)",
    "- [Examples app](examples-app.md)",
    "- [Official examples walkthrough](../EXAMPLES.md)",
    "- [Vibe coding with ORBCAFE UI](../VIBE_CODING.md)",
    "",
  ].join("\n"),
);

write(
  "docs/SITE_MAP.md",
  [
    "# ORBCAFE UI Docs Site Map",
    "",
    "- [Home](index.md)",
    "- [Examples walkthrough](EXAMPLES.md)",
    "- [Vibe coding guide](VIBE_CODING.md)",
    "- [Components](components/index.md)",
    "- [Skills](skills/index.md)",
    "- [Guides](guides/index.md)",
    "- [Changelog](CHANGELOG.md)",
    "",
  ].join("\n"),
);

console.log(`Wrote ${componentSources.length} component docs and ${skillSources.length} skill docs to docs/.`);
