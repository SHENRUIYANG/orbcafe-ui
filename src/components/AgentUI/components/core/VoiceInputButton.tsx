'use client'

import React from 'react'
import MicRoundedIcon from '@mui/icons-material/MicRounded'
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded'
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
          ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse" 
          : "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      title={isRecording ? "Stop recording" : "Start recording"}
      type="button"
    >
      {isRecording ? <MicOffRoundedIcon sx={{ fontSize: 24 }} /> : <MicRoundedIcon sx={{ fontSize: 24 }} />}
    </button>
  )
}
