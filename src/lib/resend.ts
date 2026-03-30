const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const RESEND_API_URL = 'https://api.resend.com/emails'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@notary-platform.com'

export interface ResendEmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: ResendEmailPayload): Promise<{ id: string }> {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Resend API error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  return { id: data.id }
}
