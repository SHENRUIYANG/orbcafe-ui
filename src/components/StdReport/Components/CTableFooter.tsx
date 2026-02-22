import React from 'react';
import { TableFooter, TableRow, TableCell } from '@mui/material';

export const CTableFooter = (props: any) => {
    const { visibleColumns, summaryRow, selectionMode } = props;
    if (!props.showSummary) return null;

    const isSelectionEnabled = selectionMode === 'multiple' || selectionMode === 'single';

    return (
        <TableFooter sx={{ position: 'sticky', bottom: 0, zIndex: props.zIndex, bgcolor: 'background.paper' }}>
            <TableRow>
                {isSelectionEnabled && <TableCell padding="checkbox" sx={{ bgcolor: 'background.paper' }} />}
                {visibleColumns.map((colId: string) => (
                    <TableCell 
                        key={colId} 
                        sx={{ 
                            fontWeight: 'bold',
                            fontSize: '0.875rem', // Match body font size
                            bgcolor: 'background.paper', // Ensure sticky footer has background
                            color: 'text.primary'
                        }}
                    >
                        {(function formatSummaryValue() {
                            const val = summaryRow[colId];
                            if (val === undefined || val === null || val === '') return '';
                            // Try to format as number if it looks like one
                            if (typeof val === 'number') return val.toLocaleString();
                            if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
                                return Number(val).toLocaleString();
                            }
                            return val;
                        })()}
                    </TableCell>
                ))}
            </TableRow>
        </TableFooter>
    );
};