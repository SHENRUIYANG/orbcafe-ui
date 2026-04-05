'use client';

import { useState } from 'react';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import BackspaceRoundedIcon from '@mui/icons-material/BackspaceRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import type { PNumericKeypadProps } from './types';
import { useOrbcafeI18n } from '../../i18n';

interface KeypadButtonProps {
  label: string;
  onPress: () => void;
  emphasis?: 'default' | 'primary' | 'danger';
}

const KeypadButton = ({ label, onPress, emphasis = 'default' }: KeypadButtonProps) => (
  <Box
    component="button"
    type="button"
    onClick={onPress}
    sx={(theme) => ({
      minHeight: 72,
      borderRadius: 3,
      border: '1px solid',
      borderColor: emphasis === 'primary' ? 'primary.main' : 'divider',
      background:
        emphasis === 'primary'
          ? theme.palette.primary.main
          : emphasis === 'danger'
            ? theme.palette.mode === 'dark'
              ? 'rgba(239,68,68,0.18)'
              : 'rgba(239,68,68,0.10)'
            : theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.04)'
              : '#fff',
      color: emphasis === 'primary' ? '#fff' : 'text.primary',
      fontSize: '1.25rem',
      fontWeight: 800,
      transition: 'transform 120ms ease, box-shadow 160ms ease, background-color 160ms ease',
      cursor: 'pointer',
      appearance: 'none',
      WebkitAppearance: 'none',
      WebkitTapHighlightColor: 'transparent',
      '&:active': {
        transform: 'scale(0.98)',
      },
    })}
  >
    {label}
  </Box>
);

export const PNumericKeypad = ({
  value,
  defaultValue = '',
  title,
  subtitle,
  placeholder = '0',
  allowDecimal = false,
  allowNegative = false,
  maxLength,
  confirmLabel,
  clearLabel,
  backspaceLabel,
  onChange,
  onSubmit,
  onClose,
  sx,
}: PNumericKeypadProps) => {
  const { t } = useOrbcafeI18n();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const updateValue = (next: string) => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const appendValue = (nextPiece: string) => {
    if (maxLength && currentValue.length >= maxLength) return;
    updateValue(`${currentValue}${nextPiece}`);
  };

  const handleDigit = (digit: string) => {
    if (digit === '00') {
      if (!currentValue) {
        updateValue('0');
        return;
      }
      appendValue('00');
      return;
    }
    appendValue(digit);
  };

  const handleDecimal = () => {
    if (!allowDecimal || currentValue.includes('.')) return;
    updateValue(currentValue ? `${currentValue}.` : '0.');
  };

  const handleToggleNegative = () => {
    if (!allowNegative) return;
    if (currentValue.startsWith('-')) {
      updateValue(currentValue.slice(1));
      return;
    }
    updateValue(currentValue ? `-${currentValue}` : '-');
  };

  const handleBackspace = () => {
    updateValue(currentValue.slice(0, -1));
  };

  const handleClear = () => {
    updateValue('');
  };

  const handleSubmit = () => {
    onSubmit?.(currentValue);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            {title ? <Typography sx={{ fontSize: '1rem', fontWeight: 800 }}>{title}</Typography> : null}
            {subtitle ? (
              <Typography sx={{ mt: 0.5, fontSize: '0.86rem', color: 'text.secondary' }}>{subtitle}</Typography>
            ) : null}
          </Box>

          {onClose ? (
            <IconButton onClick={onClose} size="small">
              <CloseRoundedIcon />
            </IconButton>
          ) : null}
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Typography
            sx={{
              minHeight: 38,
              fontSize: currentValue ? '1.9rem' : '1.25rem',
              fontWeight: 900,
              letterSpacing: '0.06em',
              color: currentValue ? 'text.primary' : 'text.disabled',
            }}
          >
            {currentValue || placeholder}
          </Typography>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.25 }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <KeypadButton key={digit} label={digit} onPress={() => handleDigit(digit)} />
          ))}

          <KeypadButton label={allowNegative ? '+/-' : '00'} onPress={allowNegative ? handleToggleNegative : () => handleDigit('00')} />
          <KeypadButton label="0" onPress={() => handleDigit('0')} />
          <KeypadButton label={allowDecimal ? '.' : backspaceLabel ? String(backspaceLabel) : 'DEL'} onPress={allowDecimal ? handleDecimal : handleBackspace} />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.25 }}>
          <Box
            component="button"
            type="button"
            onClick={handleBackspace}
            sx={{
              minHeight: 64,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <BackspaceRoundedIcon />
              <Typography sx={{ fontWeight: 700 }}>{backspaceLabel || 'DEL'}</Typography>
            </Stack>
          </Box>

          <KeypadButton label={String(clearLabel || 'CLR')} onPress={handleClear} emphasis="danger" />

          <Box
            component="button"
            type="button"
            onClick={handleSubmit}
            sx={(theme) => ({
              minHeight: 64,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'primary.main',
              background: theme.palette.primary.main,
              color: '#fff',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              WebkitTapHighlightColor: 'transparent',
            })}
          >
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <CheckRoundedIcon />
              <Typography sx={{ fontWeight: 800 }}>{confirmLabel || t('common.ok')}</Typography>
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};
