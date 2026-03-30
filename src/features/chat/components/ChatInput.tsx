'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed) {
      onSend(trimmed)
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t">
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Ketik pesan..."
        disabled={disabled}
        aria-label="Ketik pesan chat"
        className="text-sm"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !text.trim()}
        aria-label="Kirim pesan"
        className="h-8 w-8"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  )
}
