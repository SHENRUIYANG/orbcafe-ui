'use client'

import React, { useState } from 'react'
import { StdChat, type ChatMessage, type AgentUICardHookEvent } from 'orbcafe-ui'

export default function ChatExampleClient() {
  const [lastCardEvent, setLastCardEvent] = useState<AgentUICardHookEvent | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I am your AI assistant. How can I help you today?',
      timestamp: new Date('2024-01-01T09:00:00')
    }
  ])
  const [isResponding, setIsResponding] = useState(false)

  const handleSend = async (content: string, files?: File[]) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setIsResponding(true)

const megaResponse = `
这是一条包含所有 AgentUI 支持效果的综合测试消息！

### 1. 基础 Markdown 渲染
**粗体文本**，*斜体文本*，~~删除线~~，[链接](https://example.com)

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

> 这是一段引用文本。Quote block test.

### 2. 数学公式 (MathBlock)
这是行内公式 $E=mc^2$。

下面是独立块公式：
$$
\int_{-\infty}^\infty e^{-x^2} dx = \sqrt{\pi}
$$

### 3. 代码高亮 (CodeBlock)
\`\`\`javascript
function calculateSum(a, b) {
  return a + b;
}
console.log(calculateSum(10, 20));
\`\`\`

### 4. Mermaid 图表 (MermaidBlock)
\`\`\`mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
\`\`\`

### 5. 思考块 (ThinkBox)
<think>
这里是 AI 的内部思考过程：
1. 分析用户请求：展示所有效果
2. 构造测试数据
3. 输出结果
这个思考过程默认应该是折叠的或者有特殊的样式。
</think>

### 6. 表格 (TableBlock)
| 功能 | 状态 | 备注 |
|---|---|---|
| Markdown | ✅ | 基础渲染正常 |
| Math | ✅ | 支持 KaTeX |
| Code | ✅ | 语法高亮正常 |

### 7. 动态卡片 (Dynamic Cards)

#### 错误卡片 (ErrorCard)
\`\`\`json
{
  "type": "error-card",
  "title": "数据库连接失败",
  "content": "无法连接到主数据库集群，请检查网络配置或联系管理员。",
  "errorCode": "ERR_DB_001",
  "stack": "Error: Connection timeout at db.connect()...",
  "closable": true
}
\`\`\`

#### 警告卡片 (WarningCard)
\`\`\`json
{
  "type": "warning-card",
  "title": "API 速率限制",
  "content": "您的 API 请求频率已接近上限。",
  "warnings": ["当前使用量：95%", "将在 10 分钟后重置限制"],
  "closable": true,
  "actionText": "升级套餐"
}
\`\`\`

#### 建议卡片 (SuggestionsCard)
\`\`\`json
{
  "type": "suggestions-card",
  "title": "您可能想了解",
  "content": "根据您当前的问题，为您推荐以下相关主题：",
  "suggestions": [
    "如何优化图表渲染性能？",
    "自定义卡片的开发指南",
    "React Hooks 的最佳实践"
  ],
  "maxDisplay": 3,
  "closable": true
}
\`\`\`

#### 工具结果卡片 (ToolResultCard)
\`\`\`json
{
  "type": "tool-result-card",
  "title": "数据分析完成",
  "content": "成功处理了 10,000 条记录。",
  "toolName": "DataProcessor",
  "status": "success",
  "duration": 1.25,
  "result": {
    "rows": 10000,
    "anomalies": 12
  },
  "closable": true
}
\`\`\`

#### 图表卡片 (ChartCard)
\`\`\`json
{
  "type": "bar-chart-card",
  "title": "月度访问量",
  "subtitle": "2024年第一季度",
  "data": [
    {"name": "Jan", "value": 400},
    {"name": "Feb", "value": 300},
    {"name": "Mar", "value": 500}
  ]
}
\`\`\`
`

    // Simulate AI response
    setTimeout(() => {
      const isTest = content.toLowerCase().includes('测试') || content.toLowerCase().includes('test');
      const responseContent = isTest ? megaResponse : `I received your message: "${content}". This is a simulated response.`;
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        isStreaming: true
      }
      setMessages(prev => [...prev, assistantMsg])
      setIsResponding(false)
    }, 1500)
  }

  return (
    <div className="h-[calc(100vh-2rem)] w-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {lastCardEvent && (
        <div className="px-4 py-2 text-xs border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50">
          Card Hook: {lastCardEvent.cardType} / {lastCardEvent.action}
        </div>
      )}
      <StdChat
        messages={messages}
        onSend={handleSend}
        isResponding={isResponding}
        placeholder="Type a message to chat..."
        streamChunkSize={3}
        streamIntervalMs={20}
        onMessageStreamingComplete={(messageId) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg))
          )
        }}
        cardHooks={{
          onCardEvent: (event) => {
            setLastCardEvent(event)
          }
        }}
      />
    </div>
  )
}
