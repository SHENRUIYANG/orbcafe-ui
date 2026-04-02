'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseVoiceInputOptions, UseVoiceInputResult } from '../types';

export function useVoiceInput({
  onTextUpdate,
  onComplete,
  onError,
  wsUrl = 'ws://localhost:8765',
  silenceThresholdMs = 2000,
  minVolumeRms = 0.015
}: UseVoiceInputOptions): UseVoiceInputResult {
  const [isRecording, setIsRecording] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  const isStoppingRef = useRef(false);
  const isStartingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    isStartingRef.current = false;
    setIsRecording(false);
  }, []);

  const stopRecording = useCallback(() => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
    }

    setTimeout(cleanup, 500);
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    if (isRecording || isStartingRef.current) return;

    isStartingRef.current = true;
    isStoppingRef.current = false;
    lastSpeechTimeRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      streamRef.current = stream;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsRecording(true);
        isStartingRef.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'recognition') {
            if (data.is_final) {
              void onComplete(data.text);
            } else {
              onTextUpdate?.(data.text);
            }
          } else if (data.type === 'error') {
            const message = data.message || 'Voice recognition error';
            onError?.(message);
            stopRecording();
          }
        } catch {
          onError?.('Failed to parse voice message');
        }
      };

      ws.onerror = () => {
        onError?.('Voice service connection failed');
        cleanup();
      };

      ws.onclose = () => {
        cleanup();
      };

      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AudioContext is not supported in this browser');
      }
      const audioContext = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        let sumSquares = 0;
        for (let i = 0; i < inputData.length; i += 1) {
          sumSquares += inputData[i] * inputData[i];
        }

        const rms = Math.sqrt(sumSquares / inputData.length);
        if (rms > minVolumeRms) {
          lastSpeechTimeRef.current = Date.now();
        } else {
          const silenceDuration = Date.now() - lastSpeechTimeRef.current;
          if (silenceDuration > silenceThresholdMs && !isStoppingRef.current) {
            stopRecording();
            return;
          }
        }

        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i += 1) {
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }

        wsRef.current.send(pcmData.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch {
      onError?.('Cannot access microphone');
      cleanup();
    }
  }, [
    cleanup,
    isRecording,
    minVolumeRms,
    onComplete,
    onError,
    onTextUpdate,
    silenceThresholdMs,
    stopRecording,
    wsUrl,
  ]);

  useEffect(() => cleanup, [cleanup]);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
}
