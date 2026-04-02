# Pad Components

`Pad` 模块用于构建平板触摸场景 UI：壳层导航、工作负载切换、触摸报表、数字键盘和触控卡片交互。

## Exports

```tsx
import {
  PAppPageLayout,
  PBarcodeScanner,
  PNavIsland,
  PWorkloadNav,
  PSmartFilter,
  PTable,
  PNumericKeypad,
  PTouchCard,
  usePadLayout,
  usePadRecordEditor,
} from 'orbcafe-ui';
```

## Components

| Component | Description | Key Props |
| --- | --- | --- |
| `PAppPageLayout` | Pad 页面壳层：顶部栏、左侧菜单、工作负载卡片、内容容器。 | `menuData`, `workloadItems`, `onWorkloadSelect`, `onSearch`, `orientation`, `navOpen` |
| `PBarcodeScanner` | 摄像头扫码弹窗，优先使用浏览器原生 `BarcodeDetector`，支持手动录入回退。 | `open`, `onClose`, `onDetected`, `formats`, `facingMode`, `manualEntry` |
| `PNavIsland` | 触摸友好导航岛，支持搜索、分组展开/折叠。 | `menuData`, `collapsed`, `onToggle`, `orientation` |
| `PWorkloadNav` | 顶部 workload 卡片导航。 | `items`, `selectedId`, `onItemSelect` |
| `PSmartFilter` | `CSmartFilter` 的触摸适配包装。 | `touchMode`, 以及 `CSmartFilter` 全部能力 |
| `PTable` | 触摸卡片化表格，保持 `CTable` 的分页、分组、汇总、布局/变体、quick actions。 | `columns`, `rows`, `filterConfig`, `quickCreate`, `quickEdit`, `quickDelete`, `orientation` |
| `PNumericKeypad` | 屏幕数字小键盘，可直接写回业务字段。 | `value`, `onChange`, `onSubmit`, `allowDecimal`, `maxLength` |
| `PTouchCard` | 支持点击、拖动手柄、左右滑动动作的卡片。 | `onClick`, `draggable`, `startAction`, `endAction`, `onSwipe` |

## Hooks

- `usePadLayout`: 管理横竖屏解析与菜单开合状态。
- `usePadRecordEditor`: 管理记录选中 + 小键盘字段写回。

完整参数与返回值见 [Hooks README](./Hooks/README.md)。

## Recommended Composition

1. `PAppPageLayout` 作为页面壳层。
2. 顶部用 `PWorkloadNav` 切换 workload。
3. 中部用 `PTable + PSmartFilter` 承接 CTable 同等数据能力。
4. 右侧/底部用 `PNumericKeypad` 完成现场确认录入。
5. 需要设备扫码时，用按钮触发 `PBarcodeScanner`，把检测结果回写到筛选条件、表单字段或业务状态。

## Minimal Example

```tsx
'use client';

import { useMemo, useState } from 'react';
import { Box, Button, Chip } from '@mui/material';
import { PAppPageLayout, PBarcodeScanner, PNumericKeypad, PTable, usePadLayout, usePadRecordEditor } from 'orbcafe-ui';

type Row = { id: string; title: string; confirmedQty: number; zone: string; status: string };

export default function Demo() {
  const [rows, setRows] = useState<Row[]>([
    { id: '1', title: 'Receive pallet A', confirmedQty: 12, zone: 'Dock-01', status: 'Queued' },
    { id: '2', title: 'Receive pallet B', confirmedQty: 8, zone: 'Dock-02', status: 'Ready' },
  ]);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { resolvedOrientation, navigationOpen, setNavigationOpen } = usePadLayout({ orientation: 'auto' });

  const { editorValue, setEditorValue, selectRecord, applyEditorValue } = usePadRecordEditor({
    rows,
    rowKey: 'id',
    numericField: 'confirmedQty',
  });

  const columns = useMemo(
    () => [
      { id: 'title', label: 'Task' },
      { id: 'zone', label: 'Zone' },
      { id: 'status', label: 'Status', render: (value: string) => <Chip size="small" label={value} /> },
      { id: 'confirmedQty', label: 'Confirmed', numeric: true },
    ],
    [],
  );

  return (
    <PAppPageLayout
      appTitle="Pad Workspace"
      orientation={resolvedOrientation}
      navOpen={navigationOpen}
      onNavOpenChange={setNavigationOpen}
      menuData={[{ id: 'pad', title: 'Pad', href: '/pad' }]}
    >
      <Box sx={{ display: 'grid', gap: 16 }}>
        <PTable
          title="Execution Queue"
          columns={columns}
          rows={rows}
          rowKey="id"
          onRowClick={(row) => selectRecord(row as Row)}
        />
        <PNumericKeypad
          title="Confirm quantity"
          value={editorValue}
          onChange={setEditorValue}
          onSubmit={() => applyEditorValue(setRows)}
        />
        <Button variant="contained" onClick={() => setScannerOpen(true)}>
          Open scanner
        </Button>
        <PBarcodeScanner
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onDetected={(result) => console.log(result.rawValue)}
        />
      </Box>
    </PAppPageLayout>
  );
}
```

## Official Example

- `examples/app/_components/PadExampleClient.tsx`
- `examples/app/pad/page.tsx`
