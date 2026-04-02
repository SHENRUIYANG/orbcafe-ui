import React from 'react';
import { Box, IconButton, TableCell, TableRow } from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { PivotDataColumn, PivotTreeNode } from '../pivotModel';
import type { PivotFieldDefinition } from '../types';
import { formatAggregatedValue } from '../pivotUtils';

interface PivotRowRendererProps {
  node: PivotTreeNode;
  dataColumns: PivotDataColumn[];
  fieldMap: Map<string, PivotFieldDefinition>;
  level: number;
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  getValue?: (node: PivotTreeNode, columnId: string) => number;
}

export const PivotRowRenderer: React.FC<PivotRowRendererProps> = ({
  node,
  dataColumns,
  fieldMap,
  level,
  expandedKeys,
  onToggle,
  getValue,
}) => {
  const isExpanded = expandedKeys.has(node.key);
  const hasChildren = node.children.length > 0;
  const isGrandTotal = node.isGrandTotal;

  return (
    <>
      <TableRow
        sx={(theme) => ({
          bgcolor: isGrandTotal
            ? theme.palette.mode === 'dark'
              ? 'rgba(25, 118, 210, 0.22)'
              : 'rgba(47, 91, 255, 0.08)'
            : theme.palette.mode === 'dark'
              ? '#111111'
              : 'background.paper',
          '&:hover': {
            bgcolor: isGrandTotal
              ? theme.palette.mode === 'dark'
                ? 'rgba(25, 118, 210, 0.28)'
                : 'rgba(47, 91, 255, 0.12)'
              : theme.palette.mode === 'dark'
                ? '#181818'
                : 'rgba(0, 0, 0, 0.02)',
          },
        })}
      >
        <TableCell
          sx={(theme) => ({
            fontSize: '0.76rem',
            fontWeight: isGrandTotal ? 800 : 600,
            borderBottom: `1px solid ${theme.palette.divider}`,
            whiteSpace: 'nowrap',
            pl: level * 2 + 1,
            display: 'flex',
            alignItems: 'center',
            height: 40,
          })}
        >
          {hasChildren && !isGrandTotal && (
            <IconButton size="small" onClick={() => onToggle(node.key)} sx={{ p: 0.2, mr: 0.5, ml: -1 }}>
              {isExpanded ? <KeyboardArrowDownIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          )}
          {!hasChildren && !isGrandTotal && level > 0 && <Box sx={{ width: 20 }} />}
          {node.value}
        </TableCell>

        {dataColumns.map((column) => (
          <TableCell
            key={`${node.key}-${column.id}`}
            align="right"
            sx={{
              fontSize: '0.76rem',
              fontWeight: isGrandTotal ? 800 : 500,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              whiteSpace: 'nowrap',
            }}
          >
            {formatAggregatedValue(getValue ? getValue(node, column.id) : (node.aggregatedValues[column.id] ?? 0), column.valueItem, fieldMap)}
          </TableCell>
        ))}
      </TableRow>

      {isExpanded &&
        node.children.map((child) => (
          <PivotRowRenderer
            key={child.key}
            node={child}
            dataColumns={dataColumns}
            fieldMap={fieldMap}
            level={level + 1}
            expandedKeys={expandedKeys}
            onToggle={onToggle}
            getValue={getValue}
          />
        ))}
    </>
  );
};
