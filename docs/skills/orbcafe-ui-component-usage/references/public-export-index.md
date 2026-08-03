# Public Export Index (Source of Truth)

Use only exports reachable from `src/index.ts`. All of the following are importable from `orbcafe-ui`.

## Direct exports from package entry

- Theme / mode:
  - `OrbisModeProvider`, `useOrbMode`, `useOrbTokens`
  - `ORB_TOKENS`, `ORB_LIGHT`, `ORB_DARK`, `ORB_RADIUS`, `ORB_FONT_STACK`, `ORB_TRANSITION_FAST`
- Icons:
  - `SapIcon` family (`SapIcon`, `SapIconName`, `SapIconProps`, `createSapIcon`)
  - Lucide-style aliases from `Icons/*` (e.g. `Search`, `Pin`, `Mail`, `Settings`, `LogOut`, `PackageCheck`, `Truck`, `Send`, `Copy`, `Edit`, `Delete`, `Plus`, `X`, ...)
- Atoms (`Atoms/*`):
  - `CButton`, `CTextField`, `CTextArea`, `CSelect`, `CCheckbox`, `CRadioGroup`, `CSwitch`, `CChip`, `CBadge`, `CAvatar`, `CAlert`, `CProgress`, `CSkeleton`, `CSpinner`, `CIconButton`, `CSegmentedControl`, `CTooltip`, `CMenu`, `CPaper`, `CDivider`, `CTypography`, `CStack`, `CDialog`, `CPopover`, `CTabs`, `CCalendar`, `CDatePicker`, `CFileUpload`
- Navigation:
  - `NavigationIsland`, `NavigationIsland2`, `TreeMenu`, `Button`, `buttonVariants`, `useNavigationIsland`
  - types: `TreeMenuItem`, `NavigationIslandProps`, `NavigationIslandDisplayMode`, `ButtonProps`
- Modules:
  - `StdReport/*` (incl. `CStandardPage`, `CTable`, `CSmartFilter`, `CLayoutManager`, `CVariantManager`, `CVariantManagement`, `useStandardReport`, `resolveVariantFilters`, `resolveVariantLayout`, `IVariantService`, `VariantMetadata`, `ReportColumn`, `ReportFilter`, `ReportMetadata`)
  - `GraphReport/*`
  - `CustomizeAgent/*`
  - `DetailInfo/*`
  - `Kanban/*`
  - `PageLayout/*`
  - `PivotTable/*`
  - `Pad/*`:
    - `PAppPageLayout`
    - `PNavIsland`
    - `PWorkloadNav`
    - `PSmartFilter`
    - `PTable`
    - `PNumericKeypad`
    - `PBarcodeScanner`
    - `PTouchCard`
    - `usePadLayout`
    - `usePadRecordEditor`
  - `AINav/*`
  - `AgentUI/*`:
    - `AgentPanel`
    - `FloatingAgentPanel`
    - `StdChat`
    - `CopilotChat`
    - `AIBrowserGlow`
    - `type ChatMessage`
    - `type AgentPanelStatus`
    - `type AIBrowserGlowColors`
    - `type AgentUICardHooks`
    - `type AgentUICardHookEvent`
    - `type AgentUICardAction`
    - `type AgentUICardType`
  - `Auth/*`:
    - `CAuthPage`
    - `useAuthPage`
    - `type AuthPageMode`
    - `type AuthLoginPayload`
    - `type AuthRegisterPayload`
    - `type AuthForgotPasswordPayload`
  - `Planning/*`:
    - `CPlanningLayout`
    - `CPlanningGantt`
    - `usePlanningLayout`
    - `usePlanningGantt`
    - `type PlanningTaskRecord`
    - `type PlanningGanttColumn`
    - `type PlanningGanttScale`
  - `Tree/*`:
    - `CTreeComp`
    - `type CTreeCompNode`
    - `type CTreeCompColumn`
    - `type CTreeCompPaneMode`
- Shared:
  - `i18n/*` (`OrbcafeI18nProvider`, `useOrbcafeI18n`, `OrbcafeLocale`, ...)
  - `GlobalMessage`, `showMessage`, `messageManager`, `type CMessageBoxType`
  - `CMessageBox`, `CStatusBadge`, `CList` family, `CFilterField`
  - `CLayoutManagement` (via `StdReport/*` re-export)
  - `CValueHelp`
  - `type CValueHelpProps`
  - `type CValueHelpColumn`
  - `type CValueHelpRecord`
  - `type CValueHelpSelectionValue`
  - `MarkdownRenderer` family from `lib/renderer/md_renderer`
  - `CPageTransition`
  - `useMediaQuery`

## Non-public pattern to avoid

- Do not import from `src/components/...` in consumer apps.
- `Atoms/*` are now exported from the package entry, but they are low-level primitives; prefer module-level components (`CStandardPage`, `CTable`, `PTable`, `CAppPageLayout`) unless a single atom is explicitly needed.
- `lib/orbis-compat/*` (MUI-compatible shims like `Box`, `Paper`, `Stack`) is internal; do not import it from consumer apps.
- Do not tell consumers to import `CTable`, `CValueHelp`, `CPlanningGantt`, `AgentPanel`, or `CTreeComp` from their source directories; all are package-entry APIs.
