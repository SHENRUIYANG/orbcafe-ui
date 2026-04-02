'use client';

import { useMemo, useState } from 'react';

export interface UsePadRecordEditorOptions<TRecord extends Record<string, any>> {
  rows: TRecord[];
  rowKey?: keyof TRecord | string;
  numericField: keyof TRecord | string;
  defaultSelectedId?: string | number;
}

export interface UsePadRecordEditorResult<TRecord extends Record<string, any>> {
  selectedId?: string | number;
  selectedRecord?: TRecord;
  editorValue: string;
  setEditorValue: (value: string) => void;
  selectRecord: (row: TRecord) => void;
  applyEditorValue: (updater: (nextRows: TRecord[]) => void) => void;
}

const normalizeNumber = (value: string) => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const usePadRecordEditor = <TRecord extends Record<string, any>>({
  rows,
  rowKey = 'id',
  numericField,
  defaultSelectedId,
}: UsePadRecordEditorOptions<TRecord>): UsePadRecordEditorResult<TRecord> => {
  const firstRow = rows[0];
  const firstRowId = firstRow?.[rowKey as string] as string | number | undefined;
  const [selectedId, setSelectedId] = useState<string | number | undefined>(defaultSelectedId ?? firstRowId);

  const selectedRecord = useMemo(
    () => rows.find((row) => row[rowKey as string] === selectedId) || rows[0],
    [rowKey, rows, selectedId],
  );

  const [editorValue, setEditorValue] = useState(() => {
    const initial = selectedRecord?.[numericField as string];
    return initial === undefined || initial === null ? '0' : String(initial);
  });

  const selectRecord = (row: TRecord) => {
    const nextId = row[rowKey as string] as string | number | undefined;
    setSelectedId(nextId);
    const nextValue = row[numericField as string];
    setEditorValue(nextValue === undefined || nextValue === null ? '0' : String(nextValue));
  };

  const applyEditorValue = (updater: (nextRows: TRecord[]) => void) => {
    if (selectedId === undefined) return;
    const nextValue = normalizeNumber(editorValue);
    const nextRows = rows.map((row) =>
      row[rowKey as string] === selectedId ? { ...row, [numericField]: nextValue } : row,
    );
    updater(nextRows);
  };

  return {
    selectedId,
    selectedRecord,
    editorValue,
    setEditorValue,
    selectRecord,
    applyEditorValue,
  };
};

