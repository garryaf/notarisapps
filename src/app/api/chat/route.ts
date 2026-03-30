import { NextRequest, NextResponse } from 'next/server'
import { sendMessage } from '@/features/chat/services/chat-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, orderId } = body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const response = await sendMessage(message.trim(), orderId)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
