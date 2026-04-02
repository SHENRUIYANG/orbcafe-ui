'use client'

import React, { useState } from 'react'
import { 
  Image as PhotoIcon, 
  FileText as DocumentIcon, 
  Play as PlayIcon,
  Download as ArrowDownTrayIcon,
  Eye as EyeIcon,
  AlertCircle as ExclamationCircleIcon
} from 'lucide-react'

interface MediaBlockProps {
  url: string
  filename?: string
  type?: 'image' | 'video' | 'audio' | 'document' | 'unknown'
  size?: number
  isStreaming?: boolean
  className?: string
}

export const MediaBlock: React.FC<MediaBlockProps> = ({
  url,
  filename = '未知文件',
  type = 'unknown',
  size,
  isStreaming = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePreview = () => {
    setIsPreviewOpen(true)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const renderIcon = () => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-6 h-6" />
      case 'video':
        return <PlayIcon className="w-6 h-6" />
      case 'audio':
        return <PlayIcon className="w-6 h-6" />
      case 'document':
        return <DocumentIcon className="w-6 h-6" />
      default:
        return <DocumentIcon className="w-6 h-6" />
    }
  }

  const renderContent = () => {
    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[150px] text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-red-500 mb-2" />
          <p className="text-base font-medium text-red-500 mb-1">加载失败</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">无法加载媒体文件</p>
        </div>
      )
    }

    if (type === 'image') {
      return (
        <div className="relative text-center">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[150px] text-gray-500 dark:text-gray-400">
              <PhotoIcon className="w-12 h-12 mb-2" />
              <p className="text-sm mt-2">加载中...</p>
            </div>
          )}
          <img
            src={url}
            alt={filename}
            onLoad={handleLoad}
            onError={handleError}
            className={`max-w-full max-h-[400px] rounded-lg cursor-pointer transition-transform hover:scale-[1.02] ${isLoading ? 'hidden' : ''}`}
            onClick={handlePreview}
          />
        </div>
      )
    }

    if (type === 'video') {
      return (
        <div className="text-center">
          <video
            src={url}
            controls
            onLoadedData={handleLoad}
            onError={handleError}
            className="max-w-full max-h-[400px] rounded-lg"
          >
            您的浏览器不支持视频播放
          </video>
        </div>
      )
    }

    if (type === 'audio') {
      return (
        <div className="text-center">
          <audio
            src={url}
            controls
            onLoadedData={handleLoad}
            onError={handleError}
            className="w-full max-w-[400px]"
          >
            您的浏览器不支持音频播放
          </audio>
        </div>
      )
    }

    // Default to document
    return (
      <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
        <div className="flex items-center text-blue-500">
          <DocumentIcon className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <p className="text-base font-medium text-gray-700 dark:text-gray-200 mb-1">{filename}</p>
          {size && <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(size)}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={`my-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden ${className}`}>
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center text-emerald-500">
            {renderIcon()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap overflow-hidden text-overflow-ellipsis">
              {filename}
            </span>
            {size && <span className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(size)}</span>}
          </div>
          {isStreaming && (
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {type === 'image' && (
            <button
              onClick={handlePreview}
              className="flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent text-gray-500 dark:text-gray-400 cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200"
              title="预览"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center w-8 h-8 border-none rounded-md bg-transparent text-gray-500 dark:text-gray-400 cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="下载"
            disabled={isStreaming || hasError}
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        {renderContent()}
      </div>

      {isPreviewOpen && type === 'image' && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] cursor-pointer" 
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img src={url} alt={filename} className="max-w-full max-h-full object-contain" />
            <button 
              className="absolute -top-10 -right-10 w-8 h-8 border-none rounded-full bg-white/20 text-white text-2xl cursor-pointer flex items-center justify-center hover:bg-white/30 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setIsPreviewOpen(false)
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaBlock
