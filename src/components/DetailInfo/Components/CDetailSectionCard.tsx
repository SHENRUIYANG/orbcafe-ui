'use client';
import {  CPaper, CTypography } from "../../Atoms";

import type { ReactNode } from 'react';
import type { DetailInfoSection } from '../types';

export interface CDetailSectionCardProps {
  section: DetailInfoSection;
  highlightQuery?: string;
}

const highlightText = (text: string, query: string): ReactNode => {
  const q = query.trim();
  if (!q) return text;

  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lower.indexOf(lowerQ);
  if (idx < 0) return text;

  return (
    <>
      {text.slice(0, idx)}
      <div component="mark" sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', px: 0.15, borderRadius: 0.4 }}>
        {text.slice(idx, idx + q.length)}
      </div>
      {text.slice(idx + q.length)}
    </>
  );
};

export const CDetailSectionCard = ({ section, highlightQuery = '' }: CDetailSectionCardProps) => {
  const columns = section.columns || 2;

  return (
    <CPaper variant="outlined" sx={{ p: 1.8, borderRadius: 2 }}>
      <CTypography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.4 }}>
        {section.title}
      </CTypography>

      <div
        sx={{
          display: 'grid',
          gap: 1.15,
          gridTemplateColumns: {
            xs: '1fr',
            md: columns === 3 ? 'repeat(3, minmax(0, 1fr))' : columns === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))',
          },
        }}
      >
        {section.fields.map((field) => {
          const stringValue = typeof field.value === 'string' || typeof field.value === 'number'
            ? String(field.value)
            : null;

          return (
            <div key={field.id} sx={{ minWidth: 0 }}>
              <CTypography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {highlightText(field.label, highlightQuery)}
              </CTypography>
              <CTypography component="div" variant="body2" sx={{ mt: 0.2, fontWeight: 500, wordBreak: 'break-word' }}>
                {stringValue ? highlightText(stringValue, highlightQuery) : field.value}
              </CTypography>
            </div>
          );
        })}
      </div>
    </CPaper>
  );
};
