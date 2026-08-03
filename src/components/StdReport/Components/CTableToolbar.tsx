import { AccountTreeIcon, AddIcon, Badge, DeleteIcon, DownloadIcon, EditIcon, FunctionsIcon, InsightsIcon, SaveIcon, Toolbar, ViewColumnIcon } from '../../../lib/orbis-compat';
import React from 'react';
import { CIconButton, CTooltip } from "../../Atoms";
import { useOrbcafeI18n } from '../../../i18n';
import { tableToolbarIconButtonSx } from './ctableControlSx';
import { CTablePager } from './CTablePager';
import { CTableToolbarSearch } from './CTableToolbarSearch';

export const CTableToolbar = (props: any) => {
    const { t } = useOrbcafeI18n();
    const actionNodes = Array.isArray(props.actions) ? props.actions : props.actions ? [props.actions] : [];
    const extraToolNodes = Array.isArray(props.extraTools) ? props.extraTools : props.extraTools ? [props.extraTools] : [];
    const customToolNodes = [...actionNodes, ...extraToolNodes];
    const hasRecordActions = Boolean(props.showCreateButton || props.showEditButton || props.showDeleteButton);
    const hasReportActions = Boolean(props.onOpenGraphReport || (props.onLayoutSave && !props.layoutManager) || props.layoutManager);

    return (
        <Toolbar
            className="orb-table-toolbar"
            role="toolbar"
            aria-label={t('table.title.default')}
        >
            <div className="orb-table-toolbar-primary">
                <CTableToolbarSearch
                    value={props.filterText}
                    onChange={(value) => {
                        props.setFilterText(value);
                        props.onPageChange?.(0);
                    }}
                />

                <CTablePager
                    rowsPerPage={props.rowsPerPage}
                    rowsPerPageOptions={props.rowsPerPageOptions}
                    page={props.page}
                    count={props.count}
                    onRowsPerPageChange={props.onRowsPerPageChange}
                    onPageChange={props.onPageChange}
                />

                {customToolNodes.length > 0 ? (
                    <div className="orb-table-toolbar-custom">
                        {customToolNodes.map((node: React.ReactNode, idx: number) => (
                            <React.Fragment key={`toolbar-custom-${idx}`}>{node}</React.Fragment>
                        ))}
                    </div>
                ) : null}

                <span className="orb-table-toolbar-spacer" />

                <div className="orb-table-toolbar-actions">
                    <div className="orb-table-tool-group">
                        {!props.disableGrouping && (
                            <CTooltip title={t('table.toolbar.groupBy')}>
                                <CIconButton className="orb-table-tool-button" sx={tableToolbarIconButtonSx} onClick={(e: React.MouseEvent<HTMLElement>) => props.setGroupAnchorEl(props.groupAnchorEl ? null : e.currentTarget)}>
                                    <Badge badgeContent={props.grouping?.length} color="primary" invisible={!props.grouping?.length}>
                                        <AccountTreeIcon />
                                    </Badge>
                                </CIconButton>
                            </CTooltip>
                        )}

                        <CTooltip title={t('table.toolbar.summary')}>
                            <CIconButton
                                className={`orb-table-tool-button ${props.showSummary ? 'orb-is-active' : ''}`}
                                active={Boolean(props.showSummary)}
                                sx={tableToolbarIconButtonSx}
                                onClick={(e: React.MouseEvent<HTMLElement>) => props.setSummaryAnchorEl(props.summaryAnchorEl ? null : e.currentTarget)}
                            >
                                <FunctionsIcon />
                            </CIconButton>
                        </CTooltip>

                        <CTooltip title={t('table.toolbar.columns')}>
                            <CIconButton className="orb-table-tool-button" sx={tableToolbarIconButtonSx} onClick={(e: React.MouseEvent<HTMLElement>) => props.setAnchorEl(props.anchorEl ? null : e.currentTarget)}>
                                <ViewColumnIcon />
                            </CIconButton>
                        </CTooltip>

                        <CTooltip title={t('table.toolbar.export')}>
                            <CIconButton className="orb-table-tool-button" sx={tableToolbarIconButtonSx} onClick={props.handleExport}>
                                <DownloadIcon />
                            </CIconButton>
                        </CTooltip>
                    </div>

                    {hasRecordActions && (
                        <div className="orb-table-tool-group">
                            {props.showCreateButton && (
                                <CTooltip title={t('table.toolbar.newItem')}>
                                    <CIconButton className="orb-table-tool-button" onClick={props.onOpenCreateDialog} color="primary.main" sx={tableToolbarIconButtonSx}>
                                        <AddIcon />
                                    </CIconButton>
                                </CTooltip>
                            )}

                            {props.showEditButton && (
                                <CTooltip title={t('table.toolbar.editItem')}>
                                    <span>
                                        <CIconButton
                                            className="orb-table-tool-button"
                                            onClick={props.onOpenEditDialog}
                                            color="primary.main"
                                            disabled={Boolean(props.editDisabled)}
                                            sx={tableToolbarIconButtonSx}
                                        >
                                            <EditIcon />
                                        </CIconButton>
                                    </span>
                                </CTooltip>
                            )}

                            {props.showDeleteButton && (
                                <CTooltip title={t('table.toolbar.deleteItem')}>
                                    <span>
                                        <CIconButton
                                            className="orb-table-tool-button"
                                            onClick={props.onOpenDeleteConfirm}
                                            disabled={Boolean(props.deleteDisabled)}
                                            sx={{ ...tableToolbarIconButtonSx, color: 'error.main' }}
                                        >
                                            <DeleteIcon />
                                        </CIconButton>
                                    </span>
                                </CTooltip>
                            )}
                        </div>
                    )}

                    {hasReportActions && (
                        <div className="orb-table-tool-group">
                            {props.onOpenGraphReport && (
                                <CTooltip title={t('table.toolbar.graphicReport')}>
                                    <CIconButton className="orb-table-tool-button" sx={tableToolbarIconButtonSx} onClick={props.onOpenGraphReport}>
                                        <InsightsIcon />
                                    </CIconButton>
                                </CTooltip>
                            )}

                            {props.onLayoutSave && !props.layoutManager && (
                                <CTooltip title={t('table.toolbar.saveLayout')}>
                                    <CIconButton className="orb-table-tool-button" sx={tableToolbarIconButtonSx} onClick={(e: React.MouseEvent<HTMLElement>) => props.onLayoutSave(e)}>
                                        <SaveIcon />
                                    </CIconButton>
                                </CTooltip>
                            )}

                            {props.layoutManager}
                        </div>
                    )}
                </div>
            </div>
        </Toolbar>
    );
};
