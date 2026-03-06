import React, { useMemo, useState } from 'react';
import { Box, Button, Checkbox, FormControl, ListItemText, ListSubheader, MenuItem, Select, TextField } from '@mui/material';
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

  const filteredOptions = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return options;
    }
    return options.filter((option) => option.toLowerCase().includes(keyword));
  }, [options, searchText]);

  const allSelected = options.length > 0 && selectedValues.length === options.length;

  return (
    <FormControl size="small" sx={{ minWidth }}>
      <Select
        multiple
        value={selectedValues}
        onChange={(event) => {
          const value = event.target.value;
          const nextSelected = typeof value === 'string' ? value.split(',') : value;
          onChange(nextSelected);
        }}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        renderValue={(selected) => {
          const selectedList = selected as string[];
          if (options.length === 0) return t('pivot.filter.na');
          if (selectedList.length === 0) return t('common.none');
          if (selectedList.length === options.length) return t('common.all');
          return `${selectedList.length}/${options.length}`;
        }}
        MenuProps={{ PaperProps: { sx: { maxHeight: 320, bgcolor: 'background.paper' } } }}
        sx={{
          fontSize: '0.72rem',
          height: 26,
          '& .MuiSelect-select': {
            py: 0.35,
          },
        }}
      >
        <ListSubheader
          disableSticky
          sx={(theme) => ({
            bgcolor: 'background.paper',
            py: 0.8,
            lineHeight: 'normal',
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <TextField
            size="small"
            placeholder={`${t('common.search')}...`}
            fullWidth
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            sx={{
              m: 0,
              '& .MuiInputBase-input': {
                fontSize: '0.75rem',
                py: 0.7,
              },
            }}
          />
        </ListSubheader>

        <Box
          sx={(theme) => ({
            px: 1.5,
            py: 0.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          })}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <Button
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
          </Button>
        </Box>

        {filteredOptions.length === 0 && (
          <MenuItem disabled sx={{ fontSize: '0.75rem' }}>
            {t('pivot.filter.noResults')}
          </MenuItem>
        )}

        {filteredOptions.map((option) => {
          const checked = selectedValues.includes(option);
          return (
            <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem', py: 0.25 }}>
              <Checkbox size="small" checked={checked} sx={{ p: 0.5, mr: 0.5 }} />
              <ListItemText primary={option} primaryTypographyProps={{ sx: { fontSize: '0.75rem', lineHeight: 1.2 } }} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
