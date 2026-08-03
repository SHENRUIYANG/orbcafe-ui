# StdReport Component Library

**StdReport** (Standard Report) is a high-order React component suite designed for building enterprise-grade data reporting pages with advanced filtering, dynamic table layouts, and variant management.

It is built on the ORBIS design primitives and provides a standardized "Page-Filter-Table" architecture.

## 📦 Core Components

### 1. CStandardPage
The main layout container that orchestrates the Filter Bar and Data Table.

```tsx
import { CStandardPage } from 'orbcafe-ui';

<CStandardPage
  title="Employee Report"
  filterConfig={filterConfig}
  tableProps={tableProps}
/>
```

### 2. CSmartFilter
A collapsible, configuration-driven filter bar supporting:
- Dynamic field generation (Text, Number, Date, Select)
- Advanced operators (Contains, Equals, Between, etc.)
- **Variant Management**: Save/Load filter presets.

### 3. CTable
A feature-rich ORBIS data table.
- **Features**: Sorting, Pagination, Column Visibility, Grouping (placeholder), Layout Persistence.
- **Integration**: Works seamlessly with `CLayoutManager` to persist user preferences (column order, width, visibility).

## 🛠 Usage

### Prerequisites
`orbcafe-ui` 自带运行时依赖（`dayjs`、`@dnd-kit/*` 等）。V2 是 MUI-free：不要安装 `@mui/*`/`@emotion/*`。宿主项目需要 Tailwind v4（编译组件 utility classes）并在全局 CSS 引入 `orbcafe-ui/styles.css`：

```bash
npm install orbcafe-ui
npm install -D tailwindcss @tailwindcss/postcss
```

### Basic Example

```tsx
import { CStandardPage } from 'orbcafe-ui';

const MyReport = () => {
  return (
    <CStandardPage
      title="My Standard Report"
      filterConfig={{
        fields: [
          { id: 'name', label: 'Name', type: 'text' },
          { id: 'status', label: 'Status', type: 'select', options: [...] }
        ],
        filters: currentFilters,
        onFilterChange: setFilters,
        onSearch: handleSearch
      }}
      tableProps={{
        columns: [
          { id: 'name', label: 'Name' },
          { id: 'status', label: 'Status' }
        ],
        rows: data,
        count: total,
        page: page,
        rowsPerPage: rowsPerPage,
        onPageChange: setPage,
        onRowsPerPageChange: setRowsPerPage
      }}
    />
  );
};
```

## 🧩 Architecture

- **Molecules**: Reusable atomic UI parts (`CVariantManagement`, `CDateRangePicker`, `CLayoutManagement`).
- **Structures**: Layout containers (`CPageLayout`).
- **Smart Components**: Logic-heavy components (`CLayoutManager`, `CVariantManager`) that handle state and persistence.

## 📝 Configuration

### Layout & Variant Persistence
The components support backend persistence via `serviceUrl`.
- **Layouts**: Stores table column configuration.
- **Variants**: Stores filter criteria + layout reference.

Default behavior (no `serviceUrl`): localStorage persistence only, no backend request.
If you pass `serviceUrl`, it will use your REST API (e.g. `/api/layouts`, `/api/variants`) and automatically fall back to localStorage when unavailable.
