# Atoms

基础原子组件目录（最小可复用 UI 单元）。

## 使用方式

- 从 `orbcafe-ui@2` 开始，`Atoms/*` **已从包入口导出**，消费项目可以直接 `import { CButton, CTextField } from 'orbcafe-ui'`。
- Atoms 是低阶基础组件：应保持无业务状态，仅作为 `Molecules`/`StdReport`/`PTable` 等上层组件内部的拼装基础。
- 除非只需要单个原子控件，否则优先使用模块级组件（`CStandardPage`、`CTable`、`PTable`、`CAppPageLayout`），样式与交互更完整。

## 已导出的原子组件

| Category | Components |
| --- | --- |
| Button | `CButton`, `CIconButton`, `CSegmentedControl` |
| Input | `CTextField`, `CTextArea`, `CSelect`, `CCheckbox`, `CRadioGroup`, `CSwitch`, `CFileUpload`, `CDatePicker`, `CCalendar` |
| Feedback | `CAlert`, `CProgress`, `CSkeleton`, `CSpinner`, `CTooltip`, `CMessageBox`（Molecules） |
| Overlay | `CDialog`, `CPopover`, `CMenu` |
| Display | `CChip`, `CBadge`, `CAvatar`, `CPaper`, `CDivider`, `CTypography`, `CStack`, `CTabs`, `CList`（Molecules） |

> 注意：`lib/orbis-compat`（`Box`/`Paper`/`Stack` 等 MUI 兼容 shim）是内部实现，不从包入口导出，消费项目不要直接使用。
