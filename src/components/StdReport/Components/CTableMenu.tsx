import { Menu, MenuItem, Checkbox, ListItemText, ListItemIcon, Divider, Switch, FormControlLabel, Box, Badge, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Stack } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FunctionsIcon from '@mui/icons-material/Functions';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useMemo, useState } from 'react';
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

// --- Column Header Right-Click Menu ---
// Triggered by right-click on a single header cell. Offers per-column hide / sort
// asc / sort desc / group / summary toggle in one place — the SAP Fiori-style menu.
export interface CTableHeaderMenuProps {
    contextMenu: { mouseX: number; mouseY: number; columnId: string } | null;
    handleClose: () => void;
    columns: Column[];
    visibleColumns: string[];
    grouping: string[];
    summaryColumns: string[];
    showSummary: boolean;
    sortBy: Array<{ field: string; direction: 'asc' | 'desc' }>;
    orderBy: string;
    order: 'asc' | 'desc';
    onSortAsc: (columnId: string) => void;
    onSortDesc: (columnId: string) => void;
    onClearSort: (columnId: string) => void;
    onHideColumn: (columnId: string) => void;
    onToggleGroup: (columnId: string) => void;
    onToggleSummary: (columnId: string) => void;
    onOpenSortDialog: () => void;
}

export const CTableHeaderMenu = ({
    contextMenu,
    handleClose,
    columns,
    visibleColumns: _visibleColumns,
    grouping,
    summaryColumns,
    showSummary,
    sortBy,
    orderBy,
    order,
    onSortAsc,
    onSortDesc,
    onClearSort,
    onHideColumn,
    onToggleGroup,
    onToggleSummary,
    onOpenSortDialog,
}: CTableHeaderMenuProps) => {
    const { t } = useOrbcafeI18n();
    const columnId = contextMenu?.columnId ?? '';
    const column = columns.find((c) => c.id === columnId);
    const isGrouped = grouping.includes(columnId);
    const isSummed = summaryColumns.includes(columnId);
    const isNumeric = Boolean(column?.numeric);

    // Determine current sort state for this column from sortBy or single-column orderBy.
    const multiRule = sortBy.find((rule) => rule.field === columnId);
    const sortedAsc = multiRule ? multiRule.direction === 'asc' : orderBy === columnId && order === 'asc';
    const sortedDesc = multiRule ? multiRule.direction === 'desc' : orderBy === columnId && order === 'desc';
    const hasSort = sortedAsc || sortedDesc;

    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
            }
        >
            <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 700 }}>
                <ListItemText primary={column?.label ?? columnId} />
            </MenuItem>
            <Divider />
            <MenuItem
                onClick={() => {
                    onSortAsc(columnId);
                    handleClose();
                }}
                selected={sortedAsc}
            >
                <ListItemIcon><ArrowUpwardIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary={t('table.headerMenu.sortAsc')} />
            </MenuItem>
            <MenuItem
                onClick={() => {
                    onSortDesc(columnId);
                    handleClose();
                }}
                selected={sortedDesc}
            >
                <ListItemIcon><ArrowDownwardIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary={t('table.headerMenu.sortDesc')} />
            </MenuItem>
            {hasSort && (
                <MenuItem
                    onClick={() => {
                        onClearSort(columnId);
                        handleClose();
                    }}
                >
                    <ListItemIcon><ClearAllIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={t('table.headerMenu.clearSort')} />
                </MenuItem>
            )}
            <MenuItem
                onClick={() => {
                    onOpenSortDialog();
                    handleClose();
                }}
            >
                <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary={t('table.headerMenu.configureSort')} />
            </MenuItem>
            <Divider />
            <MenuItem
                onClick={() => {
                    onToggleGroup(columnId);
                    handleClose();
                }}
                selected={isGrouped}
            >
                <ListItemIcon><AccountTreeIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                    primary={isGrouped ? t('table.headerMenu.ungroup') : t('table.headerMenu.group')}
                />
            </MenuItem>
            {isNumeric && showSummary && (
                <MenuItem
                    onClick={() => {
                        onToggleSummary(columnId);
                        handleClose();
                    }}
                    selected={isSummed}
                >
                    <ListItemIcon><FunctionsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText
                        primary={
                            isSummed ? t('table.headerMenu.removeSummary') : t('table.headerMenu.addSummary')
                        }
                    />
                </MenuItem>
            )}
            <Divider />
            <MenuItem
                onClick={() => {
                    onHideColumn(columnId);
                    handleClose();
                }}
            >
                <ListItemIcon><VisibilityOffIcon fontSize="small" /></ListItemIcon>
                <ListItemText primary={t('table.headerMenu.hideColumn')} />
            </MenuItem>
        </Menu>
    );
};

// --- Sort Rules Dialog ---
// Multi-column sort configuration, opened from the toolbar Sort button or the header menu.
// Lets users add/remove ordered rules with direction, then apply or clear.
export interface CTableSortDialogProps {
    open: boolean;
    onClose: () => void;
    columns: Column[];
    initialRules: Array<{ field: string; direction: 'asc' | 'desc' }>;
    onApply: (rules: Array<{ field: string; direction: 'asc' | 'desc' }>) => void;
    onClear: () => void;
}

export const CTableSortDialog = ({
    open,
    onClose,
    columns,
    initialRules,
    onApply,
    onClear,
}: CTableSortDialogProps) => {
    const { t } = useOrbcafeI18n();
    const [rules, setRules] = useState<Array<{ field: string; direction: 'asc' | 'desc' }>>([]);

    useEffect(() => {
        if (open) {
            setRules(initialRules.length > 0 ? initialRules.map((r) => ({ ...r })) : []);
        }
    }, [open, initialRules]);

    const usedFields = useMemo(() => new Set(rules.map((r) => r.field)), [rules]);
    const availableColumns = useMemo(
        () => columns.filter((c) => !usedFields.has(c.id)),
        [columns, usedFields],
    );

    const addRule = () => {
        const next = availableColumns[0];
        if (!next) return;
        setRules((prev) => [...prev, { field: next.id, direction: 'asc' }]);
    };

    const removeRule = (idx: number) => {
        setRules((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateRule = (idx: number, patch: Partial<{ field: string; direction: 'asc' | 'desc' }>) => {
        setRules((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    };

    const moveRule = (idx: number, delta: number) => {
        setRules((prev) => {
            const target = idx + delta;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            const [item] = next.splice(idx, 1);
            next.splice(target, 0, item);
            return next;
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('table.sortDialog.title')}</DialogTitle>
            <DialogContent dividers>
                {rules.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                        {t('table.sortDialog.empty')}
                    </Typography>
                ) : (
                    <Stack spacing={1}>
                        {rules.map((rule, idx) => {
                            const otherFields = new Set(rules.filter((_, i) => i !== idx).map((r) => r.field));
                            const fieldOptions = columns.filter((c) => !otherFields.has(c.id));
                            return (
                                <Box
                                    key={`sort-rule-${idx}`}
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '24px 1fr 110px auto auto',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <Badge badgeContent={idx + 1} color="primary" sx={{ ml: 0.5 }} />
                                    <select
                                        value={rule.field}
                                        onChange={(e) => updateRule(idx, { field: e.target.value })}
                                        style={{ padding: 6, fontSize: 13, borderRadius: 4 }}
                                    >
                                        {fieldOptions.map((col) => (
                                            <option key={col.id} value={col.id}>{col.label}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={rule.direction}
                                        onChange={(e) => updateRule(idx, { direction: e.target.value as 'asc' | 'desc' })}
                                        style={{ padding: 6, fontSize: 13, borderRadius: 4 }}
                                    >
                                        <option value="asc">{t('table.sortDialog.asc')}</option>
                                        <option value="desc">{t('table.sortDialog.desc')}</option>
                                    </select>
                                    <IconButton size="small" onClick={() => moveRule(idx, -1)} disabled={idx === 0}>
                                        <ArrowUpwardIcon fontSize="small" />
                                    </IconButton>
                                    <Stack direction="row">
                                        <IconButton size="small" onClick={() => moveRule(idx, 1)} disabled={idx === rules.length - 1}>
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => removeRule(idx)}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
                <Button
                    size="small"
                    onClick={addRule}
                    disabled={availableColumns.length === 0}
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                >
                    {t('table.sortDialog.addRule')}
                </Button>
            </DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={() => { onClear(); onClose(); }}>
                    {t('table.sortDialog.clearAll')}
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button variant="contained" onClick={() => { onApply(rules); onClose(); }}>
                    {t('common.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
