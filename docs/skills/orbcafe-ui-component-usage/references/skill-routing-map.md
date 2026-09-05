# Skill Routing Map

## Route by intent

- Build a phone, handset-sized, small-screen, or mobile application UI:
  - Outside ORBCAFE UI scope. Use [`doushabao-ui`](https://www.npmjs.com/package/doushabao-ui); do not adapt ORBCAFE `P*` or `C*` components.
- Build list/report page with filters/table/variant/layout:
  - `orbcafe-stdreport-workflow`
- Build store/catalog-style card page, app-store-like grid, centered card detail panel:
  - `orbcafe-cardpage-workflow`
- Build SAP F4/Search Help/Value Help field lookup inside filters:
  - Usually route to `orbcafe-stdreport-workflow`; for Planning or Pad pages, route to that page skill and apply the shared Value Help contract.
- Build chart dialog, detail page, or AI settings flow:
  - `orbcafe-graph-detail-ai`
- Build Kanban workflow board, bucket/card styles, or Kanban-to-detail routing:
  - `orbcafe-kanban-detail`
- Build app shell/header/navigation/i18n/layout transitions:
  - `orbcafe-layout-navigation`
- Build Navigation Island pin/favorites, menu nesting, fixed/floating nav mode, or TreeMenu behavior:
  - `orbcafe-layout-navigation`, and read `skills/orbcafe-layout-navigation/references/navigation-island.md`.
- Build pivot analytics or voice navigation:
  - `orbcafe-pivot-ainav`
- Build an explicitly Pad/iPad-sized touch workflow shell, touch table, keypad writeback, or Pad orientation adaptation:
  - `orbcafe-pad-workflow`
- Build chat page, assistant panel, or floating copilot:
  - `orbcafe-agentui-chat`
- Build login, registration, or forgot password:
  - `orbcafe-auth-workflow`
- Build project planning, production planning, table + Gantt, timeline scale, or planning SmartFilter:
  - `orbcafe-planning-gantt`
- Build hierarchy tree, BOM/cost tree, organization tree, tree table, or split tree/detail page:
  - Route through this router, then use `CTreeComp` directly with Layout/DetailInfo as needed. There is no separate Tree skill yet.

## Route by keywords

- `手机`, `移动应用`, `移动端`, `小屏`, `phone`, `smartphone`, `handset`, `mobile`, `mobile app`, `small screen`:
  - Outside ORBCAFE UI scope; use [`doushabao-ui`](https://www.npmjs.com/package/doushabao-ui).
- `报表`, `列表`, `筛选`, `分页`, `变体`, `layout`, `quickCreate`, `值帮助`, `F4`, `value help`, `search help`, `lookup`:
  - StdReport skill
- `卡片页`, `卡片网格`, `商店`, `上架`, `应用商店`, `目录页`, `card page`, `card grid`, `store`, `catalog`, `app store`, `CCardPage`, `CCardGrid`, `CCardDetailPanel`, `useCardPage`:
  - CardPage skill
- `图表`, `graph`, `kpi`, `详情页`, `detail`, `ai prompt`, `agent settings`:
  - Graph+Detail+Agent skill
- `kanban`, `bucket`, `board`, `泳道`, `拖拽卡片`, `卡片流转`, `看板`:
  - Kanban+Detail skill
- `导航`, `壳层`, `header`, `menu`, `locale`, `主题切换`, `markdown`, `transition`, `navigation island`, `pin`, `favorites`, `收藏`, `置顶`, `floating nav`:
  - Layout+Navigation skill
- `tabelle`, `filterleiste`, `standardbericht`, `navigationsbereich`, `detailseite`, `sprache wechseln`, `barcode scanner`, `tablet`:
  - Use glossary mapping first, then route by matched canonical API
- `透视表`, `pivot`, `拖拽维度`, `preset`, `语音导航`, `space 长按`:
  - Pivot+AINav skill
- `pad`, `iPad`, `平板`, `Pad 横竖屏`, `PTable`, `PSmartFilter`, `PAppPageLayout`, `PNavIsland`, `PWorkloadNav`, `PNumericKeypad`, `PBarcodeScanner`:
  - Pad Workflow skill
- Generic `触摸`, `横竖屏`, `小键盘`, `扫码`, `camera`, or `barcode` without an explicit device class:
  - Resolve the target device first. Use Pad Workflow only for Pad/iPad-sized targets; use `doushabao-ui` for phones and small screens.
- `聊天`, `chat`, `copilot`, `assistant`, `streaming`, `卡片消息`, `AgentUI`, `StdChat`, `CopilotChat`, `AgentPanel`:
  - AgentUI Chat skill
- `登录`, `登陆`, `注册`, `忘记密码`, `login`, `register`, `forgot password`:
  - Auth Workflow skill
- `甘特图`, `gantt`, `计划表`, `项目计划`, `生产计划`, `project plan`, `production plan`:
  - Planning Gantt skill
- `树`, `树表`, `层级`, `hierarchy`, `tree`, `BOM`, `cost tree`, `organization tree`, `CTreeComp`:
  - Tree component contract in `module-contracts.md` and `ctree.md`; combine with Layout+Navigation for shell and DetailInfo for rich detail panes.

## Cross-skill composition

- StdReport + GraphReport: choose StdReport as primary, then attach graph options.
- CardPage vs StdReport: same SmartFilter/variant contract; choose CardPage for store/catalog grids (icon + title + short description + actions), StdReport for dense tabular data. One backend `{ rows, total }` endpoint can serve both.
- DetailInfo + CTable: choose Graph+Detail+Agent skill.
- Kanban + DetailInfo: choose Kanban+Detail skill first, then attach DetailInfo route/query handling.
- App shell + any page module: apply Layout+Navigation skill first for frame, then attach module skill.
- Pad shell + touch report/keypad: apply Pad Workflow skill first, then attach StdReport or Layout skill when needed.
- Phone or small-screen UI never composes with ORBCAFE module skills; switch the implementation to `doushabao-ui`.
- AgentUI + app shell: apply Layout+Navigation skill first for frame, then attach AgentUI Chat skill.
- Auth + app shell: Auth usually owns the examples root page; attach Layout+Navigation only when embedding inside an authenticated shell.
- Planning Gantt + StdReport controls: choose Planning Gantt skill first, then reuse StdReport CSmartFilter/CTable contracts where needed.
- Value Help + StdReport/Planning/Pad: keep the target page skill primary, then apply `CValueHelp` through `CSmartFilter`/`PSmartFilter` field config instead of a standalone modal unless the user explicitly asks for an independent field.
- Tree + DetailInfo: use `CTreeComp` for the hierarchy/split pane, then pass a `CDetailInfoPage` or custom detail node through the `detail` prop.
