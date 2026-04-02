'use client'

import React from 'react'
import MarkdownRenderer from '../renderers/MarkdownRenderer'
import DynamicCardRenderer from './DynamicCardRenderer'
import type { AgentUICardHooks } from '../cardTypes'

interface ContentBlock {
  type: 'markdown' | 'json-card' | 'code' | 'mixed'
  content: string
  startIndex: number
  endIndex: number
  metadata?: any
}

interface ContentAnalysis {
  blocks: ContentBlock[]
  hasComplexContent: boolean
  overallType: 'simple' | 'complex'
}

interface UniversalContentRendererProps {
  content: string
  className?: string
  messageId?: string
  cardHooks?: AgentUICardHooks
}

class ContentAnalyzer {
  
  static analyze(content: string): ContentAnalysis {
    if (!content.trim()) {
      return {
        blocks: [],
        hasComplexContent: false,
        overallType: 'simple'
      }
    }

    const jsonCardRegex = /```json\s*\{\s*"type":\s*"[^"]+"/g
    const hasJsonCards = jsonCardRegex.test(content)

    // 检测复杂HTML内容
    const hasHtmlContent = /<[^>]+>[\s\S]*?<\/[^>]+>/.test(content)

    // 检测特殊交互内容
    const hasInteractiveContent = content.includes('NQ#') || content.includes('data-component')

    const hasComplexContent = hasJsonCards || hasHtmlContent || hasInteractiveContent

    if (!hasComplexContent) {
      // 简单文本内容，直接用Markdown处理
      return {
        blocks: [{
          type: 'markdown',
          content: content,
          startIndex: 0,
          endIndex: content.length
        }],
        hasComplexContent: false,
        overallType: 'simple'
      }
    }

    // 如果有复杂内容，尝试分割
    // 这里简化处理，直接视为markdown（因为DynamicCardRenderer可以处理markdown fallback）
    // 实际项目中可以做更精细的分割
    return {
      blocks: [{
        type: 'mixed',
        content: content,
        startIndex: 0,
        endIndex: content.length
      }],
      hasComplexContent: true,
      overallType: 'complex'
    }
  }
}

// --------------------------
// 第三部分: 通用渲染器组件
// --------------------------

const UniversalContentRenderer: React.FC<UniversalContentRendererProps> = ({
  content,
  className = '',
  messageId,
  cardHooks
}) => {
  // 使用useMemo缓存分析结果
  const analysis = React.useMemo(() => ContentAnalyzer.analyze(content), [content])

  // 渲染逻辑
  return (
    <div className={`universal-content-renderer ${className}`}>
      {analysis.blocks.map((block, index) => {
        // 对于混合内容或卡片，尝试使用DynamicCardRenderer
        if (block.type === 'mixed' || block.type === 'json-card') {
          return (
            <DynamicCardRenderer 
              key={`block-${index}`} 
              content={block.content}
              messageId={messageId}
              cardHooks={cardHooks}
            />
          )
        }
        
        // 默认为Markdown渲染
        return (
          <MarkdownRenderer
            key={`block-${index}`}
            content={block.content}
            enableCodeHighlight={true}
            enableMath={true}
            enableMermaid={true}
            messageId={messageId}
            cardHooks={cardHooks}
          />
        )
      })}
    </div>
  )
}

export default UniversalContentRenderer
