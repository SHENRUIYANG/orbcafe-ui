'use client';

import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import QrCodeScannerRoundedIcon from '@mui/icons-material/QrCodeScannerRounded';
import type { PBarcodeScannerDetectedValue, PBarcodeScannerProps } from './types';

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): {
        detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string; format?: string }>>;
      };
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

const DEFAULT_FORMATS = ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e'];

const emitDetection = (
  value: PBarcodeScannerDetectedValue,
  onDetected?: (value: PBarcodeScannerDetectedValue) => void,
  onClose?: () => void,
  autoCloseOnDetect?: boolean,
) => {
  onDetected?.(value);
  if (autoCloseOnDetect) {
    onClose?.();
  }
};

export const PBarcodeScanner = ({
  open,
  onClose,
  title = 'Scan barcode',
  subtitle = 'Use the rear camera on the device. If scanning is unavailable, enter the code manually.',
  formats = DEFAULT_FORMATS,
  facingMode = 'environment',
  manualEntry = true,
  autoCloseOnDetect = true,
  scanIntervalMs = 600,
  confirmLabel = 'Use code',
  cancelLabel = 'Close',
  manualPlaceholder = 'Enter barcode manually',
  onDetected,
  onError,
  sx,
}: PBarcodeScannerProps) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const scanTimerRef = React.useRef<number | null>(null);
  const detectorRef = React.useRef<InstanceType<NonNullable<typeof window.BarcodeDetector>> | null>(null);

  const [scannerState, setScannerState] = React.useState<'idle' | 'starting' | 'ready' | 'unsupported' | 'error'>('idle');
  const [manualValue, setManualValue] = React.useState('');
  const [lastDetected, setLastDetected] = React.useState<PBarcodeScannerDetectedValue | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const stopScanner = React.useCallback(() => {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const reportError = React.useCallback(
    (message: string) => {
      setErrorMessage(message);
      setScannerState('error');
      onError?.(message);
    },
    [onError],
  );

  React.useEffect(() => {
    if (!open) {
      stopScanner();
      setScannerState('idle');
      setErrorMessage(null);
      setManualValue('');
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerState('unsupported');
        setErrorMessage('Camera access is not supported in this browser.');
        return;
      }

      setScannerState('starting');
      setErrorMessage(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facingMode },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if (!window.BarcodeDetector) {
          setScannerState('unsupported');
          setErrorMessage('BarcodeDetector is not available. Camera preview is ready and manual entry is enabled.');
          return;
        }

        detectorRef.current = new window.BarcodeDetector({ formats });
        setScannerState('ready');

        scanTimerRef.current = window.setInterval(async () => {
          if (!videoRef.current || !detectorRef.current) return;
          if (videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

          try {
            const results = await detectorRef.current.detect(videoRef.current);
            const firstHit = results.find((item) => item.rawValue);
            if (!firstHit?.rawValue) return;

            const detectedValue = {
              rawValue: firstHit.rawValue,
              format: firstHit.format,
            };

            setLastDetected(detectedValue);
            stopScanner();
            emitDetection(detectedValue, onDetected, onClose, autoCloseOnDetect);
          } catch (error) {
            reportError(error instanceof Error ? error.message : 'Failed to detect barcode.');
          }
        }, scanIntervalMs);
      } catch (error) {
        reportError(error instanceof Error ? error.message : 'Unable to start camera.');
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [autoCloseOnDetect, facingMode, formats, onClose, onDetected, open, reportError, scanIntervalMs, stopScanner]);

  const handleUseManualValue = () => {
    const trimmed = manualValue.trim();
    if (!trimmed) return;
    const detectedValue = { rawValue: trimmed, format: 'manual' };
    setLastDetected(detectedValue);
    emitDetection(detectedValue, onDetected, onClose, autoCloseOnDetect);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: '1rem', fontWeight: 900 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <Stack spacing={2} sx={sx}>
          <Typography sx={{ fontSize: '0.88rem', color: 'text.secondary', lineHeight: 1.55 }}>{subtitle}</Typography>

          <Paper
            elevation={0}
            sx={(theme) => ({
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 280,
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.96))'
                  : 'linear-gradient(180deg, rgba(241,245,249,1), rgba(226,232,240,0.92))',
            })}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              style={{
                width: '100%',
                height: 280,
                objectFit: 'cover',
                display: 'block',
              }}
            />

            <Box
              sx={{
                pointerEvents: 'none',
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: '72%',
                  maxWidth: 320,
                  aspectRatio: '1.7 / 1',
                  borderRadius: 3,
                  border: '2px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 0 0 999px rgba(15,23,42,0.24)',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: 2,
                    bgcolor: '#38bdf8',
                    boxShadow: '0 0 18px rgba(56,189,248,0.85)',
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                icon={<CameraAltRoundedIcon />}
                label={
                  scannerState === 'ready'
                    ? 'Camera ready'
                    : scannerState === 'starting'
                      ? 'Starting camera'
                      : scannerState === 'unsupported'
                        ? 'Preview only'
                        : scannerState === 'error'
                          ? 'Scanner error'
                          : 'Idle'
                }
                size="small"
                color={scannerState === 'error' ? 'error' : 'primary'}
                variant="filled"
              />
              {lastDetected ? (
                <Chip
                  icon={<QrCodeScannerRoundedIcon />}
                  label={`${lastDetected.format || 'barcode'}: ${lastDetected.rawValue}`}
                  size="small"
                  color="success"
                  variant="filled"
                />
              ) : null}
            </Box>
          </Paper>

          {errorMessage ? <Alert severity={scannerState === 'unsupported' ? 'info' : 'warning'}>{errorMessage}</Alert> : null}

          {manualEntry ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <TextField
                fullWidth
                label="Barcode"
                placeholder={manualPlaceholder}
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
              />
              <Button variant="contained" onClick={handleUseManualValue} sx={{ minHeight: 56, px: 2.5 }}>
                {confirmLabel}
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{cancelLabel}</Button>
      </DialogActions>
    </Dialog>
  );
};

