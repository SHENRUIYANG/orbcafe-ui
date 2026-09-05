'use client'

import { MicOffRoundedIcon, MicRoundedIcon } from '../../../../lib/orbis-compat';
import React from 'react'
import { useVoiceInput } from '@/components/AINav/Hooks/useVoiceInput'
import { cn } from '../../lib/utils'

interface VoiceInputProps {
  onTextUpdate?: (text: string) => void
  onComplete?: (text: string) => void
  onCancel?: () => void
  disabled?: boolean
  className?: string
}

export const VoiceInputButton: React.FC<VoiceInputProps> = ({
  onTextUpdate,
  onComplete,
  onCancel,
  disabled,
  className
}) => {
  const { isRecording, startRecording, stopRecording } = useVoiceInput({
    onTextUpdate,
    onComplete: (text) => {
      onComplete?.(text)
    },
    onError: (err) => {
      console.error('Voice input error:', err)
      onCancel?.()
    }
  })

  const handleClick = async () => {
    if (isRecording) {
      stopRecording()
    } else {
      await startRecording()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "transition-all duration-200 flex items-center justify-center rounded-full",
        isRecording
          ? "bg-[color-mix(in_oklch,var(--orb-status-error)_12%,transparent)] text-[var(--orb-status-error)] hover:bg-[color-mix(in_oklch,var(--orb-status-error)_20%,transparent)] animate-pulse"
          : "bg-transparent hover:bg-[var(--orb-hover)] text-[var(--orb-muted)] active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      title={isRecording ? "Stop recording" : "Start recording"}
      type="button"
    >
      {isRecording ? <MicOffRoundedIcon size={16} /> : <MicRoundedIcon size={16} />}
    </button>
  )
}
