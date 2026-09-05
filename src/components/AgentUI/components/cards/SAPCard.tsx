'use client'

import { FC } from 'react'
import { SAPCardTypeContent } from '../cardTypes'

export const SAPCard: FC<SAPCardTypeContent> = ({ 
  type, 
  manifest
}) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[var(--orb-border)] bg-[var(--orb-canvas)] shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center px-4 py-3 border-b border-[var(--orb-border)] bg-[var(--orb-p50)]">
        <div className="w-4 h-4 mr-2 text-[var(--orb-status-primary)]" />
        <h3 className="text-sm font-semibold text-[var(--orb-fg)]">
          SAP Card: {type}
        </h3>
      </div>
      <div className="p-4">
        <div className="bg-[var(--orb-surface)] dark:bg-[var(--orb-canvas)] p-3 rounded border border-[var(--orb-border)] overflow-x-auto">
          <pre className="text-xs font-mono text-[var(--orb-muted)] whitespace-pre-wrap">
            {JSON.stringify(manifest, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default SAPCard;
