import { InputAdornment, SearchIcon } from '../../../lib/orbis-compat';
import { CTextField } from '../../Atoms';
import { useOrbcafeI18n } from '../../../i18n';

export interface CTableToolbarSearchProps {
    value?: string;
    onChange?: (value: string) => void;
}

export const CTableToolbarSearch = ({ value = '', onChange }: CTableToolbarSearchProps) => {
    const { t } = useOrbcafeI18n();

    return (
        <div className="orb-table-toolbar-search">
            <CTextField
                className="orb-table-toolbar-search-field"
                size="small"
                placeholder={t('table.toolbar.searchPlaceholder')}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon size={16} />
                        </InputAdornment>
                    ),
                }}
            />
        </div>
    );
};
