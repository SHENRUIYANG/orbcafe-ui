# Standard Report Hooks Documentation

This directory contains custom React hooks used to power the **Standard Report** and **CTable** components. These hooks encapsulate complex logic for data fetching, state management, filtering, and table operations.

## Hooks Overview

| Hook | Description |
| :--- | :--- |
| `useStandardReport` | The primary hook for building Standard Report pages. Handles data fetching, filter state, and the default integrated variant/layout persistence flow. |
| `useCTable` | A lower-level hook used internally by `CTable` to manage sorting, pagination, selection, and grouping. |

---

## useStandardReport

The `useStandardReport` hook is the entry point for creating a standard report page. It connects your report metadata (columns, filters) with the data fetching logic and the UI state.

Current default behavior:

- Returns `pageProps.mode = "integrated"` by default.
- Automatically passes `metadata.id` as the shared persistence identity.
- Standard `useStandardReport + CStandardPage` usage no longer requires manually adding `mode="integrated"` just to make Variant/Layout linkage work.

### Usage

```typescript
import { useStandardReport, CStandardPage } from 'orbcafe-ui';

const MyReport = () => {
  const { pageProps } = useStandardReport({
    metadata: REPORT_METADATA, // Defined report configuration
    fetchData: myApiCallFunction // Optional: Custom data fetcher
  });

  return <CStandardPage {...pageProps} />;
};
```

### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| `metadata` | `ReportMetadata` | **Required**. Configuration object defining columns, filters, and default behaviors. |
| `fetchData` | `(params: any) => Promise<any>` | **Optional**. A function to fetch data from the backend. If not provided, it tries to use `metadata.api`. |
| `tableKey` | `string` | **Optional**. Table scope key. Use when one page contains multiple tables. Default: `'default'`. |
| `mode` | `'integrated' \| 'separated'` | **Optional**. Default is `'integrated'`. |
| `serviceUrl` | `string` | **Optional**. Enables backend persistence for layouts/variants while still falling back to local storage on failures. |
| `variantService` | `IVariantService` | **Optional**. Custom variant persistence service for advanced projects. |

### Return Value

The hook returns an object containing:

*   **`pageProps`**: A pre-configured object containing all necessary props for `CStandardPage` (filters, table props, handlers).
*   **`filters`**: Current state of filter values.
*   **`rows`**: Current data rows.
*   **`loading`**: Boolean indicating if data is being fetched.
*   **`refresh`**: Function to manually trigger a data reload.

### Persistence baseline

To get standard Variant/Layout persistence working with the least custom code:

1. Set a unique `metadata.id`.
2. Use the returned `pageProps` directly with `CStandardPage`.
3. Only add `tableKey` when one page has multiple tables.
4. Add `serviceUrl` or `variantService` only when you need backend persistence.

---

## useCTable

The `useCTable` hook manages the internal state of a table component. It handles client-side operations like sorting and filtering (if not handled by backend) and manages UI state like selection and column resizing.

### Key Features

*   **Sorting**: Supports single-column sorting with `stableSort`.
*   **Filtering**: Client-side text filtering.
*   **Grouping**: Supports multi-level row grouping.
*   **Selection**: Manages single and multiple row selection.
*   **Pagination**: handles page index and rows per page logic.

### Usage

This hook is typically used inside the `CTable` component but can be used to build custom table implementations.

```typescript
import { useCTable } from '@/components/StdReport/Hooks/CTable/useCTable';

const MyCustomTable = (props) => {
  const tableState = useCTable(props);
  
  // Access internal state
  const { visibleRows, order, orderBy, handleRequestSort } = tableState;
  
  // Render table...
};
```

---

## Type Definitions

Key interfaces used by these hooks (defined in `CTable/types.ts` and `useStandardReport.ts`):

### ReportMetadata

```typescript
interface ReportMetadata {
    id: string;          // Unique Report ID
    title: string;       // Page Title
    columns: ReportColumn[];
    filters: ReportFilter[];
    variants?: any[];    // Pre-defined variants
}
```

### ReportColumn

```typescript
interface ReportColumn {
    id: string;
    label: string;
    minWidth?: number;
    render?: (value: any, row: any) => React.ReactNode; // Custom cell renderer
    type?: 'string' | 'number' | 'date' | 'boolean';
}
```
