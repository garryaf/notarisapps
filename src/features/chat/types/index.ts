import type { Chat as ChatDB, ChatSender } from '@/types/database'

export type { ChatDB as Chat }
export type { ChatSender }

export interface ChatResponse {
  message: string
  sender: ChatSender
  source: 'faq' | 'ai' | 'default'
}

export interface SendMessageInput {
  message: string
  orderId?: string
}
