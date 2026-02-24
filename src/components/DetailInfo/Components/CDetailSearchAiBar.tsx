'use client';

import { Box, IconButton, InputBase, Stack, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CloseIcon from '@mui/icons-material/Close';

export interface CDetailSearchAiBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoiceInput?: () => void;
  onClear?: () => void;
  placeholder: string;
  statusText?: string;
  loading?: boolean;
  compact?: boolean;
  showStatusText?: boolean;
}

export const CDetailSearchAiBar = ({
  value,
  onChange,
  onSubmit,
  onVoiceInput,
  onClear,
  placeholder,
  statusText,
  loading = false,
  compact = false,
  showStatusText = true,
}: CDetailSearchAiBarProps) => {
  return (
    <Stack spacing={0.75}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.2,
          py: compact ? 0.25 : 0.4,
          borderRadius: 999,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          minHeight: compact ? 38 : 44,
        }}
      >
        <SearchIcon sx={{ fontSize: compact ? 16 : 18, color: 'text.secondary' }} />
        <InputBase
          fullWidth
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          sx={{ fontSize: compact ? '0.84rem' : '0.9rem' }}
        />

        {value && onClear && (
          <IconButton size="small" onClick={onClear}>
            <CloseIcon sx={{ fontSize: compact ? 16 : 18 }} />
          </IconButton>
        )}

        {onVoiceInput && (
          <IconButton size="small" onClick={onVoiceInput}>
            <MicNoneOutlinedIcon sx={{ fontSize: compact ? 16 : 18 }} />
          </IconButton>
        )}
        <IconButton size="small" onClick={onSubmit} disabled={loading || !value.trim()}>
          <SendOutlinedIcon sx={{ fontSize: compact ? 16 : 18 }} />
        </IconButton>
      </Box>

      {showStatusText && statusText && (
        <Typography variant="caption" color="text.secondary">
          {statusText}
        </Typography>
      )}
    </Stack>
  );
};
