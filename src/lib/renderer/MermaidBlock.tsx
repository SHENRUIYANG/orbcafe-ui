'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material';
import { CodeBlock } from './CodeBlock';

export interface MermaidBlockProps {
  code: string;
  title?: string;
  height?: number | string;
  enabled?: boolean;
}

const loadOptionalModule = async (moduleName: string): Promise<any> => {
  const dynamicImport = new Function('m', 'return import(m)') as (m: string) => Promise<any>;
  return dynamicImport(moduleName);
};

export const MermaidBlock = ({
  code,
  title = 'Mermaid Diagram',
  height = 320,
  enabled = true,
}: MermaidBlockProps) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedCode = useMemo(() => code.trim(), [code]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!enabled || !normalizedCode) {
        setSvg('');
        setError('');
        return;
      }

      setLoading(true);
      setError('');
      setSvg('');

      try {
        const module = await loadOptionalModule('mermaid');
        const mermaid = module?.default || module;

        if (!mermaid || typeof mermaid.render !== 'function') {
          throw new Error('Mermaid runtime is not available');
        }

        mermaid.initialize?.({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'default',
        });

        const renderResult = await mermaid.render(
          `orbcafe-mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          normalizedCode,
        );

        const nextSvg = typeof renderResult === 'string' ? renderResult : renderResult?.svg;
        if (mounted && typeof nextSvg === 'string') {
          setSvg(nextSvg);
        }
      } catch (e) {
        if (mounted) {
          const message = e instanceof Error ? e.message : 'Failed to render Mermaid diagram';
          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [enabled, normalizedCode]);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden', my: 1 }}>
      <Box sx={{ px: 1, py: 0.6, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ p: 1 }}>
        {loading && (
          <Box sx={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        )}

        {!loading && svg && (
          <Box
            sx={{
              maxHeight: height,
              overflow: 'auto',
              '& svg': { display: 'block', mx: 'auto', maxWidth: '100%', height: 'auto' },
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}

        {!loading && !svg && (
          <Box>
            {error && <Alert severity="info" sx={{ mb: 1 }}>{error}</Alert>}
            <CodeBlock code={normalizedCode} language="mermaid" copyable showLineNumbers wrapLongLines />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default MermaidBlock;
