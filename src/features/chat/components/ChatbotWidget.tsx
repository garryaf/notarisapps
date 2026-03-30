'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import type { ChatResponse } from '../types'

interface Message {
  id: string
  sender: 'user' | 'bot'
  message: string
  timestamp: Date
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      message: 'Halo! Saya asisten virtual notaris. Ada yang bisa saya bantu?',
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data: ChatResponse = await res.json()
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        message: data.message,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          message: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="flex flex-col w-80 h-96 bg-white border rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-lg">
            <span className="font-semibold text-sm">Asisten Notaris</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/80"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map(msg => (
              <ChatMessage key={msg.id} sender={msg.sender} message={msg.message} />
            ))}
            {isLoading && (
              <div className="text-xs text-muted-foreground">Mengetik...</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      ) : (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
          aria-label="Buka chatbot"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
