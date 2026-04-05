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
