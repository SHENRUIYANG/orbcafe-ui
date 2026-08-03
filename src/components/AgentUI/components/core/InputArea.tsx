'use client'

import { AddRoundedIcon, Close, HardwareRoundedIcon, InsertDriveFile, SendRoundedIcon, Stop } from '../../../../lib/orbis-compat';
import React, { useState, useCallback, useRef } from 'react'
import { cn } from '../../lib/utils'
import { VoiceInputButton } from './VoiceInputButton'

const STYLES = {
  container: 'w-full max-w-4xl mx-auto',

  inputContainer: cn(
    'w-full flex flex-col border border-[var(--orb-border,#dbdbdb)] bg-[var(--orb-canvas,#ffffff)] transition-colors duration-200',
    'rounded-[var(--orb-r,10px)]',
    'focus-within:border-[var(--orb-primary,#154194)] focus-within:ring-1 focus-within:ring-[var(--orb-focus-ring,#e4e9f5)]'
  ),

  dragActive: 'border-[var(--orb-primary,#154194)] bg-[var(--orb-p50,#eef2f9)]',

  textareaWrapper: 'flex-1 relative flex items-center',

  textarea: cn(
    'w-full outline-none appearance-none resize-none bg-transparent border-none text-sm font-normal py-3 px-3',
    'placeholder:text-[var(--orb-muted,#8c8c8c)] placeholder:font-normal',
    'text-[var(--orb-fg,#555555)] selection:bg-[var(--orb-p100,#e4e9f5)]',
    'focus:ring-0 focus:outline-none focus:border-none focus:shadow-none',
    'min-h-[44px] max-h-[12em] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600'
  ),

  filePreviewArea: 'px-4 pt-3 pb-1 flex flex-wrap gap-2',

  fileTag: cn(
    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium',
    'bg-[var(--orb-surface,#f5f5f5)] text-[var(--orb-fg,#555555)]',
    'border border-[var(--orb-border,#dbdbdb)]',
    'transition-all hover:bg-[var(--orb-hover,#eef2f9)]'
  ),

  toolbar: 'flex items-center justify-between px-4 pb-3',
  toolbarLeft: 'flex items-center gap-1',
  toolbarRight: 'flex-shrink-0',

  buttonBase: 'flex items-center justify-center transition-all duration-200 rounded-full',

  buttonSmall: 'h-[38px] w-[38px] shrink-0 md:h-8 md:w-8',
  buttonLarge: 'h-[38px] w-[38px] shrink-0 md:h-8 md:w-8',

  buttonNormal: cn(
    'bg-transparent hover:bg-[var(--orb-hover,#eef2f9)] text-[var(--orb-muted,#8c8c8c)] hover:text-[var(--orb-fg,#555555)]',
    'cursor-pointer active:scale-95'
  ),
  buttonDisabled: 'cursor-not-allowed opacity-50 bg-[var(--orb-disabled-bg,#f5f5f5)] border border-[var(--orb-border,#dbdbdb)]',

  sendButton: cn(
    'cursor-pointer bg-[var(--orb-primary,#154194)] hover:bg-[var(--orb-p600,#0e2d63)] text-white shadow-none active:scale-95'
  ),

  sendButtonDisabled: cn(
    'cursor-not-allowed opacity-40 bg-[var(--orb-disabled-bg,#f5f5f5)] text-[var(--orb-disabled-fg,#8c8c8c)]'
  ),

  stopButton: cn(
    'cursor-pointer bg-[var(--orb-err,#c43f02)] hover:opacity-90 text-white shadow-none active:scale-95'
  )
} as const

const TEXTAREA_STYLE = {
  padding: 0,
  lineHeight: '1.5',
  border: 'none !important',
  boxShadow: 'none !important',
  backgroundColor: 'transparent',
  height: 'auto',
  fontFeatureSettings: '"liga" 1, "kern" 1',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale'
} as const

interface AttachmentButtonProps {
  enabled: boolean
  onClick: () => void
}

const AttachmentButton: React.FC<AttachmentButtonProps> = ({ enabled, onClick }) => (
  <button
    className={cn(STYLES.buttonBase, STYLES.buttonSmall, STYLES.buttonNormal)}
    onClick={onClick}
    disabled={!enabled}
    aria-label="Upload file"
    type="button"
  >
    <AddRoundedIcon size={16} />
  </button>
)

const ToolsButton: React.FC = () => (
  <button
    className={cn(STYLES.buttonBase, 'h-[38px] gap-1 rounded-full px-2.5 md:h-8 md:px-2', STYLES.buttonNormal)}
    aria-label="Tools"
    type="button"
  >
    <HardwareRoundedIcon size={15} />
    <span className="text-xs font-medium">Tools</span>
  </button>
)

interface SendButtonProps {
  canSend: boolean
  isResponding: boolean
  onSend: () => void
  onStop: () => void
}

const SendButton: React.FC<SendButtonProps> = ({ canSend, isResponding, onSend, onStop }) => {
  if (isResponding) {
    return (
      <button 
        className={cn(STYLES.buttonBase, STYLES.buttonSmall, STYLES.stopButton)}
        onClick={onStop}
        aria-label="Stop generating"
        type="button"
      >
        <Stop size={15} />
      </button>
    )
  }

  return (
    <button 
      className={cn(
        STYLES.buttonBase,
        STYLES.buttonSmall,
        canSend ? STYLES.sendButton : STYLES.sendButtonDisabled
      )}
      onClick={onSend}
      disabled={!canSend}
      aria-label="Send message"
      type="button"
    >
      <SendRoundedIcon size={16} className={canSend ? 'text-[var(--orb-on-primary,#ffffff)]' : 'text-[var(--orb-disabled-fg,#8c8c8c)]'} />
    </button>
  )
}

export interface InputAreaProps {
  onSend: (content: string, files?: File[]) => Promise<void>
  onStop: () => void
  isResponding?: boolean
  placeholder?: string
  getText?: (elementId: string, fallback?: string) => string
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  onStop,
  isResponding = false,
  placeholder,
  getText
}) => {

  const [query, setQuery] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isComposing, setIsComposing] = useState(false) 
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const placeholderText = placeholder || (getText ? getText('00019', 'Type a message...') : 'Type a message...')

  const canSend = (query.trim().length > 0 || files.length > 0) && !isResponding
  const visionConfig = { enabled: true }

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value)
    
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => {
        
        const duplicateFiles = newFiles.filter(newFile => 
          prev.some(existingFile => 
            existingFile.name === newFile.name && 
            existingFile.size === newFile.size
          )
        )
        
        if (duplicateFiles.length > 0) {
           console.warn('Duplicate files ignored:', duplicateFiles.map(f => f.name))
        }

        const uniqueNewFiles = newFiles.filter(newFile => 
          !prev.some(existingFile => 
            existingFile.name === newFile.name && 
            existingFile.size === newFile.size
          )
        )
        
        return [...prev, ...uniqueNewFiles]
      })
      
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleInputSend = useCallback(async () => {
    if (!canSend) return

    const content = query
    const currentFiles = [...files]

    setQuery('')
    setFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''

    try {
      await onSend(content, currentFiles)
    } catch (error) {
      console.error('Failed to send message:', error)
      
      setQuery(content)
      setFiles(currentFiles)
    }
  }, [query, canSend, onSend, files])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      handleInputSend()
    }
  }, [handleInputSend, isComposing])

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true)
  }, [])

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false)
  }, [])

  const handleVoiceTextUpdate = useCallback((text: string) => {
    setQuery(text)
  }, [])

  const handleVoiceComplete = useCallback((text: string) => {
    setQuery(text)
  }, [])

  const handleVoiceCancel = useCallback(() => {
    
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  return (
    <div className={STYLES.container}>
      <div className="relative">
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <div 
          className={cn(STYLES.inputContainer, isDragging && STYLES.dragActive)}
          style={{ borderRadius: '24px' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {files.length > 0 && (
            <div className={STYLES.filePreviewArea}>
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className={STYLES.fileTag}>
                  <InsertDriveFile sx={{ fontSize: 16 }} className="text-blue-500" />
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button 
                    onClick={() => removeFile(index)}
                    className="ml-1 hover:text-red-500 focus:outline-none"
                    type="button"
                  >
                    <Close sx={{ fontSize: 16 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex w-full flex-col p-2">
            <div className={cn(STYLES.textareaWrapper, "min-h-[52px] px-2 pb-2 pt-1.5 md:min-h-[44px]")}>
              <textarea
                className={cn(STYLES.textarea, "min-h-[24px] py-0 px-0")}
                placeholder={placeholderText}
                value={query}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                style={TEXTAREA_STYLE}
                aria-label="Message input"
                spellCheck={false}
                rows={1}
              />
            </div>

            <div className="flex items-center justify-between px-1 pb-0.5">
              <div className="flex items-center gap-1" role="toolbar" aria-label="Input tools">
                <AttachmentButton 
                  enabled={visionConfig.enabled} 
                  onClick={triggerFileSelect}
                />
                <ToolsButton />
              </div>
              
              <div className="flex items-center gap-1">
                <VoiceInputButton
                  onTextUpdate={handleVoiceTextUpdate}
                  onComplete={handleVoiceComplete}
                  onCancel={handleVoiceCancel}
                  disabled={isResponding}
                  className={STYLES.buttonSmall}
                />
                <SendButton 
                  canSend={canSend} 
                  isResponding={isResponding} 
                  onSend={handleInputSend} 
                  onStop={onStop} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InputArea
