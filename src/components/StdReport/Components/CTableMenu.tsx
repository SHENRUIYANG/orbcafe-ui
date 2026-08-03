import { AccountTreeIcon, AddIcon, ArrowDownwardIcon, ArrowUpwardIcon, Badge, CListItemIcon, CListItemText, CheckIcon, ClearAllIcon, DeleteOutlineIcon, FormControlLabel, FunctionsIcon, Switch, VisibilityOffIcon } from '../../../lib/orbis-compat';
import { useEffect, useMemo, useState } from 'react';
import {  CButton, CIconButton, CStack, CTypography, CCheckbox, CDialog, CMenu, CDivider, CSelect } from "../../Atoms";
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
}

export const CTableGroupMenu = ({
    groupAnchorEl,
    setGroupAnchorEl,
    grouping,
    setGrouping,
    columns
}: CTableGroupMenuProps) => {
    const { t } = useOrbcafeI18n();
    const [draftGrouping, setDraftGrouping] = useState<string[]>(grouping);

    useEffect(() => {
        if (groupAnchorEl) setDraftGrouping(grouping);
    }, [groupAnchorEl, grouping]);

    const handleDismiss = () => {
        setDraftGrouping(grouping);
        setGroupAnchorEl(null);
    };
    const handleToggleDraftField = (field: string) => {
        setDraftGrouping((current) => current.includes(field)
            ? current.filter((item) => item !== field)
            : [...current, field]);
    };
    const handleApply = () => {
        setGrouping(draftGrouping);
        setGroupAnchorEl(null);
    };

    return (
        <CMenu
            anchorEl={groupAnchorEl}
            open={Boolean(groupAnchorEl)}
            onClose={handleDismiss}
            sx={{ width: 224, minWidth: 224, maxHeight: 360, overflowY: 'auto' }}
        >
            <div className="orb-table-group-menu-header" onClick={(event) => event.stopPropagation()}>
                <CTypography className="orb-table-group-menu-title" variant="subtitle2">
                    {t('table.menu.groupBy')}
                </CTypography>
                {draftGrouping.length > 0 && (
                    <CButton
                        className="orb-table-group-menu-clear"
                        size="small"
                        color="error"
                        onClick={(event) => {
                            event.stopPropagation();
                            setDraftGrouping([]);
                        }}
                    >
                        {t('table.menu.clearAll')}
                    </CButton>
                )}
            </div>
            <CDivider className="orb-table-group-menu-divider" />
            {columns.map((col) => {
                const isSelected = draftGrouping.includes(col.id);
                const order = draftGrouping.indexOf(col.id) + 1;

                return (
                    <option
                        key={col.id}
                        className="orb-table-group-menu-option"
                        selected={isSelected}
                        onClick={(event) => {
                            event.stopPropagation();
                            handleToggleDraftField(col.id);
                        }}
                    >
                        <div className="orb-table-group-menu-option-content">
                            <CCheckbox className="orb-table-group-menu-checkbox" checked={isSelected} size="small" />
                            <CListItemText className="orb-table-group-menu-label" primary={col.label} />
                            {isSelected && (
                                <span className="orb-table-group-menu-order" aria-label={`${t('table.menu.groupBy')} ${order}`}>
                                    {order}
                                </span>
                            )}
                        </div>
                    </option>
                );
            })}
            <div className="orb-table-group-menu-footer">
                <CButton size="small" variant="ghost" onClick={handleDismiss}>
                    {t('common.cancel')}
                </CButton>
                <CButton size="small" variant="primary" onClick={handleApply}>
                    {t('common.ok')}
                </CButton>
            </div>
        </CMenu>
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
        <CMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >
            <option disabled>
                <CListItemText primary={t('table.menu.visibleColumns')} />
            </option>
            <CDivider />
            {columns.map((col) => (
                <option key={col.id} onClick={() => toggleColumnVisibility(col.id)}>
                    <CCheckbox checked={visibleColumns.includes(col.id)} size="small" />
                    <CListItemText primary={col.label} />
                </option>
            ))}
        </CMenu>
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
        <CMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
        >
            <option>
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
            </option>
            <CDivider />
            {columns.filter(col => col.numeric).map((col) => (
                <option key={col.id} onClick={() => toggleSummaryColumn(col.id)} disabled={!showSummary}>
                    <CCheckbox checked={summaryColumns.includes(col.id)} size="small" />
                    <CListItemText primary={col.label} />
                </option>
            ))}
            {columns.filter(col => col.numeric).length === 0 && (
                <option disabled>
                    <CListItemText primary={t('table.menu.noNumericColumns')} />
                </option>
            )}
        </CMenu>
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
        <CMenu
            open={contextMenu !== null}
            onClose={handleCloseContextMenu}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <option onClick={handleCloseContextMenu}>{t('common.copy')}</option>
            <CDivider />
            <option disabled>{t('table.menu.visibleColumns')}</option>
            {columns.map((col) => (
                <option key={col.id} onClick={() => toggleColumnVisibility(col.id)}>
                    <CListItemIcon>
                        {visibleColumns.includes(col.id) && <CheckIcon fontSize="small" />}
                    </CListItemIcon>
                    <CListItemText>{col.label}</CListItemText>
                </option>
            ))}
        </CMenu>
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
        <CMenu
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
            }
        >
            <option disabled sx={{ opacity: '1 !important', fontWeight: 700 }}>
                <CListItemText primary={column?.label ?? columnId} />
            </option>
            <CDivider />
            <option
                onClick={() => {
                    onSortAsc(columnId);
                    handleClose();
                }}
                selected={sortedAsc}
            >
                <CListItemIcon><ArrowUpwardIcon fontSize="small" /></CListItemIcon>
                <CListItemText primary={t('table.headerMenu.sortAsc')} />
            </option>
            <option
                onClick={() => {
                    onSortDesc(columnId);
                    handleClose();
                }}
                selected={sortedDesc}
            >
                <CListItemIcon><ArrowDownwardIcon fontSize="small" /></CListItemIcon>
                <CListItemText primary={t('table.headerMenu.sortDesc')} />
            </option>
            {hasSort && (
                <option
                    onClick={() => {
                        onClearSort(columnId);
                        handleClose();
                    }}
                >
                    <CListItemIcon><ClearAllIcon fontSize="small" /></CListItemIcon>
                    <CListItemText primary={t('table.headerMenu.clearSort')} />
                </option>
            )}
            <option
                onClick={() => {
                    onOpenSortDialog();
                    handleClose();
                }}
            >
                <CListItemIcon><AddIcon fontSize="small" /></CListItemIcon>
                <CListItemText primary={t('table.headerMenu.configureSort')} />
            </option>
            <CDivider />
            <option
                onClick={() => {
                    onToggleGroup(columnId);
                    handleClose();
                }}
                selected={isGrouped}
            >
                <CListItemIcon><AccountTreeIcon fontSize="small" /></CListItemIcon>
                <CListItemText
                    primary={isGrouped ? t('table.headerMenu.ungroup') : t('table.headerMenu.group')}
                />
            </option>
            {isNumeric && showSummary && (
                <option
                    onClick={() => {
                        onToggleSummary(columnId);
                        handleClose();
                    }}
                    selected={isSummed}
                >
                    <CListItemIcon><FunctionsIcon fontSize="small" /></CListItemIcon>
                    <CListItemText
                        primary={
                            isSummed ? t('table.headerMenu.removeSummary') : t('table.headerMenu.addSummary')
                        }
                    />
                </option>
            )}
            <CDivider />
            <option
                onClick={() => {
                    onHideColumn(columnId);
                    handleClose();
                }}
            >
                <CListItemIcon><VisibilityOffIcon fontSize="small" /></CListItemIcon>
                <CListItemText primary={t('table.headerMenu.hideColumn')} />
            </option>
        </CMenu>
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
        <CDialog
            open={open}
            onClose={onClose}
            maxWidth={620}
            fullWidth
            className="orb-table-sort-dialog"
            title={t('table.sortDialog.title')}
            actions={(
                <>
                    <CButton
                        className="orb-table-sort-clear"
                        variant="neutral"
                        disabled={rules.length === 0 && initialRules.length === 0}
                        onClick={() => { onClear(); onClose(); }}
                    >
                        {t('table.sortDialog.clearAll')}
                    </CButton>
                    <span className="orb-table-sort-action-spacer" />
                    <CButton variant="neutral" onClick={onClose}>{t('common.cancel')}</CButton>
                    <CButton variant="primary" onClick={() => { onApply(rules); onClose(); }}>
                        {t('common.ok')}
                    </CButton>
                </>
            )}
        >
            <div className="orb-table-sort-dialog-content">
                {rules.length === 0 ? (
                    <CTypography className="orb-table-sort-empty" variant="body2">
                        {t('table.sortDialog.empty')}
                    </CTypography>
                ) : (
                    <CStack className="orb-table-sort-rules" spacing={1}>
                        {rules.map((rule, idx) => {
                            const otherFields = new Set(rules.filter((_, i) => i !== idx).map((r) => r.field));
                            const fieldOptions = columns.filter((c) => !otherFields.has(c.id));
                            return (
                                <div
                                    key={`sort-rule-${idx}`}
                                    className="orb-table-sort-rule"
                                >
                                    <Badge className="orb-table-sort-order" badgeContent={idx + 1} color="primary" />
                                    <CSelect
                                        size="small"
                                        value={rule.field}
                                        onChange={(e) => updateRule(idx, { field: e.target.value })}
                                        options={fieldOptions.map((col) => ({ value: col.id, label: col.label }))}
                                    />
                                    <CSelect
                                        size="small"
                                        value={rule.direction}
                                        onChange={(e) => updateRule(idx, { direction: e.target.value as 'asc' | 'desc' })}
                                        options={[
                                            { value: 'asc', label: t('table.sortDialog.asc') },
                                            { value: 'desc', label: t('table.sortDialog.desc') },
                                        ]}
                                    />
                                    <CIconButton className="orb-table-sort-icon-button" size="small" onClick={() => moveRule(idx, -1)} disabled={idx === 0}>
                                        <ArrowUpwardIcon fontSize="small" />
                                    </CIconButton>
                                    <CIconButton className="orb-table-sort-icon-button" size="small" onClick={() => moveRule(idx, 1)} disabled={idx === rules.length - 1}>
                                        <ArrowDownwardIcon fontSize="small" />
                                    </CIconButton>
                                    <CIconButton className="orb-table-sort-icon-button orb-table-sort-delete" size="small" onClick={() => removeRule(idx)}>
                                        <DeleteOutlineIcon fontSize="small" />
                                    </CIconButton>
                                </div>
                            );
                        })}
                    </CStack>
                )}
                <CButton
                    size="small"
                    onClick={addRule}
                    disabled={availableColumns.length === 0}
                    startIcon={<AddIcon />}
                    variant="secondary"
                    className="orb-table-sort-add"
                >
                    {t('table.sortDialog.addRule')}
                </CButton>
            </div>
        </CDialog>
    );
};
