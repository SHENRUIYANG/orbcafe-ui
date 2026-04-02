'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CVoiceWaveOverlay } from './Components/CVoiceWaveOverlay';
import { useVoiceInput } from './Hooks/useVoiceInput';
import type { AINavContextValue, CAINavProviderProps } from './types';

const AINavContext = createContext<AINavContextValue | null>(null);

function isEditableElement(el: Element | null): boolean {
  if (!el) return false;
  if (!(el instanceof HTMLElement)) return false;

  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  if (el.closest('[data-voice-hotkey-ignore="true"]')) return true;

  return false;
}

export function CAINavProvider({
  children,
  onVoiceSubmit,
  onVoicePartial,
  onVoiceError,
  longPressMs = 200,
  disableSpaceTrigger = false,
  ignoreWhenFocusedInput = true,
  renderOverlay = true,
  wsUrl,
  silenceThresholdMs,
  minVolumeRms
}: CAINavProviderProps) {
  const [isHotkeyRecording, setIsHotkeyRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const spaceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSpacePressedRef = useRef(false);
  const isHotkeyModeRef = useRef(false);

  const resetHotkeyMode = useCallback(() => {
    isHotkeyModeRef.current = false;
    setIsHotkeyRecording(false);
  }, []);

  const { isRecording, startRecording: rawStartRecording, stopRecording: rawStopRecording } = useVoiceInput({
    wsUrl,
    silenceThresholdMs,
    minVolumeRms,
    onTextUpdate: (text) => {
      onVoicePartial?.(text)
    },
    onComplete: async (text) => {
      try {
        if (text.trim()) {
          setIsSubmitting(true);
          await onVoiceSubmit(text.trim());
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process voice command';
        onVoiceError?.(message);
      } finally {
        setIsSubmitting(false);
        resetHotkeyMode();
      }
    },
    onError: (error) => {
      onVoiceError?.(error);
      setIsSubmitting(false);
      if (!isSpacePressedRef.current) {
        resetHotkeyMode();
      }
    }
  });

  const startRecording = useCallback(async () => {
    isHotkeyModeRef.current = false;
    await rawStartRecording();
  }, [rawStartRecording]);

  const stopRecording = useCallback(() => {
    rawStopRecording();
  }, [rawStopRecording]);

  useEffect(() => {
    if (disableSpaceTrigger) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (!(e.code === 'Space' || e.key === ' ')) return;
      if (isSpacePressedRef.current || e.repeat) return;

      if (ignoreWhenFocusedInput && isEditableElement(document.activeElement)) {
        return;
      }

      isSpacePressedRef.current = true;
      e.preventDefault();

      spaceTimerRef.current = setTimeout(() => {
        isHotkeyModeRef.current = true;
        setIsHotkeyRecording(true);
        void rawStartRecording();
      }, longPressMs);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!(e.code === 'Space' || e.key === ' ')) return;

      if (spaceTimerRef.current) {
        clearTimeout(spaceTimerRef.current);
        spaceTimerRef.current = null;
      }

      isSpacePressedRef.current = false;

      if (isHotkeyModeRef.current) {
        e.preventDefault();
        setIsHotkeyRecording(false);
        rawStopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (spaceTimerRef.current) {
        clearTimeout(spaceTimerRef.current);
        spaceTimerRef.current = null;
      }
    };
  }, [disableSpaceTrigger, ignoreWhenFocusedInput, longPressMs, rawStartRecording, rawStopRecording]);

  const contextValue = useMemo<AINavContextValue>(
    () => ({
      isRecording,
      isHotkeyRecording,
      isSubmitting,
      startRecording,
      stopRecording
    }),
    [isHotkeyRecording, isRecording, isSubmitting, startRecording, stopRecording]
  );

  return (
    <AINavContext.Provider value={contextValue}>
      {renderOverlay ? <CVoiceWaveOverlay isRecording={isHotkeyRecording} /> : null}
      {children}
    </AINavContext.Provider>
  );
}

export function useAINav() {
  const context = useContext(AINavContext);
  if (!context) {
    throw new Error('useAINav must be used within CAINavProvider');
  }
  return context;
}

export const VoiceNavigatorProvider = CAINavProvider;
export const useVoiceNavigator = useAINav;
