import { Menu, MenuItem, Checkbox, ListItemText, ListItemIcon, Divider, Switch, FormControlLabel, Box, Badge, Typography, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useOrbcafeI18n } from '../../../i18n';

// --- Types ---
interface Column {
    id: string;
    label: string;
    numeric?: boolean;
}

// --- Group Menu ---
export interface CTableGroupMenuProps {
    groupAnchorEl: HTMLElement | null;
    setGroupAnchorEl: (el: HTMLElement | null) => void;
    grouping: string[];
    setGrouping: (grouping: string[]) => void;
    columns: Column[];
    toggleGroupField: (field: string) => void;
}

export const CTableGroupMenu = ({
    groupAnchorEl,
    setGroupAnchorEl,
    grouping,
    setGrouping,
    columns,
    toggleGroupField
}: CTableGroupMenuProps) => {
    const { t } = useOrbcafeI18n();
    return (
        <Menu
            anchorEl={groupAnchorEl}
            open={Boolean(groupAnchorEl)}
            onClose={() => setGroupAnchorEl(null)}
        >
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ px: 1 }}>{t('table.menu.groupBy')}</Typography>
                {grouping.length > 0 && (
                    <Button 
                        size="small" 
                        color="error" 
                        onClick={() => setGrouping([])}
                        startIcon={<ClearAllIcon />}
                    >
                        {t('table.menu.clearAll')}
                    </Button>
                )}
            </Box>
            <Divider />
            {columns.map((col) => {
                const isSelected = grouping.includes(col.id);
                const order = grouping.indexOf(col.id) + 1;
                
                return (
                    <MenuItem key={col.id} onClick={() => toggleGroupField(col.id)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Checkbox checked={isSelected} size="small" />
                            <ListItemText primary={col.label} />
                            {isSelected && (
                                <Badge 
                                    badgeContent={order} 
                                    color="primary" 
                                    sx={{ mr: 2 }}
                                />
                            )}
                        </Box>
                    </MenuItem>
                );
            })}
        </Menu>
    );
};

// --- Column Visibility Menu ---
interface CTableColumnMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: (el: HTMLElement | null) => void;
    columns: Column[];
    visibleColumns: string[];
    toggleColumnVisibility: (field: string) => void;
}

export const CTableColumnMenu = ({
    anchorEl,
    setAnchorEl,
    columns,
    visibleColumns,
    toggleColumnVisibility
}: CTableColumnMenuProps) => {
    const { t } = useOrbcafeI18n();
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >
            <MenuItem disabled>
                <ListItemText primary={t('table.menu.visibleColumns')} />
            </MenuItem>
            <Divider />
            {columns.map((col) => (
                <MenuItem key={col.id} onClick={() => toggleColumnVisibility(col.id)}>
                    <Checkbox checked={visibleColumns.includes(col.id)} size="small" />
                    <ListItemText primary={col.label} />
                </MenuItem>
            ))}
        </Menu>
    );
};

// --- Summary Menu ---
interface CTableSummaryMenuProps {
    anchorEl: HTMLElement | null;
    setAnchorEl: (el: HTMLElement | null) => void;
    showSummary: boolean;
    setShowSummary: (show: boolean) => void;
    columns: Column[];
    summaryColumns: string[];
    toggleSummaryColumn: (field: string) => void;
}

export const CTableSummaryMenu = ({
    anchorEl,
    setAnchorEl,
    showSummary,
    setShowSummary,
    columns,
    summaryColumns,
    toggleSummaryColumn
}: CTableSummaryMenuProps) => {
    const { t } = useOrbcafeI18n();
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >
            <MenuItem>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showSummary}
                            onChange={(e) => setShowSummary(e.target.checked)}
                            size="small"
                        />
                    }
                    label={t('table.menu.showSummaryRow')}
                />
            </MenuItem>
            <Divider />
            {columns.filter(col => col.numeric).map((col) => (
                <MenuItem key={col.id} onClick={() => toggleSummaryColumn(col.id)} disabled={!showSummary}>
                    <Checkbox checked={summaryColumns.includes(col.id)} size="small" />
                    <ListItemText primary={col.label} />
                </MenuItem>
            ))}
            {columns.filter(col => col.numeric).length === 0 && (
                <MenuItem disabled>
                    <ListItemText primary={t('table.menu.noNumericColumns')} />
                </MenuItem>
            )}
        </Menu>
    );
};

// --- Context Menu ---
interface CTableContextMenuProps {
    contextMenu: { mouseX: number; mouseY: number } | null;
    handleCloseContextMenu: () => void;
    columns: Column[];
    visibleColumns: string[];
    toggleColumnVisibility: (field: string) => void;
}

export const CTableContextMenu = ({
    contextMenu,
    handleCloseContextMenu,
    columns,
    visibleColumns,
    toggleColumnVisibility
}: CTableContextMenuProps) => {
    const { t } = useOrbcafeI18n();
    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleCloseContextMenu}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <MenuItem onClick={handleCloseContextMenu}>{t('common.copy')}</MenuItem>
            <Divider />
            <MenuItem disabled>{t('table.menu.visibleColumns')}</MenuItem>
            {columns.map((col) => (
                <MenuItem key={col.id} onClick={() => toggleColumnVisibility(col.id)}>
                    <ListItemIcon>
                        {visibleColumns.includes(col.id) && <CheckIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText>{col.label}</ListItemText>
                </MenuItem>
            ))}
        </Menu>
    );
};
