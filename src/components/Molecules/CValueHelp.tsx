'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { TableCellProps, TextFieldProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

export type CValueHelpPrimitive = string | number;
export type CValueHelpMode = 'single' | 'multiple';
export type CValueHelpRecord = Record<string, unknown>;
export type CValueHelpSelectionValue = CValueHelpPrimitive | CValueHelpPrimitive[] | null;

export interface CValueHelpColumn<TRecord extends CValueHelpRecord = CValueHelpRecord> {
  field: keyof TRecord | string;
  label: string;
  minWidth?: number;
  width?: number | string;
  align?: TableCellProps['align'];
  searchable?: boolean;
  render?: (value: unknown, row: TRecord) => ReactNode;
}

export interface CValueHelpProps<TRecord extends CValueHelpRecord = CValueHelpRecord>
  extends Omit<TextFieldProps, 'children' | 'onChange' | 'select' | 'value'> {
  value?: CValueHelpSelectionValue;
  items?: TRecord[];
  columns?: CValueHelpColumn<TRecord>[];
  mode?: CValueHelpMode;
  dialogTitle?: string;
  searchPlaceholder?: string;
  selectLabel?: string;
  clearLabel?: string;
  cancelLabel?: string;
  valueHelpLabel?: string;
  noResultsText?: string;
  loading?: boolean;
  clearable?: boolean;
  allowManualInput?: boolean;
  validateManualInput?: boolean;
  manualInputErrorText?: string;
  selectedItems?: TRecord[];
  displayValue?: string;
  getOptionValue?: (item: TRecord) => CValueHelpPrimitive;
  getOptionLabel?: (item: TRecord) => string;
  getOptionDescription?: (item: TRecord) => string | undefined;
  onChange?: (value: CValueHelpSelectionValue, selection: TRecord | TRecord[] | null) => void;
  onSearch?: (query: string) => Promise<TRecord[] | void> | TRecord[] | void;
}

const DEFAULT_COLUMNS: CValueHelpColumn[] = [
  { field: 'value', label: 'Value', minWidth: 120 },
  { field: 'label', label: 'Description', minWidth: 180 },
];

const normalizeValue = (value: CValueHelpSelectionValue | undefined): CValueHelpPrimitive[] => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
};

const valueKey = (value: CValueHelpPrimitive): string => String(value);

const getFieldValue = <TRecord extends CValueHelpRecord>(item: TRecord, field: keyof TRecord | string): unknown => {
  return item[field as keyof TRecord];
};

const defaultGetOptionValue = <TRecord extends CValueHelpRecord>(item: TRecord): CValueHelpPrimitive => {
  const candidate = item.value ?? item.id ?? item.key ?? item.code;
  if (typeof candidate === 'number' || typeof candidate === 'string') return candidate;
  return '';
};

const defaultGetOptionLabel = <TRecord extends CValueHelpRecord>(item: TRecord): string => {
  const candidate = item.label ?? item.description ?? item.name ?? item.title;
  if (typeof candidate === 'number' || typeof candidate === 'string') return String(candidate);
  return String(defaultGetOptionValue(item));
};

const defaultGetOptionDescription = <TRecord extends CValueHelpRecord>(item: TRecord): string | undefined => {
  const candidate = item.description ?? item.subtitle;
  return typeof candidate === 'number' || typeof candidate === 'string' ? String(candidate) : undefined;
};

export const CValueHelp = <TRecord extends CValueHelpRecord = CValueHelpRecord,>({
  value = null,
  items = [],
  columns,
  mode = 'single',
  dialogTitle = 'Value Help',
  searchPlaceholder = 'Search values...',
  selectLabel = 'Select',
  clearLabel = 'Clear',
  cancelLabel = 'Cancel',
  valueHelpLabel = 'Open value help',
  noResultsText = 'No matching values',
  loading = false,
  clearable = true,
  allowManualInput = true,
  validateManualInput = true,
  manualInputErrorText = 'Enter a valid value.',
  selectedItems = [],
  displayValue,
  getOptionValue = defaultGetOptionValue,
  getOptionLabel = defaultGetOptionLabel,
  getOptionDescription = defaultGetOptionDescription,
  onChange,
  onSearch,
  disabled,
  InputProps,
  onFocus,
  onBlur,
  onKeyDown,
  error,
  helperText,
  ...textFieldProps
}: CValueHelpProps<TRecord>) => {
  const isMultiple = mode === 'multiple';
  const [open, setOpen] = useState(false);
  const [fieldFocused, setFieldFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [remoteItems, setRemoteItems] = useState<TRecord[] | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [pendingValues, setPendingValues] = useState<CValueHelpPrimitive[]>(() => normalizeValue(value));
  const [manualInputValue, setManualInputValue] = useState('');
  const [manualInputError, setManualInputError] = useState('');

  const tableColumns = useMemo<CValueHelpColumn<TRecord>[]>(() => {
    return columns && columns.length > 0 ? columns : (DEFAULT_COLUMNS as CValueHelpColumn<TRecord>[]);
  }, [columns]);

  const effectiveItems = remoteItems ?? items;

  const knownItems = useMemo(() => {
    const merged = [...selectedItems, ...items, ...(remoteItems ?? [])];
    const unique = new Map<string, TRecord>();
    merged.forEach((item) => {
      unique.set(valueKey(getOptionValue(item)), item);
    });
    return unique;
  }, [getOptionValue, items, remoteItems, selectedItems]);

  const selectedValues = useMemo(() => normalizeValue(value), [value]);
  const manualDisplayValue = useMemo(() => selectedValues.map(String).join(', '), [selectedValues]);

  useEffect(() => {
    if (!open) {
      setPendingValues(selectedValues);
    }
  }, [open, selectedValues]);

  useEffect(() => {
    if (!fieldFocused && !manualInputError) {
      setManualInputValue(manualDisplayValue);
    }
  }, [fieldFocused, manualDisplayValue, manualInputError]);

  const locallyFilteredItems = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || onSearch) return effectiveItems;

    const searchableColumns = tableColumns.filter((column) => column.searchable !== false);
    return effectiveItems.filter((item) => {
      const values = [
        getOptionValue(item),
        getOptionLabel(item),
        getOptionDescription(item),
        ...searchableColumns.map((column) => getFieldValue(item, column.field)),
      ];

      return values.some((candidate) => String(candidate ?? '').toLowerCase().includes(trimmed));
    });
  }, [effectiveItems, getOptionDescription, getOptionLabel, getOptionValue, onSearch, query, tableColumns]);

  const selectedDisplayValue = useMemo(() => {
    if (displayValue !== undefined) return displayValue;
    if (selectedValues.length === 0) return '';

    const formatItem = (primitive: CValueHelpPrimitive) => {
      const item = knownItems.get(valueKey(primitive));
      if (!item) return String(primitive);
      const label = getOptionLabel(item);
      return label && label !== String(primitive) ? `${primitive} - ${label}` : String(primitive);
    };

    if (isMultiple) {
      if (selectedValues.length > 2) return `${selectedValues.length} selected`;
      return selectedValues.map(formatItem).join(', ');
    }

    return formatItem(selectedValues[0]);
  }, [displayValue, getOptionLabel, isMultiple, knownItems, selectedValues]);

  const runSearch = useCallback(async () => {
    if (!onSearch) return;
    setInternalLoading(true);
    try {
      const result = await onSearch(query);
      if (Array.isArray(result)) {
        setRemoteItems(result);
      }
    } finally {
      setInternalLoading(false);
    }
  }, [onSearch, query]);

  const handleOpen = () => {
    if (disabled) return;
    setPendingValues(selectedValues);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClear = () => {
    const nextValue = isMultiple ? [] : null;
    onChange?.(nextValue, isMultiple ? [] : null);
    setPendingValues([]);
    setManualInputValue('');
    setManualInputError('');
  };

  const handleToggle = (item: TRecord) => {
    const primitive = getOptionValue(item);
    if (isMultiple) {
      setPendingValues((current) => {
        const exists = current.some((currentValue) => valueKey(currentValue) === valueKey(primitive));
        return exists
          ? current.filter((currentValue) => valueKey(currentValue) !== valueKey(primitive))
          : [...current, primitive];
      });
      return;
    }

    setPendingValues([primitive]);
  };

  const handleConfirm = () => {
    const selection = pendingValues
      .map((primitive) => knownItems.get(valueKey(primitive)))
      .filter((item): item is TRecord => Boolean(item));

    if (isMultiple) {
      onChange?.(pendingValues, selection);
    } else {
      onChange?.(pendingValues[0] ?? null, selection[0] ?? null);
    }
    setManualInputError('');
    setOpen(false);
  };

  const handleFieldKeyDown: TextFieldProps['onKeyDown'] = (event) => {
    if (event.key === 'F4') {
      event.preventDefault();
      handleOpen();
      return;
    }
    if (event.key === 'Enter' && allowManualInput) {
      const valid = commitManualInput(manualInputValue, true);
      if (!valid) {
        event.preventDefault();
        return;
      }
    }
    onKeyDown?.(event);
  };

  const validateManualValues = (nextValues: CValueHelpPrimitive[]) => {
    if (!validateManualInput) return true;
    return nextValues.every((nextValue) => knownItems.has(valueKey(nextValue)));
  };

  const commitManualInput = (nextInput: string, showError: boolean) => {
    if (isMultiple) {
      const nextValues = nextInput
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
      if (nextValues.length === 0) {
        setManualInputError('');
        onChange?.([], []);
        return true;
      }
      if (!validateManualValues(nextValues)) {
        if (showError) setManualInputError(manualInputErrorText);
        return false;
      }

      setManualInputError('');
      const selection = nextValues
        .map((nextValue) => knownItems.get(valueKey(nextValue)))
        .filter((item): item is TRecord => Boolean(item));
      onChange?.(nextValues, selection);
      return true;
    }

    const nextValue = nextInput.trim();
    if (!nextValue) {
      setManualInputError('');
      onChange?.(null, null);
      return true;
    }
    if (!validateManualValues([nextValue])) {
      if (showError) setManualInputError(manualInputErrorText);
      return false;
    }

    setManualInputError('');
    onChange?.(nextValue, knownItems.get(valueKey(nextValue)) ?? null);
    return true;
  };

  const handleManualInputChange: TextFieldProps['onChange'] = (event) => {
    if (!allowManualInput) return;

    const nextInput = event.target.value;
    setManualInputValue(nextInput);
    setManualInputError('');
    commitManualInput(nextInput, false);
  };

  const busy = loading || internalLoading;
  const hasValue = selectedValues.length > 0;
  const showManualDraft = allowManualInput && (fieldFocused || Boolean(manualInputError));
  const fieldValue = showManualDraft ? manualInputValue : selectedDisplayValue;

  return (
    <>
      <TextField
        {...textFieldProps}
        disabled={disabled}
        value={fieldValue}
        error={Boolean(manualInputError) || error}
        helperText={manualInputError || helperText}
        onChange={handleManualInputChange}
        onFocus={(event) => {
          setFieldFocused(true);
          setManualInputValue(manualDisplayValue);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          if (allowManualInput) {
            commitManualInput(manualInputValue, true);
          }
          setFieldFocused(false);
          onBlur?.(event);
        }}
        onKeyDown={handleFieldKeyDown}
        InputProps={{
          ...InputProps,
          readOnly: !allowManualInput,
          endAdornment: (
            <InputAdornment position="end">
              {busy ? <CircularProgress size={18} /> : null}
              {clearable && hasValue && !disabled ? (
                <Tooltip title={clearLabel}>
                  <IconButton size="small" edge="end" aria-label={clearLabel} onClick={handleClear}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : null}
              <Tooltip title={valueHelpLabel}>
                <span>
                  <IconButton size="small" edge="end" aria-label={valueHelpLabel} onClick={handleOpen} disabled={disabled}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: (theme) => ({
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 24px 80px ${alpha(theme.palette.common.black, 0.72)}`
                : `0 24px 80px ${alpha(theme.palette.common.black, 0.18)}`,
          }),
        }}
      >
        <DialogTitle
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 2.5,
            py: 2,
            pr: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
          })}
        >
          <Box>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.25 }}>{dialogTitle}</Typography>
            {isMultiple ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {`${pendingValues.length} selected`}
              </Typography>
            ) : null}
          </Box>
          <IconButton aria-label="Close" onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={(theme) => ({
              px: 2.5,
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.common.white, 0.025)
                  : alpha(theme.palette.primary.main, 0.035),
            })}
          >
            <TextField
              size="small"
              fullWidth
              value={query}
              placeholder={searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void runSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: (theme) => ({
                  borderRadius: 1,
                  bgcolor: theme.palette.background.paper,
                  '& fieldset': {
                    borderColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.2 : 0.16),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.52),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                }),
              }}
            />
            {onSearch ? (
              <Button
                variant="outlined"
                onClick={() => void runSearch()}
                disabled={busy}
                sx={{ minWidth: 96, textTransform: 'none', fontWeight: 700 }}
              >
                {busy ? <CircularProgress size={18} /> : 'Search'}
              </Button>
            ) : null}
          </Stack>

          <TableContainer sx={{ maxHeight: 420 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={(theme) => ({
                      bgcolor: theme.palette.mode === 'dark' ? '#111111' : theme.palette.background.paper,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    })}
                  />
                  {tableColumns.map((column) => (
                    <TableCell
                      key={String(column.field)}
                      align={column.align}
                      sx={(theme) => ({
                        minWidth: column.minWidth,
                        width: column.width,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        bgcolor: theme.palette.mode === 'dark' ? '#111111' : theme.palette.background.paper,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      })}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {locallyFilteredItems.map((item) => {
                  const primitive = getOptionValue(item);
                  const checked = pendingValues.some((currentValue) => valueKey(currentValue) === valueKey(primitive));

                  return (
                    <TableRow
                      hover
                      key={valueKey(primitive)}
                      selected={checked}
                      onClick={() => handleToggle(item)}
                      onDoubleClick={() => {
                        if (!isMultiple) {
                          setPendingValues([primitive]);
                          onChange?.(primitive, item);
                          setOpen(false);
                        }
                      }}
                      sx={(theme) => ({
                        cursor: 'pointer',
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
                        },
                        '&.Mui-selected:hover': {
                          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.28 : 0.18),
                        },
                      })}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={checked} />
                      </TableCell>
                      {tableColumns.map((column) => {
                        const cellValue = getFieldValue(item, column.field);
                        return (
                          <TableCell key={String(column.field)} align={column.align} sx={{ fontSize: '0.82rem', py: 1 }}>
                            {column.render ? column.render(cellValue, item) : String(cellValue ?? '')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}

                {locallyFilteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColumns.length + 1}>
                      <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>{noResultsText}</Box>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions
          sx={(theme) => ({
            px: 2.5,
            py: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            '& .MuiButton-root': {
              textTransform: 'none',
              fontWeight: 700,
            },
          })}
        >
          {clearable && (hasValue || pendingValues.length > 0) ? (
            <Button onClick={handleClear}>
              {clearLabel}
            </Button>
          ) : null}
          <Box sx={{ flex: 1 }} />
          <Button onClick={handleClose}>{cancelLabel}</Button>
          <Button variant="contained" onClick={handleConfirm} disabled={!isMultiple && pendingValues.length === 0}>
            {selectLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
