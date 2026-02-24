'use client';

import { useState } from 'react';
import { Box, Collapse, IconButton, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface ThinkBlockProps {
  content: string;
  title?: string;
  defaultExpanded?: boolean;
  isStreaming?: boolean;
}

export const ThinkBlock = ({
  content,
  title = 'Thinking',
  defaultExpanded = false,
  isStreaming = false,
}: ThinkBlockProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box
      sx={{
        borderLeft: '2px solid',
        borderColor: 'divider',
        pl: 1,
        my: 0.8,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.6}>
        <IconButton
          size="small"
          onClick={() => setExpanded((prev) => !prev)}
          sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .15s ease' }}
        >
          <ExpandMoreIcon fontSize="inherit" />
        </IconButton>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {title}{isStreaming ? ' ...' : ''}
        </Typography>
      </Stack>

      <Collapse in={expanded}>
        <Typography
          variant="body2"
          sx={{
            pl: 4,
            pt: 0.4,
            whiteSpace: 'pre-wrap',
            color: 'text.secondary',
            fontStyle: 'italic',
            lineHeight: 1.55,
          }}
        >
          {content}
        </Typography>
      </Collapse>
    </Box>
  );
};

export default ThinkBlock;
