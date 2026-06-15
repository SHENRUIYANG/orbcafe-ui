# Pad Patterns

## Pattern 1: Complete Pad App Layout

This is the standard, best-practice structure for a Pad application based on `PadExampleClient.tsx`.

```tsx
import { useState } from 'react';
import { PAppPageLayout, PNavIsland, PWorkloadNav, PTable, PNumericKeypad, PBarcodeScanner } from 'orbcafe-ui';
import { PackageCheck, Truck } from 'lucide-react';
import { Box, Paper, Stack } from '@mui/material';

export default function PadApp() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeWorkload, setActiveWorkload] = useState('picking');
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <PAppPageLayout
      navigation={
        <PNavIsland
          items={[{ id: 'dashboard', label: 'Dashboard', icon: <PackageCheck /> }]}
          activeId={activeMenu}
          onItemClick={setActiveMenu}
        />
      }
      workloads={
        <PWorkloadNav
          items={[
            { id: 'picking', title: 'Picking', description: 'Wave pick tasks', icon: <PackageCheck /> },
            { id: 'dispatch', title: 'Dispatch', description: 'Load routes', icon: <Truck /> }
          ]}
          activeId={activeWorkload}
          onItemClick={setActiveWorkload}
        />
      }
      header={<Box component="img" src="/logo.png" sx={{ height: 40 }} />}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 600px', minWidth: 0, height: '100%' }}>
          {/* Main content area (e.g., PTable) */}
          <PTable
             appId="pad-demo"
             tableKey="tasks"
             columns={[{ id: 'taskId', label: 'Task' }, { id: 'status', label: 'Status' }]}
             rows={[]}
             rowKey="id"
             cardTitleField="title"
             cardSubtitleFields={['taskId', 'status']}
          />
        </Box>
        <Box sx={{ flex: '0 0 360px', width: 360 }}>
          {/* Side panel for tools (Keypad, Scanner trigger) */}
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <PNumericKeypad
                title="Enter Quantity"
                value=""
                onChange={() => {}}
                onSubmit={() => {}}
              />
            </Paper>
          </Stack>
        </Box>
      </Box>

      {/* Global Dialogs */}
      <PBarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={(res) => console.log(res)}
      />
    </PAppPageLayout>
  );
}
```

## Pattern 2: PTable Configuration

`PTable` accepts the same data/columns format as `CTable` but renders rows as touch cards.

```tsx
<PTable
  appId="pad-tasks"
  tableKey="task-list"
  columns={[
    { id: 'id', label: 'ID' },
    { id: 'title', label: 'Title' },
    { id: 'zone', label: 'Zone' },
    { id: 'qty', label: 'Qty', numeric: true },
  ]}
  rows={tasks}
  rowKey="id"
  // Pad specific mapping:
  cardTitleField="title"
  cardSubtitleFields={['id', 'zone']}
  cardActionSlot={(row) => <Chip label={row.status} />}
  renderCardFooter={(row) => <Typography>Planned: {row.qty}</Typography>}

  // Standard features still work:
  selectionMode="multiple"
  quickEdit={{ enabled: true, editableFields: ['qty'], primaryKeys: ['id'], onSubmit: handleEdit }}
  filterConfig={{ /* ... */ }}
/>
```

## Pattern 3: PTable SmartFilter with Value Help

`PTable` uses `PSmartFilter`, so the same `CValueHelp` field contract works on Pad pages. Keep it for business-object lookup such as material, bin, customer, work center, or route.

```tsx
<PTable
  appId="pad-picking"
  tableKey="pick-list"
  columns={[
    { id: 'taskId', label: 'Task' },
    { id: 'materialId', label: 'Material' },
    { id: 'bin', label: 'Bin' },
  ]}
  rows={tasks}
  rowKey="id"
  cardTitleField="taskId"
  cardSubtitleFields={['materialId', 'bin']}
  filterConfig={{
    appId: 'pad-picking',
    tableKey: 'pick-list',
    fields: [
      {
        id: 'materialId',
        label: 'Material',
        type: 'value-help',
        valueHelp: {
          dialogTitle: 'Material Value Help',
          items: materials,
          columns: [
            { field: 'materialId', label: 'Material', minWidth: 140 },
            { field: 'description', label: 'Description', minWidth: 240 },
            { field: 'plant', label: 'Plant', minWidth: 100 },
          ],
          getOptionValue: (item) => item.materialId,
          getOptionLabel: (item) => item.description,
          getOptionDescription: (item) => item.plant,
        },
      },
    ],
    filters,
    onFilterChange: setFilters,
    onVariantLoad: handleVariantLoad,
  }}
/>
```

Pad Value Help notes:

- Use stable keys as selected values; the card display can use localized descriptions.
- The popup remains MUI dialog based, so keep labels short and columns few enough for touch use.
- Prefer `PBarcodeScanner` for barcode capture and `CValueHelp` for searchable master-data lookup; do not merge both concerns into one custom input.
