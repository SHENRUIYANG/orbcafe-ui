'use client'

import React, { useState, useCallback, useRef } from 'react'
import { cn } from '../../lib/utils'
import { VoiceInputButton } from './VoiceInputButton'
import { Stop, Close, InsertDriveFile } from '@mui/icons-material'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import HardwareRoundedIcon from '@mui/icons-material/HardwareRounded'

const STYLES = {
  container: 'w-full max-w-4xl mx-auto',
  
  inputContainer: cn(
    
    'w-full border backdrop-blur-xl transition-all duration-300 shadow-2xl flex flex-col',
    
    'bg-white/80 dark:bg-gray-900/80', 
    
    'border-gray-200/60 dark:border-gray-600/40',
    
    'shadow-gray-900/5',
    
    'hover:border-blue-300/80 hover:shadow-blue-500/10 hover:shadow-2xl',
    
    'focus-within:border-blue-400/90 focus-within:shadow-blue-500/20 focus-within:shadow-3xl focus-within:scale-[1.005] transform-gpu'
  ),

  dragActive: 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20',
  
  textareaWrapper: 'flex-1 relative flex items-center', 
  
  textarea: cn(
    
    'w-full outline-none appearance-none resize-none bg-transparent border-none text-sm font-normal py-3 px-2',
    
    'placeholder:text-gray-400/70 dark:placeholder:text-gray-500/60 placeholder:font-normal',
    
    'text-gray-800 dark:text-gray-100 selection:bg-blue-200/50 dark:selection:bg-blue-500/30',
    
    'focus:ring-0 focus:outline-none focus:border-none focus:shadow-none',
    
    'min-h-[44px] max-h-[12em] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600'
  ),

  filePreviewArea: 'px-6 pt-3 pb-1 flex flex-wrap gap-2',
  
  fileTag: cn(
    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium',
    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    'border border-gray-200 dark:border-gray-700',
    'transition-all hover:bg-gray-200 dark:hover:bg-gray-700'
  ),
  
  toolbar: 'flex items-center justify-between px-6 pb-4',
  toolbarLeft: 'flex items-center gap-1',
  toolbarRight: 'flex-shrink-0',
  
  buttonBase: 'flex items-center justify-center transition-all duration-200 rounded-full', 
  
  buttonSmall: 'w-10 h-10',
  buttonLarge: 'w-10 h-10',
  
  buttonNormal: cn(
    'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400',
    'cursor-pointer active:scale-95'
  ),
  buttonDisabled: 'cursor-not-allowed opacity-50 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600',
  
  sendButton: cn(
    'cursor-pointer bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-none active:scale-95'
  ),
  
  sendButtonDisabled: cn(
    'cursor-not-allowed opacity-40 bg-transparent text-gray-400'
  ),
  
  stopButton: cn(
    'cursor-pointer bg-red-500 hover:bg-red-600 text-white shadow-sm active:scale-95'
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
    <AddRoundedIcon sx={{ fontSize: 24 }} />
  </button>
)

const ToolsButton: React.FC = () => (
  <button
    className={cn(STYLES.buttonBase, 'h-10 px-3 py-2 gap-1.5 rounded-full', STYLES.buttonNormal)}
    aria-label="Tools"
    type="button"
  >
    <HardwareRoundedIcon sx={{ fontSize: 20 }} />
    <span className="text-sm font-medium">Tools</span>
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
        <Stop sx={{ fontSize: 20 }} />
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
      <SendRoundedIcon sx={{ fontSize: 24 }} className={canSend ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'} />
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
          style={{ borderRadius: '32px' }}
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

          <div className="flex flex-col w-full p-2">
            <div className={cn(STYLES.textareaWrapper, "px-3 pt-2 pb-3 min-h-[60px]")}>
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

            <div className="flex items-center justify-between px-1 pb-1">
              <div className="flex items-center gap-1" role="toolbar" aria-label="Input tools">
                <AttachmentButton 
                  enabled={visionConfig.enabled} 
                  onClick={triggerFileSelect}
                />
                <ToolsButton />
              </div>
              
              <div className="flex items-center gap-2">
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
