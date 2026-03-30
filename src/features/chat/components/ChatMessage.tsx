'use client'

import { cn } from '@/lib/utils'

interface ChatMessageProps {
  sender: 'user' | 'bot'
  message: string
}

export function ChatMessage({ sender, message }: ChatMessageProps) {
  const isUser = sender === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {message}
      </div>
    </div>
  )
}
