'use client';

/**
 * @file CCardGrid.tsx
 * @summary Card grid for store-like catalog pages (ORBCAFE CardPage).
 *
 * @description
 * Renders a responsive grid of application/content cards in the ORBIS style.
 * Each card shows:
 *  - an icon (SAP icon name or custom node)
 *  - a title
 *  - a short description clamped to 3 lines
 *  - a "view details" icon button and a "download" icon button
 */

import React from 'react';
import { CIconButton, CPaper, CSpinner, CStack, CTypography } from '../Atoms';
import { SapIcon, type SapIconName } from '../Icons';
import { useOrbcafeI18n } from '../../i18n';
import { useOrbMode } from '../../lib/theme';
import { CCardDetailPanel } from './CCardDetailPanel';

export interface CCardItem extends Record<string, unknown> {
    /** Unique item id */
    id: string;
    /** Card title */
    title: string;
    /** Short description, clamped to 3 lines */
    description?: string;
    /** SAP icon name for the card icon */
    icon?: SapIconName;
    /** Fully custom icon node (takes precedence over `icon`) */
    iconNode?: React.ReactNode;
    /** Optional small meta line (e.g. version, size, vendor) */
    meta?: string;
}

export interface CCardGridProps {
    /** Items to render */
    items: CCardItem[];
    /** Show loading spinner instead of the grid */
    loading?: boolean;
    /** "View details" handler (eye icon button) */
    onDetailClick?: (item: CCardItem) => void;
    /** "Download" handler (download icon button) */
    onDownloadClick?: (item: CCardItem) => void;
    /** Minimum card width in px; grid auto-fills columns. Default: 260 */
    minCardWidth?: number;
    /** Tooltip overrides (i18n defaults are used when omitted) */
    detailTooltip?: string;
    downloadTooltip?: string;
    /** Empty state text (i18n default when omitted) */
    emptyText?: string;
    /**
     * Built-in detail panel: clicking "view details" slides in a side panel
     * with the item's full content. Default: true. Set to false to handle
     * navigation yourself via `onDetailClick`.
     */
    detailPanel?: boolean;
    /** Custom content renderer for the detail panel body */
    renderDetailContent?: (item: CCardItem) => React.ReactNode;
}

// NOTE: `-webkit-line-clamp` only engages on non-flex-item elements (flex
// blockification rewrites display:-webkit-box), so the clamped typography is
// wrapped in a flex:1 container instead of carrying flex itself.
// Value must be a string: the sx resolver appends "px" to numeric values of
// unknown camelCase keys, which would invalidate the declaration.
const DESCRIPTION_CLAMP_SX = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '3',
    overflow: 'hidden',
} as const;

export const CCardGridCard = ({
    item,
    onDetailClick,
    onDownloadClick,
    detailTooltip,
    downloadTooltip,
}: {
    item: CCardItem;
    onDetailClick?: (item: CCardItem) => void;
    onDownloadClick?: (item: CCardItem) => void;
    detailTooltip?: string;
    downloadTooltip?: string;
}) => {
    const { t } = useOrbcafeI18n();
    const mode = useOrbMode();
    // --orb-primary (#154194 navy) is illegible on dark surfaces; the dark-mode
    // p300 ramp (primary mixed with white) keeps the brand hue visible there.
    const iconColor = mode === 'dark' ? 'var(--orb-p300)' : 'var(--orb-primary)';

    const iconContent = item.iconNode ?? (
        <SapIcon name={item.icon ?? 'product'} size={26} style={{ color: iconColor }} />
    );

    return (
        <CPaper
            elevation={0}
            sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)',
                transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.12)',
                },
            }}
        >
            {/* Header: icon + title */}
            <CStack direction="row" spacing={1.5} alignItems="center">
                <div
                    sx={{
                        width: 48,
                        height: 48,
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.hover',
                    }}
                >
                    {iconContent}
                </div>
                <div sx={{ flex: 1, minWidth: 0 }}>
                    <CTypography
                        component="div"
                        noWrap
                        sx={{ fontWeight: 700, fontSize: '0.98rem', lineHeight: 1.3 }}
                    >
                        {item.title}
                    </CTypography>
                    {item.meta ? (
                        <CTypography
                            component="div"
                            noWrap
                            sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                        >
                            {item.meta}
                        </CTypography>
                    ) : null}
                </div>
            </CStack>

            {/* Description: fixed 3-line clamp (wrapper carries flex, see DESCRIPTION_CLAMP_SX note) */}
            <div sx={{ mt: 1.5, flex: 1, minHeight: 0 }}>
                <CTypography
                    component="div"
                    sx={{
                        fontSize: '0.84rem',
                        lineHeight: 1.45,
                        color: 'text.primary',
                        ...DESCRIPTION_CLAMP_SX,
                    }}
                >
                    {item.description || '\u00a0'}
                </CTypography>
            </div>

            {/* Footer: actions */}
            <CStack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                <CIconButton
                    tooltip={detailTooltip ?? t('cardPage.viewDetails')}
                    aria-label={detailTooltip ?? t('cardPage.viewDetails')}
                    onClick={() => onDetailClick?.(item)}
                >
                    <SapIcon name="show" size={18} />
                </CIconButton>
                <CIconButton
                    tooltip={downloadTooltip ?? t('cardPage.download')}
                    aria-label={downloadTooltip ?? t('cardPage.download')}
                    onClick={() => onDownloadClick?.(item)}
                >
                    <SapIcon name="download" size={18} />
                </CIconButton>
            </CStack>
        </CPaper>
    );
};

export const CCardGrid = ({
    items,
    loading = false,
    onDetailClick,
    onDownloadClick,
    minCardWidth = 260,
    detailTooltip,
    downloadTooltip,
    emptyText,
    detailPanel = true,
    renderDetailContent,
}: CCardGridProps) => {
    const { t } = useOrbcafeI18n();
    const [detailItem, setDetailItem] = React.useState<CCardItem | null>(null);
    const [panelVisible, setPanelVisible] = React.useState(false);

    const openDetail = (item: CCardItem) => {
        onDetailClick?.(item);
        if (!detailPanel) return;
        setDetailItem(item);
        // Double rAF: mount the panel off-canvas first so the slide-in
        // transition actually plays on the next frame.
        requestAnimationFrame(() => requestAnimationFrame(() => setPanelVisible(true)));
    };

    const closeDetail = () => {
        setPanelVisible(false);
        // Unmount after the slide-out transition has finished.
        setTimeout(() => setDetailItem(null), 260);
    };

    if (loading) {
        return (
            <div sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
                <CSpinner />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
                <CTypography sx={{ color: 'text.secondary' }}>{emptyText ?? t('cardPage.empty')}</CTypography>
            </div>
        );
    }

    return (
        <>
            <div
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
                    gap: 2,
                    alignContent: 'start',
                    p: 0.5,
                }}
            >
                {items.map((item) => (
                    <CCardGridCard
                        key={item.id}
                        item={item}
                        onDetailClick={openDetail}
                        onDownloadClick={onDownloadClick}
                        detailTooltip={detailTooltip}
                        downloadTooltip={downloadTooltip}
                    />
                ))}
            </div>
            {detailPanel && detailItem ? (
                <CCardDetailPanel
                    item={detailItem}
                    open={panelVisible}
                    onClose={closeDetail}
                    onDownloadClick={onDownloadClick}
                    renderContent={renderDetailContent}
                    downloadTooltip={downloadTooltip}
                />
            ) : null}
        </>
    );
};
