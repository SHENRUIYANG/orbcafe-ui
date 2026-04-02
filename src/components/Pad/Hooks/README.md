# Pad Hooks

Pad hooks 用于在业务页面里快速组合平板壳层行为（横竖屏 + 菜单开合）和记录编辑行为（行选择 + 小键盘写回）。

## Hooks

| Hook | Description |
| --- | --- |
| `usePadLayout` | 统一处理 `orientation`、菜单开合和 `resolvedOrientation`。 |
| `usePadRecordEditor` | 管理当前选中记录和可编辑数字字段，适配 `PNumericKeypad` 写回。 |

## usePadLayout

### Usage

```tsx
import { PAppPageLayout, usePadLayout } from 'orbcafe-ui';

const {
  resolvedOrientation,
  navigationOpen,
  setNavigationOpen,
} = usePadLayout({
  orientation: 'auto',
});

<PAppPageLayout
  appTitle="Pad Workspace"
  orientation={resolvedOrientation}
  navOpen={navigationOpen}
  onNavOpenChange={setNavigationOpen}
>
  ...
</PAppPageLayout>;
```

### Options

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `orientation` | `'auto' \| 'portrait' \| 'landscape'` | No | 自动或强制方向。 |
| `defaultNavigationOpen` | `boolean` | No | 初始菜单状态。默认横屏开、竖屏关。 |
| `onNavOpenChange` | `(open: boolean) => void` | No | 菜单状态回调。 |

### Return

| Name | Type | Description |
| --- | --- | --- |
| `resolvedOrientation` | `'portrait' \| 'landscape'` | 实际可用于组件的方向。 |
| `isPortraitViewport` | `boolean` | 当前视口是否竖屏。 |
| `isCompactViewport` | `boolean` | 是否小屏（`md` 以下）。 |
| `navigationOpen` | `boolean` | 当前菜单开合状态。 |
| `setNavigationOpen` | `(open: boolean) => void` | 直接设置菜单状态。 |
| `toggleNavigationOpen` | `() => void` | 切换菜单状态。 |

## usePadRecordEditor

### Usage

```tsx
import { PNumericKeypad, usePadRecordEditor } from 'orbcafe-ui';

const [rows, setRows] = useState(tasks);

const {
  selectedRecord,
  editorValue,
  setEditorValue,
  selectRecord,
  applyEditorValue,
} = usePadRecordEditor({
  rows,
  rowKey: 'id',
  numericField: 'confirmedQty',
});

<PNumericKeypad
  value={editorValue}
  onChange={setEditorValue}
  onSubmit={() => applyEditorValue(setRows)}
/>;
```

### Options

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `rows` | `TRecord[]` | Yes | 当前数据源。 |
| `rowKey` | `keyof TRecord \| string` | No | 记录主键字段，默认 `id`。 |
| `numericField` | `keyof TRecord \| string` | Yes | 目标数字字段（例如 `confirmedQty`）。 |
| `defaultSelectedId` | `string \| number` | No | 默认选中记录。 |

### Return

| Name | Type | Description |
| --- | --- | --- |
| `selectedId` | `string \| number \| undefined` | 当前选中主键。 |
| `selectedRecord` | `TRecord \| undefined` | 当前选中记录。 |
| `editorValue` | `string` | 当前输入值。 |
| `setEditorValue` | `(value: string) => void` | 修改输入值。 |
| `selectRecord` | `(row: TRecord) => void` | 选中某条记录并同步输入值。 |
| `applyEditorValue` | `(updater) => void` | 把当前输入值写回数据。 |

