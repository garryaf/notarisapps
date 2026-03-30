const FONNTE_API_KEY = process.env.FONNTE_API_KEY || ''
const FONNTE_API_URL = 'https://api.fonnte.com/send'

export interface FonnteMessagePayload {
  target: string
  message: string
}

export async function sendWhatsApp(payload: FonnteMessagePayload): Promise<{ id: string }> {
  if (!FONNTE_API_KEY) {
    throw new Error('FONNTE_API_KEY is not configured')
  }

  const response = await fetch(FONNTE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': FONNTE_API_KEY,
    },
    body: JSON.stringify({
      target: payload.target,
      message: payload.message,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Fonnte API error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  return { id: data.id || 'fonnte-' + Date.now() }
}
