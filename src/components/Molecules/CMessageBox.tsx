/**
 * @file 10_Frontend/components/sap/ui/Common/Molecules/CMessageBox.tsx
 * 
 * @summary Core frontend CMessageBox module for the ORBAI Core project
 * @author ORBAICODER
 * @version 1.0.0
 * @date 2025-01-19
 * 
 * @description
 * This file is responsible for:
 *  - Implementing CMessageBox functionality within frontend workflows
 *  - Integrating with shared ORBAI Core application processes under frontend
 * 
 * @logic
 * 1. Import required dependencies and configuration
 * 2. Execute the primary logic for CMessageBox
 * 3. Export the resulting APIs, hooks, or components for reuse
 * 
 * @changelog
 * V1.0.0 - 2025-01-19 - Initial creation
 */

/**
 * File Overview
 * 
 * START CODING
 * 
 * --------------------------
 * SECTION 1: CMessageBox Core Logic
 * Section overview and description.
 * --------------------------
 */

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { CButton } from '../Atoms/CButton';
import { useOrbcafeI18n } from '../../i18n';
import { messageManager } from '../../lib/message';
import type { CMessageBoxType, MessageEvent } from '../../lib/message';
export type { CMessageBoxType } from '../../lib/message';

export interface CMessageBoxProps {
  open: boolean;
  title?: string;
  message?: string | React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: CMessageBoxType;
}

const typeConfig = {
  success: {
    icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
    color: '#e8f5e9', // Light Green
    iconColor: '#66bb6a',
    borderColor: '#a5d6a7',
  },
  warning: {
    icon: <WarningIcon sx={{ fontSize: 40 }} />,
    color: '#fff3e0', // Light Orange
    iconColor: '#ffa726',
    borderColor: '#ffcc80',
  },
  error: {
    icon: <ErrorIcon sx={{ fontSize: 40 }} />,
    color: '#ffebee', // Light Red
    iconColor: '#ef5350',
    borderColor: '#ef9a9a',
  },
  info: {
    icon: <InfoIcon sx={{ fontSize: 40 }} />,
    color: '#e3f2fd', // Light Blue
    iconColor: '#42a5f5',
    borderColor: '#90caf9',
  },
  default: {
    icon: null,
    color: 'transparent',
    iconColor: 'inherit',
    borderColor: 'transparent',
  }
};

export const CMessageBox: React.FC<CMessageBoxProps> = ({
  open,
  title,
  message,
  onClose,
  onConfirm,
  confirmText,
  cancelText,
  showCancel = true,
  maxWidth = 'xs',
  type = 'default',
}) => {
  const { t } = useOrbcafeI18n();
  const effectiveConfirmText = confirmText || t('messageBox.confirm');
  const effectiveCancelText = cancelText || t('messageBox.cancel');

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const config = typeConfig[type];
  const isCustomType = type !== 'default';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          ...(isCustomType && {
            borderTop: `6px solid ${config.iconColor}`,
          })
        }
      }}
    >
      {isCustomType && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          pt: 3,
          color: config.iconColor
        }}>
          {config.icon}
        </Box>
      )}
      
      {title && (
        <DialogTitle sx={{ 
          textAlign: isCustomType ? 'center' : 'left',
          pt: isCustomType ? 1 : 2
        }}>
          {title}
        </DialogTitle>
      )}
      
      <DialogContent sx={{ textAlign: isCustomType ? 'center' : 'left' }}>
        {typeof message === 'string' ? (
          <DialogContentText>{message}</DialogContentText>
        ) : (
          message
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: isCustomType ? 'center' : 'flex-end', 
        pb: 3,
        px: 3
      }}>
        {showCancel && (
          <CButton onClick={onClose} variant="text" color="inherit">
            {effectiveCancelText}
          </CButton>
        )}
        <CButton 
          onClick={handleConfirm} 
          variant="contained" 
          sx={{ 
            bgcolor: isCustomType ? config.iconColor : undefined,
            '&:hover': {
              bgcolor: isCustomType ? config.iconColor : undefined,
              filter: 'brightness(0.9)'
            }
          }}
          autoFocus
        >
          {effectiveConfirmText}
        </CButton>
      </DialogActions>
    </Dialog>
  );
};

export const GlobalMessage: React.FC = () => {
  const [msgState, setMsgState] = React.useState<MessageEvent | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent | null) => {
      if (event) {
        setMsgState(event);
        setOpen(true);
      } else {
        setOpen(false);
        setMsgState(null);
      }
    };

    messageManager.register(handleMessage);
    return () => messageManager.unregister();
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (msgState?.options?.onClose) {
      msgState.options.onClose();
    }
    setMsgState(null);
  };

  const handleConfirm = () => {
    if (msgState?.options?.onConfirm) {
      msgState.options.onConfirm();
    }
    setOpen(false);
    setMsgState(null);
  };

  if (!msgState) return null;

  return (
    <CMessageBox
      open={open}
      type={msgState.type}
      message={msgState.content}
      title={msgState.options?.title}
      onClose={handleClose}
      onConfirm={handleConfirm}
      confirmText={msgState.options?.confirmText}
      cancelText={msgState.options?.cancelText}
      showCancel={msgState.options?.showCancel}
      maxWidth={msgState.options?.maxWidth}
    />
  );
};
