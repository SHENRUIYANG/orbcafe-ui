import { getOrbCompatMode } from '../../../lib/orbis-compat';
import { KeyboardArrowDownIcon, KeyboardArrowRightIcon } from '../../../lib/orbis-compat';
import React from 'react';
import {  CIconButton } from "../../Atoms";
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
  const isCollapsedParent = hasChildren && !isExpanded && !isGrandTotal;
  const labelWeight = isGrandTotal ? 800 : isCollapsedParent ? 700 : hasChildren ? 600 : 500;
  const valueWeight = isGrandTotal ? 800 : isCollapsedParent ? 600 : 500;

  return (
    <>
      <tr
        sx={{
          bgcolor: isGrandTotal
            ? getOrbCompatMode() === 'dark'
              ? 'color-mix(in oklch, var(--orb-primary) 22%, transparent)'
              : 'color-mix(in oklch, var(--orb-primary) 8%, transparent)'
            : getOrbCompatMode() === 'dark'
              ? 'var(--orb-surface)'
              : 'background.paper',
          '&:hover': {
            bgcolor: isGrandTotal
              ? getOrbCompatMode() === 'dark'
                ? 'color-mix(in oklch, var(--orb-primary) 28%, transparent)'
                : 'color-mix(in oklch, var(--orb-primary) 12%, transparent)'
              : 'var(--orb-hover)',
          },
        }}
      >
        <td
          style={{ fontWeight: labelWeight }}
          sx={(theme) => ({
            fontSize: '0.76rem',
            borderBottom: `1px solid ${theme.palette.divider}`,
            whiteSpace: 'nowrap',
            pl: level * 2 + 1,
            display: 'flex',
            alignItems: 'center',
            height: 40,
          })}
        >
          {hasChildren && !isGrandTotal && (
            <CIconButton size="small" onClick={() => onToggle(node.key)} sx={{ width: 22, height: 22, p: 0, mr: 0.35, ml: -0.8 }}>
              {isExpanded ? <KeyboardArrowDownIcon size={12} /> : <KeyboardArrowRightIcon size={12} />}
            </CIconButton>
          )}
          {!hasChildren && !isGrandTotal && level > 0 && <div sx={{ width: 18 }} />}
          {node.value}
        </td>

        {dataColumns.map((column) => (
          <td
            key={`${node.key}-${column.id}`}
            align="right"
            style={{ fontWeight: valueWeight }}
            sx={{
              fontSize: '0.76rem',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              whiteSpace: 'nowrap',
            }}
          >
            {formatAggregatedValue(getValue ? getValue(node, column.id) : (node.aggregatedValues[column.id] ?? 0), column.valueItem, fieldMap)}
          </td>
        ))}
      </tr>

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
