import { TABLE_CONTROL_COLUMN_WIDTH, TABLE_GROUP_CONTROL_COLUMN_WIDTH } from './ctableControlSx';

export const CTableFooter = (props: any) => {
    const { columns = [], visibleColumns, summaryRow, selectionMode, grouping = [], columnWidths = {} } = props;
    if (!props.showSummary) return null;

    const isSelectionEnabled = selectionMode === 'multiple' || selectionMode === 'single';
    const hasGrouping = grouping.length > 0;
    const orderedVisibleColumns = columns.filter((column: any) => visibleColumns.includes(column.id));

    return (
        <tfoot className="orb-table-footer" style={{ zIndex: props.zIndex }}>
            <tr>
                {isSelectionEnabled && (
                    <td
                        className="orb-table-footer-control"
                        style={{ width: TABLE_CONTROL_COLUMN_WIDTH, minWidth: TABLE_CONTROL_COLUMN_WIDTH, maxWidth: TABLE_CONTROL_COLUMN_WIDTH }}
                    />
                )}
                {hasGrouping && (
                    <td
                        className="orb-table-footer-control"
                        style={{ width: TABLE_GROUP_CONTROL_COLUMN_WIDTH, minWidth: TABLE_GROUP_CONTROL_COLUMN_WIDTH, maxWidth: TABLE_GROUP_CONTROL_COLUMN_WIDTH }}
                    />
                )}
                {orderedVisibleColumns.map((column: any) => (
                    <td
                        key={column.id}
                        className={`orb-table-footer-cell ${column.numeric ? 'orb-num' : ''}`}
                        style={{
                            width: columnWidths[column.id] || column.minWidth || 100,
                            minWidth: columnWidths[column.id] || column.minWidth || 100,
                            maxWidth: columnWidths[column.id] || column.minWidth || 100,
                        }}
                    >
                        {(function formatSummaryValue() {
                            const val = summaryRow[column.id];
                            if (val === undefined || val === null || val === '') return '';
                            // Try to format as number if it looks like one
                            if (typeof val === 'number') return val.toLocaleString();
                            if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
                                return Number(val).toLocaleString();
                            }
                            return val;
                        })()}
                    </td>
                ))}
            </tr>
        </tfoot>
    );
};
