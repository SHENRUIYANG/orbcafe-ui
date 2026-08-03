'use client';

import { useMemo, useState } from 'react';
import { Check, Copy } from '@/components/Icons';
import { CIconButton } from '../../components/Atoms/CIconButton';

export interface CodeBlockProps {
  code: string;
  language?: string;
  copyable?: boolean;
  showLineNumbers?: boolean;
  wrapLongLines?: boolean;
  maxHeight?: number | string;
}

export const CodeBlock = ({
  code,
  language = 'text',
  copyable = true,
  showLineNumbers = false,
  wrapLongLines = false,
  maxHeight,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => {
    const normalized = code.replace(/\n$/, '');
    return normalized.split('\n');
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--orb-border)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--orb-canvas)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4.8px 8px',
          background: 'var(--orb-hover)',
          borderBottom: '1px solid var(--orb-border)',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: 'var(--orb-muted)',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {language}
        </span>

        {copyable && (
          <CIconButton size="small" tooltip={copied ? 'Copied' : 'Copy'} onClick={handleCopy}>
            {copied ? <Check size={14} strokeWidth={1.8} /> : <Copy size={14} strokeWidth={1.8} />}
          </CIconButton>
        )}
      </div>

      <pre
        style={{
          margin: 0,
          padding: 10,
          fontSize: '0.82rem',
          lineHeight: 1.55,
          overflow: 'auto',
          maxHeight,
          background: 'var(--orb-surface)',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {showLineNumbers
          ? lines.map((line, index) => (
            <div key={`${index}-${line}`} style={{ display: 'flex' }}>
              <span
                style={{
                  width: 34,
                  flexShrink: 0,
                  textAlign: 'right',
                  paddingRight: 8,
                  color: 'var(--orb-disabled-fg)',
                  userSelect: 'none',
                }}
              >
                {index + 1}
              </span>
              <span
                style={{
                  whiteSpace: wrapLongLines ? 'pre-wrap' : 'pre',
                  wordBreak: wrapLongLines ? 'break-word' : 'normal',
                }}
              >
                {line}
              </span>
            </div>
          ))
          : (
            <code
              style={{
                display: 'block',
                whiteSpace: wrapLongLines ? 'pre-wrap' : 'pre',
                wordBreak: wrapLongLines ? 'break-word' : 'normal',
              }}
            >
              {code}
            </code>
          )}
      </pre>
    </div>
  );
};

export default CodeBlock;
