# Component Glossary (Natural Language Mapping)

Use this file to map natural-language requests to canonical ORBCAFE component names before routing.

## Naming rules

- Always output canonical API names in code (`CStandardPage`, `PTable`, `CopilotChat`).
- You may accept user phrasing in any language, but normalize to canonical API names.
- Prefer stable business values and localized labels.

## Core mapping (EN / ZH / DE)

| Canonical API | English natural name | 中文通俗名 | German natural name / cues |
| --- | --- | --- | --- |
| `CStandardPage` | Standard report page | 标准报表页 | Standardbericht Seite |
| `CTable` | Computer table / desktop table | 电脑端表格 | Desktop Tabelle |
| `CSmartFilter` | Smart filter bar | 智能筛选器 | Smart Filterleiste |
| `PTable` | Pad table / touch table | 平板触摸表格 | Tablet Tabelle / Touch Tabelle |
| `PSmartFilter` | Pad smart filter | 平板筛选器 | Tablet Filterleiste |
| `PAppPageLayout` | Pad app shell | 平板页面布局 | Tablet App Layout |
| `PNavIsland` | Pad navigation island | 平板导航岛 | Tablet Navigation |
| `PWorkloadNav` | Workload card navigation | 工作清单导航卡片 | Arbeitslast Navigation |
| `PNumericKeypad` | On-screen number keypad | 屏幕数字小键盘 | Bildschirm Ziffernblock |
| `PBarcodeScanner` | Camera barcode scanner | 摄像头扫码控件 | Kamera Barcode Scanner |
| `PTouchCard` | Swipe/drag touch card | 手指滑动/拖动卡片 | Touch Karte |
| `NavigationIsland` | Navigation tree island | 导航岛/左侧导航树 | Navigationsbereich |
| `CAppPageLayout` | App shell layout | 应用壳层布局 | App Layout |
| `CGraphReport` | Graph report dialog | 图形报表弹窗 | Diagramm Bericht |
| `CDetailInfoPage` | Detail page | 详情页 | Detailseite |
| `CKanbanBoard` | Kanban board | 看板 | Kanban Board |
| `CPivotTable` | Pivot table | 透视表 | Pivot Tabelle |
| `CAINavProvider` | Voice navigation provider | 语音导航提供器 | Sprach Navigation |
| `AgentPanel` | Agent chat panel | 智能体聊天面板 | Agent Chat Panel |
| `StdChat` | Standard chat view | 标准聊天页 | Standard Chat |
| `CopilotChat` | Copilot floating chat content | Copilot 浮窗聊天内容 | Copilot Chat |
| `CMessageBox` | Message/confirm dialog | 统一消息确认框 | Meldungsdialog |

## i18n implementation baseline for AI

1. Wrap app root with `OrbcafeI18nProvider` OR use `CAppPageLayout.locale`.
2. Render UI text with `useOrbcafeI18n().t()` in library components.
3. Keep domain values stable (`active`, `pending`) and localize labels only.
4. Add/update all locales in `src/i18n/messages.ts`: `en/zh/fr/de/ja/ko`.
5. Verify locale switch does not change non-localized IDs/values.

