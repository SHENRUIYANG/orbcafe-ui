'use client';

import { Fragment } from 'react';
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import type { PTableProps } from './types';
import { useCTable } from '../StdReport/Hooks/CTable/useCTable';
import { useOrbcafeI18n } from '../../i18n';

const formatValue = (column: any, row: Record<string, any>) => {
  if (column.render) {
    return column.render(row[column.id], row);
  }

  const value = row[column.id];
  if (value === null || value === undefined || value === '') return '--';

  if (column.numeric) {
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      return Number(value).toLocaleString();
    }
  }

  return String(value);
};

export const PTable = ({
  orientation = 'auto',
  title,
  showToolbar = true,
  loading = false,
  rowsPerPageOptions = [10, 20, 50, 100, -1],
  cardTitleField,
  cardSubtitleFields,
  toolbarSlot,
  emptyState,
  rowHeight = 'comfortable',
  cardActionSlot,
  renderCardFooter,
  onRowClick,
  ...props
}: PTableProps) => {
  const { t } = useOrbcafeI18n();
  const theme = useTheme();
  const isPortraitViewport = useMediaQuery('(orientation: portrait)');
  const isCompactViewport = useMediaQuery(theme.breakpoints.down('md'));
  const resolvedOrientation =
    orientation === 'auto' ? (isPortraitViewport || isCompactViewport ? 'portrait' : 'landscape') : orientation;

  const {
    columns,
    filterText,
    setFilterText,
    visibleColumns,
    visibleRows,
    selected,
    handleClick,
    handleRequestSort,
    orderBy,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalDisplayCount,
    grouping,
    expandedGroups,
    toggleGroupExpand,
  } = useCTable({
    ...props,
    title,
    showToolbar,
    loading,
    rowsPerPageOptions,
  });

  const visibleLeafColumns = columns.filter((column: any) => visibleColumns.includes(column.id));
  const primaryColumn =
    visibleLeafColumns.find((column: any) => column.id === cardTitleField) || visibleLeafColumns[0];
  const subtitleColumns =
    (cardSubtitleFields?.map((field) => visibleLeafColumns.find((column: any) => column.id === field)).filter(Boolean) as any[]) ||
    visibleLeafColumns.filter((column: any) => column.id !== primaryColumn?.id).slice(0, resolvedOrientation === 'portrait' ? 2 : 3);
  const metricColumns = visibleLeafColumns
    .filter((column: any) => column.id !== primaryColumn?.id && !subtitleColumns.some((item) => item.id === column.id))
    .slice(0, resolvedOrientation === 'portrait' ? 4 : 6);

  const selectionEnabled = props.selectionMode === 'single' || props.selectionMode === 'multiple';
  const pageCount = rowsPerPage > 0 ? Math.max(1, Math.ceil(totalDisplayCount / rowsPerPage)) : 1;
  const countLabel = `${totalDisplayCount} rows`;

  const handleRowPress = (row: Record<string, any>) => {
    if (selectionEnabled) {
      handleClick({} as any, row);
    }
    onRowClick?.(row);
  };

  return (
    <Stack spacing={1.5}>
      {showToolbar ? (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.25}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              <Box>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 900 }}>
                  {title || t('table.title.default')}
                </Typography>
                <Typography sx={{ mt: 0.35, fontSize: '0.82rem', color: 'text.secondary' }}>{countLabel}</Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
                <TextField
                  size="small"
                  placeholder={`${t('common.search')}...`}
                  value={filterText}
                  onChange={(event) => setFilterText(event.target.value)}
                  sx={{ minWidth: { sm: 220 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                {toolbarSlot}
                {props.extraTools}
              </Stack>
            </Stack>

            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.25 }}>
              {visibleLeafColumns.slice(0, 8).map((column: any) => {
                const active = orderBy === column.id;
                return (
                  <Chip
                    key={column.id}
                    label={column.label}
                    clickable
                    color={active ? 'primary' : 'default'}
                    variant={active ? 'filled' : 'outlined'}
                    onClick={() => handleRequestSort(column.id)}
                    sx={{ borderRadius: 999, fontWeight: 700 }}
                  />
                );
              })}
            </Box>
          </Stack>
        </Paper>
      ) : null}

      {loading ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 260,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Stack spacing={1} alignItems="center">
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary' }}>Loading...</Typography>
          </Stack>
        </Paper>
      ) : visibleRows.length === 0 ? (
        emptyState || (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>{t('common.noData')}</Typography>
          </Paper>
        )
      ) : (
        <Stack spacing={1.25}>
          {visibleRows.map((item: any, index: number) => {
            if (item.type === 'group') {
              const isExpanded = expandedGroups.has(item.id);

              return (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => toggleGroupExpand(item.id)}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      border: 0,
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {isExpanded ? <ExpandMoreRoundedIcon /> : <ChevronRightRoundedIcon />}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: '0.92rem', fontWeight: 800 }}>
                        {item.field}: {item.value}
                      </Typography>
                      <Typography sx={{ mt: 0.25, fontSize: '0.76rem', color: 'text.secondary' }}>
                        {item.count} records
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              );
            }

            const row = item.data || item;
            const rowId = item.id || row[props.rowKey || 'id'] || index;
            const isSelected = selected.includes(rowId);

            return (
              <Paper
                key={rowId}
                elevation={0}
                sx={{
                  p: rowHeight === 'compact' ? 1.25 : 1.5,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  boxShadow: isSelected ? '0 16px 36px rgba(37,99,235,0.14)' : 'none',
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    {selectionEnabled ? (
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleRowPress(row)}
                        sx={{ mt: -0.5, ml: -0.5 }}
                      />
                    ) : null}

                    <Box
                      sx={{ flex: 1, minWidth: 0, cursor: props.selectionMode ? 'pointer' : 'default' }}
                      onClick={() => handleRowPress(row)}
                    >
                      {primaryColumn ? (
                        <Typography sx={{ fontSize: resolvedOrientation === 'portrait' ? '1rem' : '0.96rem', fontWeight: 900 }}>
                          {formatValue(primaryColumn, row)}
                        </Typography>
                      ) : null}

                      {subtitleColumns.length > 0 ? (
                        <Stack spacing={0.45} sx={{ mt: 0.6 }}>
                          {subtitleColumns.map((column: any) => (
                            <Typography key={column.id} sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                              <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {column.label}:
                              </Box>{' '}
                              {formatValue(column, row)}
                            </Typography>
                          ))}
                        </Stack>
                      ) : null}
                    </Box>

                    {cardActionSlot ? <Box>{cardActionSlot(row)}</Box> : null}
                  </Stack>

                  {metricColumns.length > 0 ? (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns:
                          resolvedOrientation === 'portrait'
                            ? 'repeat(2, minmax(0, 1fr))'
                            : 'repeat(auto-fit, minmax(128px, 1fr))',
                        gap: 1,
                      }}
                    >
                      {metricColumns.map((column: any) => (
                        <Fragment key={column.id}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1,
                              borderRadius: 3,
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'action.hover',
                            }}
                          >
                            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{column.label}</Typography>
                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, mt: 0.2 }}>
                              {formatValue(column, row)}
                            </Typography>
                          </Paper>
                        </Fragment>
                      ))}
                    </Box>
                  ) : null}

                  {renderCardFooter ? (
                    <>
                      <Divider />
                      {renderCardFooter(row)}
                    </>
                  ) : null}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {pageCount > 1 || rowsPerPageOptions.length > 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.25}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>Rows per page</Typography>
              <FormControl size="small">
                <Select
                  value={rowsPerPage}
                  onChange={(event) => setRowsPerPage(Number(event.target.value))}
                  sx={{ minWidth: 92 }}
                >
                  {rowsPerPageOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option === -1 ? 'All' : option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Pagination
              page={page + 1}
              count={pageCount}
              color="primary"
              onChange={(_event, nextPage) => setPage(nextPage - 1)}
              shape="rounded"
              siblingCount={resolvedOrientation === 'portrait' ? 0 : 1}
            />
          </Stack>
        </Paper>
      ) : null}

      {grouping.length > 0 ? (
        <Typography sx={{ fontSize: '0.76rem', color: 'text.secondary' }}>
          Grouping: {grouping.join(', ')}
        </Typography>
      ) : null}
    </Stack>
  );
};
