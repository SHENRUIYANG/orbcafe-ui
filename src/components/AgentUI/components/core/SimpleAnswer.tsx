'use client'

import { type FC, useState, useEffect } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { ChatItem, MessageRating } from '../../types'
import UniversalContentRenderer from './ContentRenderer'
import { MiniAnswerIsland, type MiniAnswerIslandButton } from './MiniAnswerIsland'
import { cn } from '../../lib/utils'

const RatingIcon: FC<{ isLike: boolean }> = ({ isLike }) => {
  return isLike ? <ThumbsUp className='w-4 h-4' /> : <ThumbsDown className='w-4 h-4' />
}

export type IAnswerProps = {
  item: ChatItem
  feedbackDisabled?: boolean
  onFeedback?: (messageId: string, feedback: { rating: MessageRating | null }) => Promise<void>
  isResponding?: boolean
  onNQClick?: (nq: string) => void
  onCopy?: (content: string) => void
  onRegenerate?: (messageId: string) => void
  onReadAloud?: (content: string) => void
}

export const SimpleAnswer: FC<IAnswerProps> = ({
  item,
  feedbackDisabled = false,
  onFeedback,
  isResponding,
  onCopy,
  onRegenerate,
  onReadAloud,
}) => {
  const {
    id,
    content,
    feedback,
    agent_thoughts
  } = item;

  const isAgentMode = !!agent_thoughts && agent_thoughts.length > 0;
  const [isReading, setIsReading] = useState(false);
  const [speechInstance, setSpeechInstance] = useState<SpeechSynthesisUtterance | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content || '');
      onCopy?.(content || '');
      
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleRegenerate = () => {
    onRegenerate?.(id);
  };

  const handleReadAloud = () => {
    if (isReading) {
      
      speechSynthesis.cancel();
      setIsReading(false);
      setSpeechInstance(null);
    } else {
      
      if (content) {
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.lang = 'zh-CN'; 
        utterance.rate = 0.8; 
        utterance.pitch = 1; 
        
        utterance.onstart = () => {
          setIsReading(true);
        };
        
        utterance.onend = () => {
          setIsReading(false);
          setSpeechInstance(null);
        };
        
        utterance.onerror = () => {
          setIsReading(false);
          setSpeechInstance(null);
        };
        
        setSpeechInstance(utterance);
        speechSynthesis.speak(utterance);
        onReadAloud?.(content);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (speechInstance) {
        speechSynthesis.cancel();
      }
    };
  }, [speechInstance]);

  const renderFeedbackRating = (rating: MessageRating | undefined) => {
    if (!rating)
      return null

    const isLike = rating === 'like'
    const ratingIconClassname = isLike ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' : 'text-red-600 bg-red-100 hover:bg-red-200'
    
    return (
      <div
        className={'relative box-border flex items-center justify-center h-7 w-7 p-0.5 rounded-lg bg-white dark:bg-gray-800 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm'}
        onClick={async () => {
          await onFeedback?.(id, { rating: null })
        }}
        title={isLike ? '取消赞同' : '取消反对'}
      >
        <div className={cn(ratingIconClassname, "rounded-lg h-6 w-6 flex items-center justify-center")}>
          <RatingIcon isLike={isLike} />
        </div>
      </div>
    )
  }

  const renderItemOperation = () => {
    
    const buttons: MiniAnswerIslandButton[] = [
      {
        type: 'refresh',
        onClick: handleRegenerate,
        disabled: false
      },
      {
        type: 'copy', 
        onClick: handleCopy,
        disabled: false
      },
      {
        type: 'volume',
        onClick: handleReadAloud,
        active: isReading,
        disabled: false
      }
    ]

    if (!feedback?.rating) {
      buttons.push(
        {
          type: 'like',
          onClick: () => onFeedback?.(id, { rating: 'like' }),
          disabled: false
        },
        {
          type: 'dislike',
          onClick: () => onFeedback?.(id, { rating: 'dislike' }),
          disabled: false
        }
      )
    }

    return <MiniAnswerIsland buttons={buttons} size="sm" variant="default" />
  }

  const agentModeAnswer = (
    <div>
      {agent_thoughts?.map((item, index) => (
        <div key={index}>
            {item.thought && (
              <UniversalContentRenderer content={item.thought} />
            )}
          </div>
      ))}
    </div>
  )

  const notAgentModeAnswer = (
    <div>
      {content && (
        <div className="answer-content">
          <UniversalContentRenderer 
            content={content}
          />
        </div>
      )}
    </div>
  );

  return (
    <div key={id} className="mb-4">
      <div className="text-sm text-black dark:text-gray-100" style={{ lineHeight: '1.5', fontSize: '16px', fontWeight: '280', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div className="min-w-0 break-words" style={{ lineHeight: '1.5', fontSize: '16px', fontWeight: '280', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          {(isResponding && (isAgentMode ? (!content && (agent_thoughts || []).filter(item => !!item.thought || !!item.tool).length === 0) : !content))
            ? (
              <div className='flex items-center justify-start'>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="ml-2 text-gray-500">Thinking...</span>
              </div>
            )
            : (
              isAgentMode ? agentModeAnswer : notAgentModeAnswer
            )}
        </div>
        
        {!isResponding && content && (
          <div className='flex flex-row justify-start gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700'>
            {!feedbackDisabled && renderItemOperation()}
            {!feedbackDisabled && renderFeedbackRating(feedback?.rating)}
          </div>
        )}
      </div>
    </div>
  )
}

export default SimpleAnswer
