import { sendEmail as resendSendEmail } from '@/lib/resend'
import type { NotificationResult } from '../types'

export async function sendEmail(
  recipient: string,
  subject: string,
  body: string,
  deps?: {
    sendEmailFn?: (payload: { to: string; subject: string; html: string }) => Promise<{ id: string }>
  }
): Promise<NotificationResult> {
  const send = deps?.sendEmailFn ?? resendSendEmail

  try {
    const result = await send({
      to: recipient,
      subject,
      html: body,
    })

    return {
      success: true,
      notificationId: result.id,
    }
  } catch (error) {
    console.error('Email send failed:', error)
    return {
      success: false,
      notificationId: '',
    }
  }
}
