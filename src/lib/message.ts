import type { ReactNode } from 'react';

export type CMessageBoxType = 'success' | 'warning' | 'error' | 'info' | 'default';

export type MessageContent = string | ReactNode;

export interface MessageOptions {
  title?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface MessageEvent {
  type: CMessageBoxType;
  content: MessageContent;
  options?: MessageOptions;
}

class MessageManager {
  private listener: ((event: MessageEvent | null) => void) | null = null;

  register(listener: (event: MessageEvent | null) => void) {
    this.listener = listener;
  }

  unregister() {
    this.listener = null;
  }

  show(type: CMessageBoxType, content: MessageContent, options?: MessageOptions) {
    if (this.listener) {
      this.listener({ type, content, options });
    }
  }

  hide() {
    if (this.listener) {
      this.listener(null);
    }
  }
}

export const messageManager = new MessageManager();

export const message = {
  success: (content: MessageContent, options?: MessageOptions) =>
    messageManager.show('success', content, options),
  error: (content: MessageContent, options?: MessageOptions) =>
    messageManager.show('error', content, options),
  warning: (content: MessageContent, options?: MessageOptions) =>
    messageManager.show('warning', content, options),
  info: (content: MessageContent, options?: MessageOptions) =>
    messageManager.show('info', content, options),
  show: (type: CMessageBoxType, content: MessageContent, options?: MessageOptions) =>
    messageManager.show(type, content, options),
  hide: () => messageManager.hide(),
};
