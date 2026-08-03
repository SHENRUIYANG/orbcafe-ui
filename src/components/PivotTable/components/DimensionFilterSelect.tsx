import React, { useMemo, useState } from 'react';
import { CButton, CCheckbox, CMenu, CTextField } from "../../Atoms";
import { useOrbcafeI18n } from '../../../i18n';

interface DimensionFilterSelectProps {
  options: string[];
  selectedValues: string[];
  onChange: (nextSelected: string[]) => void;
  minWidth?: number;
}

export const DimensionFilterSelect: React.FC<DimensionFilterSelectProps> = ({
  options,
  selectedValues,
  onChange,
  minWidth = 96,
}) => {
  const { t } = useOrbcafeI18n();
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const filteredOptions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return options;
    }
    return options.filter((option) => option.toLowerCase().includes(keyword));
  }, [options, searchText]);

  const allSelected = options.length > 0 && selectedValues.length === options.length;
  const triggerLabel = options.length === 0
    ? t('pivot.filter.na')
    : selectedValues.length === 0
      ? t('common.none')
      : allSelected
        ? t('common.all')
        : `${selectedValues.length}/${options.length}`;

  const toggleOption = (option: string) => {
    onChange(selectedValues.includes(option)
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option]);
  };

  return (
    <div sx={{ minWidth }} onClick={(event) => event.stopPropagation()} onMouseDown={(event) => event.stopPropagation()}>
      <CButton
        variant="outlined"
        size="small"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ minWidth, height: 26, px: 1, py: 0.35, fontSize: '0.72rem', justifyContent: 'space-between' }}
      >
        {triggerLabel}
      </CButton>
      <CMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: Math.max(minWidth, 220), maxHeight: 320, overflowY: 'auto', p: 0.5 } }}
      >
        <div onClick={(event) => event.stopPropagation()} sx={{ display: 'grid', gap: 0.4 }}>
          <CTextField
            size="small"
            placeholder={`${t('common.search')}...`}
            fullWidth
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            sx={{
              m: 0,
              '& .orb-inp': {
                fontSize: '0.75rem',
                py: 0.7,
              },
            }}
          />

          <div sx={{ px: 1, py: 0.5, borderBottom: '1px solid var(--orb-border)' }}>
          <CButton
            variant="text"
            size="small"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange(allSelected ? [] : options);
            }}
            sx={{
              minWidth: 'auto',
              px: 0,
              py: 0.2,
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {allSelected ? t('pivot.filter.deselectAll') : t('pivot.filter.selectAll')}
          </CButton>
          </div>

          {filteredOptions.length === 0 && (
          <div className="orb-menu-item" aria-disabled="true" sx={{ fontSize: '0.75rem' }}>
            {t('pivot.filter.noResults')}
          </div>
          )}

          {filteredOptions.map((option) => {
            const checked = selectedValues.includes(option);
            return (
              <div
                key={option}
                role="option"
                aria-selected={checked}
                tabIndex={0}
                className={`orb-menu-item ${checked ? 'orb-selected' : ''}`}
                onClick={() => toggleOption(option)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleOption(option);
                  }
                }}
                sx={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', py: 0.4 }}
              >
                <CCheckbox size="small" checked={checked} inputProps={{ tabIndex: -1 }} sx={{ p: 0.5, mr: 0.5, pointerEvents: 'none' }} />
                <span>{option}</span>
              </div>
            );
          })}
        </div>
      </CMenu>
    </div>
  );
};
