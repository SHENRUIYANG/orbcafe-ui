'use client';

import { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

export type TableAlign = 'left' | 'center' | 'right';

export interface ParsedMarkdownTable {
  headers: string[];
  aligns: TableAlign[];
  rows: string[][];
}

export interface TableBlockProps {
  markdown?: string;
  table?: ParsedMarkdownTable;
  maxHeight?: number | string;
}

const splitTableLine = (line: string): string[] => {
  const normalized = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return normalized.split('|').map((cell) => cell.trim());
};

const isSeparatorCell = (cell: string) => /^:?-{3,}:?$/.test(cell.trim());

const cellToAlign = (cell: string): TableAlign => {
  const trimmed = cell.trim();
  const left = trimmed.startsWith(':');
  const right = trimmed.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  return 'left';
};

export const parseMarkdownTable = (markdown: string): ParsedMarkdownTable | null => {
  const lines = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const headers = splitTableLine(lines[0]);
  const separator = splitTableLine(lines[1]);

  if (
    headers.length === 0 ||
    separator.length !== headers.length ||
    !separator.every(isSeparatorCell)
  ) {
    return null;
  }

  const aligns = separator.map(cellToAlign);
  const rows = lines.slice(2)
    .filter((line) => line.includes('|'))
    .map((line) => {
      const cells = splitTableLine(line);
      if (cells.length < headers.length) {
        return [...cells, ...Array.from({ length: headers.length - cells.length }, () => '')];
      }
      return cells.slice(0, headers.length);
    });

  return { headers, aligns, rows };
};

export const TableBlock = ({ markdown, table, maxHeight = 360 }: TableBlockProps) => {
  const resolved = useMemo(() => {
    if (table) return table;
    if (!markdown) return null;
    return parseMarkdownTable(markdown);
  }, [table, markdown]);

  if (!resolved || resolved.headers.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
        <Typography variant="body2" color="text.secondary">Invalid table block</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden', my: 1 }}>
      <TableContainer sx={{ maxHeight }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {resolved.headers.map((header, index) => (
                <TableCell
                  key={`${header}-${index}`}
                  align={resolved.aligns[index]}
                  sx={{ fontWeight: 700, bgcolor: 'background.paper' }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {resolved.rows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`} hover>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={`cell-${rowIndex}-${cellIndex}`}
                    align={resolved.aligns[cellIndex]}
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {cell || <Box component="span" sx={{ color: 'text.disabled' }}>-</Box>}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TableBlock;
