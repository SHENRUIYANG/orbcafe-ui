export type MessageRating = 'like' | 'dislike' | null

export interface ChatItem {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp?: number | Date
  feedback?: {
    rating: MessageRating
  }
  agent_thoughts?: any[]
  isStreaming?: boolean
}
