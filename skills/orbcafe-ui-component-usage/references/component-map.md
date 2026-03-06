# ORBCAFE UI Component Map

## TOC
- Public entrypoint and import rule
- Intent to component mapping
- First-choice component pairs
- Common anti-patterns

## Public entrypoint and import rule

Always import from:

```tsx
import { ... } from 'orbcafe-ui';
```

Do not import from `src/components/...` paths in consuming applications.

## Intent to component mapping

| User intent | Primary component/hook | Why |
| --- | --- | --- |
| Build whole app shell with header + left navigation + content | `CAppPageLayout` | One component provides app-level skeleton and user/locale hooks. |
| Build collapsible side navigation only | `NavigationIsland` + `useNavigationIsland` | Dedicated navigation control with tree menu. |
| Build standard report/list page quickly | `useStandardReport` + `CStandardPage` | Fastest full page pattern for filters + table + state wiring. |
| Render only a table without page shell | `CTable` | Flexible standalone table with sorting/paging/grouping/toolbar options. |
| Add standard filter bar | `CSmartFilter` | Standardized filter UX and variant integration. |
| Add chart report popup from table data | `graphReport` on `CTable`, or `useGraphReport` + `CGraphReport` | Reuses built-in chart model and interaction behaviors. |
| Build detail page with sections/tabs and AI fallback | `CDetailInfoPage` + `useDetailInfo` | Standard list-to-detail structure with searchable fields + AI area. |
| Configure LLM endpoint/model/prompt templates | `CCustomizeAgent` | Standard settings dialog for model + prompt templates + save-all callback. |
| Show confirm/success/warning/error modal | `CMessageBox` | Unified interaction style and i18n texts. |
| Render markdown AI answer safely in UI | `MarkdownRenderer` | Standard markdown render path for rich text output. |
| Add route transition animation | `CPageTransition` | Lightweight GPU-friendly transition variants. |

## First-choice component pairs

### Report page
- First choice: `useStandardReport` + `CStandardPage`
- Move to raw `CTable` only when layout is non-standard or table is embedded in a custom surface.

### Chart analysis
- First choice: `CTable` with `graphReport.enabled = true`
- Move to direct `CGraphReport` only when dialog open/close and data model are controlled externally.

### Detail experience
- First choice: `CDetailInfoPage`
- Use `useDetailInfo` when you need custom orchestration outside default page container.

## Common anti-patterns

- Building custom confirmation `Dialog` for destructive operations instead of reusing `CMessageBox`.
- Mixing localized display strings as filter values (breaks backend/query consistency).
- Importing non-exported internals from library source paths.
- Starting from chart components when requirement is actually a list page with occasional chart drilldown.
