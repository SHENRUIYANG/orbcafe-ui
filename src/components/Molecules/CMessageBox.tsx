import React from 'react';
import { CircleCheck, CircleAlert, TriangleAlert, Info } from '@/components/Icons';
import { CButton, CDialog } from '../Atoms';
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
    icon: <CircleCheck size={40} />,
    color: 'var(--orb-success-bg)',
    iconColor: 'var(--orb-success)',
  },
  warning: {
    icon: <TriangleAlert size={40} />,
    color: 'var(--orb-warn-bg)',
    iconColor: 'var(--orb-warn)',
  },
  error: {
    icon: <CircleAlert size={40} />,
    color: 'var(--orb-err-bg)',
    iconColor: 'var(--orb-err)',
  },
  info: {
    icon: <Info size={40} />,
    color: 'var(--orb-info-bg)',
    iconColor: 'var(--orb-info)',
  },
  default: {
    icon: null,
    color: 'transparent',
    iconColor: 'inherit',
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
    <CDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      sx={isCustomType ? { borderTop: `6px solid ${config.iconColor}` } : undefined}
    >
      {isCustomType && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 24,
          color: config.iconColor
        }}>
          {config.icon}
        </div>
      )}

      {title && (
        <div className="orb-dialog-title" style={{
          textAlign: isCustomType ? 'center' : 'left',
          paddingTop: isCustomType ? 8 : 16
        }}>
          {title}
        </div>
      )}

      <div className="orb-dialog-content" style={{ textAlign: isCustomType ? 'center' : 'left' }}>
        {typeof message === 'string' ? (
          <p style={{ margin: 0, color: 'var(--orb-muted)' }}>{message}</p>
        ) : (
          message
        )}
      </div>

      <div className="orb-dialog-actions" style={{
        display: 'flex',
        justifyContent: isCustomType ? 'center' : 'flex-end',
        gap: 8,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24
      }}>
        {showCancel && (
          <CButton onClick={onClose} variant="text">
            {effectiveCancelText}
          </CButton>
        )}
        <CButton
          onClick={handleConfirm}
          variant="contained"
          color={isCustomType && type === 'error' ? 'error' : 'primary'}
          autoFocus
        >
          {effectiveConfirmText}
        </CButton>
      </div>
    </CDialog>
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
