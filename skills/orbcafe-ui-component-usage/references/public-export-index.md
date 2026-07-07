# Public Export Index (Source of Truth)

Use only exports reachable from `src/index.ts`.

## Direct exports from package entry

- Navigation:
  - `NavigationIsland`, `TreeMenu`, `button`, `useNavigationIsland`
- Modules:
  - `StdReport/*`
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
  - `i18n/*`
  - `CValueHelp`
  - `type CValueHelpProps`
  - `type CValueHelpColumn`
  - `type CValueHelpRecord`
  - `type CValueHelpSelectionValue`
  - `MarkdownRenderer` family from `lib/renderer/md_renderer`
  - `CPageTransition`
  - `showMessage` API from `lib/message`
  - `CMessageBox`

## Non-public pattern to avoid

- Do not import from `src/components/...` in consumer apps.
- Do not instruct usage of Atoms/Molecules internals unless they are exported via package entry.
- Do not tell consumers to import `CTable`, `CValueHelp`, `CPlanningGantt`, `AgentPanel`, or `CTreeComp` from their source directories; all are package-entry APIs.
