'use client';

import { useMemo, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

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
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          py: 0.6,
          bgcolor: 'action.hover',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: 'text.secondary',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {language}
        </Typography>

        {copyable && (
          <Tooltip title={copied ? 'Copied' : 'Copy'}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? <CheckOutlinedIcon fontSize="inherit" /> : <ContentCopyOutlinedIcon fontSize="inherit" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.25,
          fontSize: '0.82rem',
          lineHeight: 1.55,
          overflow: 'auto',
          maxHeight,
          bgcolor: 'background.default',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        {showLineNumbers
          ? lines.map((line, index) => (
            <Box key={`${index}-${line}`} sx={{ display: 'flex' }}>
              <Box
                component="span"
                sx={{
                  width: 34,
                  flexShrink: 0,
                  textAlign: 'right',
                  pr: 1,
                  color: 'text.disabled',
                  userSelect: 'none',
                }}
              >
                {index + 1}
              </Box>
              <Box
                component="span"
                sx={{
                  whiteSpace: wrapLongLines ? 'pre-wrap' : 'pre',
                  wordBreak: wrapLongLines ? 'break-word' : 'normal',
                }}
              >
                {line}
              </Box>
            </Box>
          ))
          : (
            <Box
              component="code"
              sx={{
                display: 'block',
                whiteSpace: wrapLongLines ? 'pre-wrap' : 'pre',
                wordBreak: wrapLongLines ? 'break-word' : 'normal',
              }}
            >
              {code}
            </Box>
          )}
      </Box>
    </Box>
  );
};

export default CodeBlock;
