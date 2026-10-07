# Shared public API contract

## Version and source precedence

Read the consuming app's installed `orbcafe-ui/package.json` and `dist/index.d.ts` before generating code. These project skills describe the **current source checkout**, which can contain changes not published to npm. Version numbers alone do not prove that a newly added API is installed. Compare available exports/props, then upgrade deliberately or stay within that installed API.

Authority: current public exports in `src/index.ts` → actual component/hook implementation → examples → module contract/skill prose. A declared optional prop may still be unused in rendering; check implementation before promising behavior. `npm run build` must precede examples checks with file:.. dependencies.

## Contract checklist

For the chosen module, show required inputs with concrete values, who owns state, callback arguments/return, controlled/default behavior, persistence keys, and data-loading/error responsibility. Use `references/contract.md` in the target skill for operational details and its recipes for composition. Remaining public types come from installed declarations; do not guess similarly named props.

- Public imports are from `orbcafe-ui`; source paths in skills are repository inspection paths.
- React nodes/callbacks belong in TSX props. AI JSON cards are serializable data and use the separate AgentUI protocol.
- `C*`/`P*` modules do not share a universal prop vocabulary. `sx` is not present everywhere and has differing types. Do not import private `OrbSxProps`/MUI compatibility objects from the package.
- Public atoms use ORBIS props: consult their exported `C*Props`; do not assume MUI-only props (e.g. Chip color) are supported. Icons come from package entry.
- Public `useMediaQuery(query: string)` has no second options argument. Use module-owned orientation logic or mounted-safe host state for structural SSR decisions.
- Public notifications: `GlobalMessage`, `message`, `messageManager`; there is **no** package export named `showMessage`.
- Package-level `MarkdownRenderer` is the general renderer; AgentUI's internal Markdown/card renderer is private. Use AgentPanel/StdChat/CopilotChat to consume assistant dynamic cards.

## Shared Value Help and Tree

Read `value-help.md` for `CValueHelp`: value is string/number, an array of those, or null; `onChange(value, selectedRecordOrRecordsOrNull)` gives both key and record. `onSearch(query)` can return items; selectedItems recovers saved key labels. Single mode uses equals, multiple mode anyOf in SmartFilter.

Read `ctree.md` for `CTreeComp`: required title/nodes; selection and expansion support controlled pairs. `detail` receives a node or null; handle null. Pane mode is initial `defaultPaneMode`, not a controlled paneMode prop. Tree column render receives the node. Filter/table identity uses tableAppId/tableKey, not an invented tree appId.

## Maintenance and verification

When component contracts change, update the owning skill's contract/recipe, module-contracts.json, routing/export references when affected, then generate module-contracts.md and docs mirrors. Run `npm run check:ai-contracts`, `npm run docs:build`, and appropriate type/build checks. Skill source is `skills/`; `docs/skills/` is generated. Skills are not included in the npm package's files list and a local skill update does not update an installed plugin.
