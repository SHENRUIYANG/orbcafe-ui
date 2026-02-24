'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';

export interface MathBlockProps {
  expression: string;
  inline?: boolean;
  allowKatex?: boolean;
}

const stripDelimiters = (input: string): string => {
  let next = input.trim();
  if (next.startsWith('$$') && next.endsWith('$$') && next.length >= 4) {
    next = next.slice(2, -2).trim();
  }
  if (next.startsWith('$') && next.endsWith('$') && next.length >= 2) {
    next = next.slice(1, -1).trim();
  }
  return next;
};

const loadOptionalModule = async (moduleName: string): Promise<any> => {
  const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;
  return dynamicImport(moduleName);
};

export const MathBlock = ({ expression, inline = false, allowKatex = false }: MathBlockProps) => {
  const cleaned = useMemo(() => stripDelimiters(expression), [expression]);
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!allowKatex || !cleaned) {
        setRenderedHtml('');
        return;
      }

      try {
        const module = await loadOptionalModule('katex');
        const katex = module?.default || module;
        const html = katex?.renderToString?.(cleaned, {
          displayMode: !inline,
          throwOnError: false,
          strict: 'warn',
        });

        if (mounted && typeof html === 'string') {
          setRenderedHtml(html);
        }
      } catch {
        if (mounted) {
          setRenderedHtml('');
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [allowKatex, cleaned, inline]);

  if (!cleaned) return null;

  if (renderedHtml) {
    return (
      <Box
        component={inline ? 'span' : 'div'}
        sx={{ display: inline ? 'inline-flex' : 'block', my: inline ? 0 : 0.5, overflowX: 'auto' }}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return inline ? (
    <Box
      component="code"
      sx={{
        px: 0.4,
        py: 0.05,
        borderRadius: 0.8,
        bgcolor: 'action.hover',
        fontSize: '0.82em',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      }}
    >
      {cleaned}
    </Box>
  ) : (
    <Box
      sx={{
        my: 1,
        p: 1,
        borderRadius: 1.2,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        component="pre"
        sx={{
          m: 0,
          whiteSpace: 'pre-wrap',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {cleaned}
      </Typography>
    </Box>
  );
};

export default MathBlock;
