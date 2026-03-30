const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
const AI_API_KEY = process.env.AI_API_KEY || ''

export async function getResponse(question: string, context?: string): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error('AI API key not configured')
  }

  const systemPrompt = `Anda adalah asisten virtual untuk platform layanan notaris. Jawab pertanyaan pengguna dengan sopan dan informatif dalam Bahasa Indonesia.${context ? ` Konteks: ${context}` : ''}`

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`)
  }

  const data = await response.json()
  const message = data?.choices?.[0]?.message?.content

  if (!message) {
    throw new Error('AI returned empty response')
  }

  return message.trim()
}
