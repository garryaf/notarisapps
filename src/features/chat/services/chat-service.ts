import { createClient } from '@/lib/supabase/client'
import type { Chat } from '@/types/database'
import type { ChatResponse } from '../types'
import { findAnswer } from './faq-service'
import { getResponse as getAIResponse } from './ai-service'

export const DEFAULT_FALLBACK_MESSAGE =
  'Maaf, saya tidak dapat menjawab pertanyaan Anda saat ini. Silakan hubungi notaris secara langsung'

export async function sendMessage(
  message: string,
  orderId?: string,
  deps?: {
    faqFindAnswer?: (q: string) => string | null
    aiGetResponse?: (q: string, ctx?: string) => Promise<string>
    saveChat?: (sender: 'user' | 'bot', msg: string, orderId?: string) => Promise<void>
  }
): Promise<ChatResponse> {
  const faqFind = deps?.faqFindAnswer ?? findAnswer
  const aiGet = deps?.aiGetResponse ?? getAIResponse
  const save = deps?.saveChat ?? saveMessage

  // Save user message
  await save('user', message, orderId)

  // 1. Try FAQ first
  const faqAnswer = faqFind(message)
  if (faqAnswer) {
    await save('bot', faqAnswer, orderId)
    return { message: faqAnswer, sender: 'bot', source: 'faq' }
  }

  // 2. Try AI fallback
  try {
    const aiAnswer = await aiGet(message)
    await save('bot', aiAnswer, orderId)
    return { message: aiAnswer, sender: 'bot', source: 'ai' }
  } catch {
    // 3. Default fallback
    await save('bot', DEFAULT_FALLBACK_MESSAGE, orderId)
    return { message: DEFAULT_FALLBACK_MESSAGE, sender: 'bot', source: 'default' }
  }
}

export async function getHistory(orderId?: string): Promise<Chat[]> {
  const supabase = createClient()

  let query = supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: true })

  if (orderId) {
    query = query.eq('order_id', orderId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data as Chat[]
}

async function saveMessage(sender: 'user' | 'bot', message: string, orderId?: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('chats')
    .insert({
      sender,
      message,
      order_id: orderId || null,
    } as any)

  if (error) {
    console.error('Failed to save chat message:', error.message)
  }
}
