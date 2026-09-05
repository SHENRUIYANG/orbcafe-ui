'use client';

/**
 * @file CCardDetailPanel.tsx
 * @summary Centered floating detail card for the ORBCAFE CardPage card grid.
 *
 * @description
 * Modal-style floating card showing the full content of a selected
 * CCardItem: icon, title, meta, complete description and any additional
 * primitive item fields as label/value rows. Includes the download action
 * so users can act directly from the detail view.
 *
 * Centered (rather than side-anchored) to keep the pointer travel distance
 * short from the card action buttons.
 *
 * Rendered by CCardGrid when its built-in `detailPanel` is enabled; can also
 * be used standalone for custom flows.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { CButton, CIconButton, CStack, CTypography } from '../Atoms';
import { SapIcon } from '../Icons';
import { useOrbcafeI18n } from '../../i18n';
import { useOrbMode } from '../../lib/theme';
import type { CCardItem } from './CCardGrid';

export interface CCardDetailPanelProps {
    /** Item to display; panel is only meaningful when non-null */
    item: CCardItem;
    /** Whether the panel is visible (drives the slide/fade transition) */
    open: boolean;
    /** Close handler (backdrop click, Esc key, close button) */
    onClose: () => void;
    /** "Download" handler for the panel footer action */
    onDownloadClick?: (item: CCardItem) => void;
    /** Custom body renderer; replaces the default description + fields body */
    renderContent?: (item: CCardItem) => React.ReactNode;
    /** Tooltip/label overrides (i18n defaults are used when omitted) */
    downloadTooltip?: string;
    closeTooltip?: string;
}

/** Item keys rendered by the dedicated header/description areas */
const INTERNAL_KEYS = new Set(['id', 'title', 'description', 'icon', 'iconNode', 'meta']);

const prettifyKey = (key: string): string =>
    key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[._-]+/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();

const extractExtraFields = (item: CCardItem): { key: string; label: string; value: string }[] =>
    Object.entries(item)
        .filter(([key, value]) =>
            !INTERNAL_KEYS.has(key) &&
            value !== null &&
            value !== undefined &&
            ['string', 'number', 'boolean'].includes(typeof value),
        )
        .map(([key, value]) => ({ key, label: prettifyKey(key), value: String(value) }));

export const CCardDetailPanel = ({
    item,
    open,
    onClose,
    onDownloadClick,
    renderContent,
    downloadTooltip,
    closeTooltip,
}: CCardDetailPanelProps) => {
    const { t } = useOrbcafeI18n();
    const mode = useOrbMode();
    const iconColor = mode === 'dark' ? 'var(--orb-p300)' : 'var(--orb-primary)';

    // Esc closes the panel
    React.useEffect(() => {
        if (!open) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    const extraFields = extractExtraFields(item);

    // Portal to <body>: page containers (e.g. CPageTransition) carry
    // will-change: transform, which would turn position:fixed into
    // ancestor-relative positioning and clip the panel below the viewport.
    if (typeof document === 'undefined') return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={onClose}
                sx={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1299,
                    backgroundColor: 'rgba(1, 9, 26, 0.4)',
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? 'auto' : 'none',
                    transition: 'opacity 200ms ease',
                }}
            />
            {/* Panel: centered floating card */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={item.title}
                sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    zIndex: 1300,
                    width: 'min(520px, 92vw)',
                    maxHeight: '82vh',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    boxShadow: '0 24px 64px rgba(1, 9, 26, 0.3)',
                    transform: open
                        ? 'translate(-50%, -50%) scale(1)'
                        : 'translate(-50%, -47%) scale(0.96)',
                    opacity: open ? 1 : 0,
                    transition: 'transform 200ms ease, opacity 180ms ease',
                }}
            >
                {/* Header: icon + title + close */}
                <CStack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ p: 2.5, pb: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}
                >
                    <div
                        sx={{
                            width: 56,
                            height: 56,
                            flex: '0 0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'action.hover',
                        }}
                    >
                        {item.iconNode ?? (
                            <SapIcon name={item.icon ?? 'product'} size={30} style={{ color: iconColor }} />
                        )}
                    </div>
                    <div sx={{ flex: 1, minWidth: 0 }}>
                        <CTypography
                            component="div"
                            sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3, wordBreak: 'break-word' }}
                        >
                            {item.title}
                        </CTypography>
                        {item.meta ? (
                            <CTypography component="div" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                {item.meta}
                            </CTypography>
                        ) : null}
                    </div>
                    <CIconButton
                        tooltip={closeTooltip ?? t('cardPage.close')}
                        aria-label={closeTooltip ?? t('cardPage.close')}
                        onClick={onClose}
                    >
                        <SapIcon name="decline" size={18} />
                    </CIconButton>
                </CStack>

                {/* Body */}
                <div sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2.5 }}>
                    {renderContent ? (
                        renderContent(item)
                    ) : (
                        <>
                            {item.description ? (
                                <CTypography
                                    component="div"
                                    sx={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'text.primary' }}
                                >
                                    {item.description}
                                </CTypography>
                            ) : null}
                            {extraFields.length > 0 ? (
                                <div sx={{ mt: item.description ? 2.5 : 0, display: 'grid', gap: 1.5 }}>
                                    {extraFields.map((field) => (
                                        <div key={field.key}>
                                            <CTypography
                                                component="div"
                                                sx={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 600,
                                                    color: 'text.secondary',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.04em',
                                                }}
                                            >
                                                {field.label}
                                            </CTypography>
                                            <CTypography
                                                component="div"
                                                sx={{ fontSize: '0.88rem', color: 'text.primary', wordBreak: 'break-word' }}
                                            >
                                                {field.value}
                                            </CTypography>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>

                {/* Footer: actions */}
                {onDownloadClick ? (
                    <div sx={{ p: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                        <CButton
                            variant="contained"
                            sx={{ width: '100%' }}
                            startIcon={<SapIcon name="download" size={16} />}
                            onClick={() => onDownloadClick(item)}
                        >
                            {downloadTooltip ?? t('cardPage.download')}
                        </CButton>
                    </div>
                ) : null}
            </div>
        </>,
        document.body,
    );
};
