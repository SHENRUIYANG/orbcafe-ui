import type { ReactNode } from 'react';

export interface UseVoiceInputOptions {
  onTextUpdate?: (text: string) => void;
  onComplete: (text: string) => void | Promise<void>;
  onError?: (error: string) => void;
  wsUrl?: string;
  silenceThresholdMs?: number;
  minVolumeRms?: number;
}

export interface UseVoiceInputResult {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export interface CVoiceWaveOverlayProps {
  isRecording: boolean;
}

export interface CAINavProviderProps {
  children: ReactNode;
  onVoiceSubmit: (text: string) => void | Promise<void>;
  onVoicePartial?: (text: string) => void;
  onVoiceError?: (error: string) => void;
  longPressMs?: number;
  disableSpaceTrigger?: boolean;
  ignoreWhenFocusedInput?: boolean;
  renderOverlay?: boolean;
  wsUrl?: string;
  silenceThresholdMs?: number;
  minVolumeRms?: number;
}

export interface AINavContextValue {
  isRecording: boolean;
  isHotkeyRecording: boolean;
  isSubmitting: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export type VoiceNavigatorProviderProps = CAINavProviderProps;
export type VoiceNavigatorContextValue = AINavContextValue;
export type VoiceWaveOverlayProps = CVoiceWaveOverlayProps;
