import React from 'react';
import {
    Toolbar,
    IconButton,
    Tooltip,
    TextField,
    Box,
    Badge,
    InputAdornment,
    Typography,
    Select,
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FunctionsIcon from '@mui/icons-material/Functions';
import InsightsIcon from '@mui/icons-material/Insights';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useOrbcafeI18n } from '../../../i18n';

export const CTableToolbar = (props: any) => {
    const { t } = useOrbcafeI18n();
    const FONT_SIZE_SMALL = '0.85rem';
    const actionNodes = Array.isArray(props.actions) ? props.actions : props.actions ? [props.actions] : [];
    const extraToolNodes = Array.isArray(props.extraTools) ? props.extraTools : props.extraTools ? [props.extraTools] : [];
    const customToolNodes = [...actionNodes, ...extraToolNodes];
    const rowsPerPage = typeof props.rowsPerPage === 'number' ? props.rowsPerPage : 20;
    const rowsPerPageOptions = Array.isArray(props.rowsPerPageOptions) && props.rowsPerPageOptions.length > 0
        ? props.rowsPerPageOptions
        : [20, 50, 100, -1];
    const totalCount = typeof props.count === 'number' ? props.count : 0;
    const currentPage = Math.max(0, typeof props.page === 'number' ? props.page : 0);
    const totalPages = rowsPerPage === -1 ? 1 : Math.max(1, Math.ceil(totalCount / rowsPerPage));
    const displayPage = Math.min(currentPage + 1, totalPages);
    const canGoPrev = currentPage > 0;
    const canGoNext = currentPage < totalPages - 1 && rowsPerPage !== -1;

    return (
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, alignItems: 'center', gap: 1 }}>
            <TextField
                size="small"
                placeholder={t('table.toolbar.searchPlaceholder')}
                value={props.filterText}
                onChange={(e) => props.setFilterText(e.target.value)}
                InputProps={{
                    sx: {
                        fontSize: FONT_SIZE_SMALL,
                        '& .MuiInputBase-input': {
                            fontSize: FONT_SIZE_SMALL,
                        },
                        '& .MuiInputBase-input::placeholder': {
                            fontSize: FONT_SIZE_SMALL,
                            opacity: 1,
                        },
                    },
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{ width: 300 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <Typography sx={{ fontSize: FONT_SIZE_SMALL, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {t('table.toolbar.itemsPerPage')}
                </Typography>
                <Select
                    size="small"
                    variant="standard"
                    value={rowsPerPage}
                    disableUnderline
                    onChange={(event) => props.onRowsPerPageChange?.(Number(event.target.value))}
                    sx={{
                        fontSize: FONT_SIZE_SMALL,
                        fontWeight: 600,
                        minWidth: 64,
                        '& .MuiSelect-select': { py: 0.25, pr: '16px !important' },
                    }}
                >
                    {rowsPerPageOptions.map((option: number) => (
                        <MenuItem key={`rows-per-page-${option}`} value={option} sx={{ fontSize: FONT_SIZE_SMALL }}>
                            {option === -1 ? t('common.all') : option}
                        </MenuItem>
                    ))}
                </Select>

                <IconButton
                    size="small"
                    onClick={() => props.onPageChange?.(Math.max(currentPage - 1, 0))}
                    disabled={!canGoPrev}
                    sx={{ p: 0.35 }}
                >
                    <KeyboardArrowLeftIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ fontSize: FONT_SIZE_SMALL, fontWeight: 600, minWidth: 88, textAlign: 'center' }}>
                    {t('table.toolbar.pageOf', { current: displayPage, total: totalPages })}
                </Typography>
                <IconButton
                    size="small"
                    onClick={() => props.onPageChange?.(Math.min(currentPage + 1, totalPages - 1))}
                    disabled={!canGoNext}
                    sx={{ p: 0.35 }}
                >
                    <KeyboardArrowRightIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {customToolNodes.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {customToolNodes.map((node: React.ReactNode, idx: number) => (
                            <React.Fragment key={`toolbar-custom-${idx}`}>{node}</React.Fragment>
                        ))}
                    </Box>
                )}

                <Box
                    sx={{
                        width: '1px',
                        height: 20,
                        bgcolor: 'divider',
                        mx: 0.5,
                    }}
                />

                {/* Grouping */}
                <Tooltip title={t('table.toolbar.groupBy')}>
                    <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => props.setGroupAnchorEl(e.currentTarget)}>
                        <Badge badgeContent={props.grouping?.length} color="primary">
                            <AccountTreeIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* Summary */}
                <Tooltip title={t('table.toolbar.summary')}>
                    <IconButton 
                        onClick={(e: React.MouseEvent<HTMLElement>) => props.setSummaryAnchorEl(e.currentTarget)}
                        color={props.showSummary ? 'primary' : 'default'}
                    >
                        <FunctionsIcon />
                    </IconButton>
                </Tooltip>

                {/* Columns */}
                <Tooltip title={t('table.toolbar.columns')}>
                    <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => props.setAnchorEl(e.currentTarget)}>
                        <ViewColumnIcon />
                    </IconButton>
                </Tooltip>

                {/* Export */}
                <Tooltip title={t('table.toolbar.export')}>
                    <IconButton onClick={props.handleExport}>
                        <DownloadIcon />
                    </IconButton>
                </Tooltip>

                {props.showCreateButton && (
                    <Tooltip title={t('table.toolbar.newItem')}>
                        <IconButton onClick={props.onOpenCreateDialog} color="primary">
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                )}

                {props.showEditButton && (
                    <Tooltip title={t('table.toolbar.editItem')}>
                        <span>
                            <IconButton
                                onClick={props.onOpenEditDialog}
                                color="primary"
                                disabled={Boolean(props.editDisabled)}
                            >
                                <EditIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {props.showDeleteButton && (
                    <Tooltip title={t('table.toolbar.deleteItem')}>
                        <span>
                            <IconButton
                                onClick={props.onOpenDeleteConfirm}
                                color="error"
                                disabled={Boolean(props.deleteDisabled)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                )}

                {/* Layout Save */}
                {/* 
                  Only show the standalone Save button if NO layout manager is provided.
                  If layoutManager is provided, it handles the UI (including Save Dialog).
                */}
                {props.onOpenGraphReport && (
                    <Tooltip title={t('table.toolbar.graphicReport')}>
                        <IconButton onClick={props.onOpenGraphReport}>
                            <InsightsIcon />

                        </IconButton>
                    </Tooltip>
                )}

                {props.onLayoutSave && !props.layoutManager && (
                    <Tooltip title={t('table.toolbar.saveLayout')}>
                        <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => props.onLayoutSave(e)}>
                            <SaveIcon />
                        </IconButton>
                    </Tooltip>
                )}
                
                {/* Hidden Layout Manager for persistence logic */}
                {props.layoutManager}
            </Box>
        </Toolbar>
    );
};
