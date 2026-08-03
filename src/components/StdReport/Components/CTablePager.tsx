import { KeyboardArrowLeftIcon, KeyboardArrowRightIcon } from '../../../lib/orbis-compat';
import { CIconButton, CSelect, CTooltip, CTypography } from '../../Atoms';
import { useOrbcafeI18n } from '../../../i18n';
import { tableToolbarIconButtonSx } from './ctableControlSx';

export interface CTablePagerProps {
    rowsPerPage?: number;
    rowsPerPageOptions?: number[];
    page?: number;
    count?: number;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    onPageChange?: (page: number) => void;
}

const rowsPerPageSelectSx = {
    fontSize: '0.85rem',
    width: 62,
    minWidth: 62,
    '& .orb-select-trigger': {
        minHeight: '32px !important',
        height: '32px !important',
        padding: '0 8px !important',
    },
    '& .orb-select-chevron': {
        width: '11px !important',
        height: '11px !important',
        fontSize: '11px !important',
    },
} as const;

export const CTablePager = ({
    rowsPerPage = 20,
    rowsPerPageOptions = [20, 50, 100, -1],
    page = 0,
    count = 0,
    onRowsPerPageChange,
    onPageChange,
}: CTablePagerProps) => {
    const { t } = useOrbcafeI18n();
    const normalizedOptions = rowsPerPageOptions.length > 0 ? rowsPerPageOptions : [20, 50, 100, -1];
    const currentPage = Math.max(0, page);
    const totalPages = rowsPerPage === -1 ? 1 : Math.max(1, Math.ceil(count / rowsPerPage));
    const displayPage = Math.min(currentPage + 1, totalPages);
    const canGoPrev = currentPage > 0;
    const canGoNext = currentPage < totalPages - 1 && rowsPerPage !== -1;

    return (
        <div className="orb-table-pager">
            <CTypography className="orb-table-pager-label">
                {t('table.toolbar.itemsPerPage')}
            </CTypography>
            <CTooltip title={t('table.toolbar.itemsPerPage')}>
                <CSelect
                    size="small"
                    variant="standard"
                    value={rowsPerPage}
                    aria-label={t('table.toolbar.itemsPerPage')}
                    fullWidth={false}
                    disableUnderline
                    onChange={(event) => onRowsPerPageChange?.(Number(event.target.value))}
                    sx={rowsPerPageSelectSx}
                >
                    {normalizedOptions.map((option) => (
                        <option key={`rows-per-page-${option}`} value={option}>
                            {option === -1 ? t('common.all') : option}
                        </option>
                    ))}
                </CSelect>
            </CTooltip>
            <span className="orb-table-pager-divider" />
            <CIconButton
                className="orb-table-pager-button"
                aria-label="Previous page"
                size="small"
                onClick={() => onPageChange?.(Math.max(currentPage - 1, 0))}
                disabled={!canGoPrev}
                sx={tableToolbarIconButtonSx}
            >
                <KeyboardArrowLeftIcon />
            </CIconButton>
            <CTypography
                className="orb-table-pager-page"
                title={t('table.toolbar.pageOf', { current: displayPage, total: totalPages })}
            >
                {displayPage} / {totalPages}
            </CTypography>
            <CIconButton
                className="orb-table-pager-button"
                aria-label="Next page"
                size="small"
                onClick={() => onPageChange?.(Math.min(currentPage + 1, totalPages - 1))}
                disabled={!canGoNext}
                sx={tableToolbarIconButtonSx}
            >
                <KeyboardArrowRightIcon />
            </CIconButton>
        </div>
    );
};
