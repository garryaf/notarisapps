import { sendWhatsApp as fonnteSendWhatsApp } from '@/lib/fonnte'
import type { NotificationResult } from '../types'

export async function sendWhatsApp(
  recipient: string,
  message: string,
  deps?: {
    sendWhatsAppFn?: (payload: { target: string; message: string }) => Promise<{ id: string }>
  }
): Promise<NotificationResult> {
  const send = deps?.sendWhatsAppFn ?? fonnteSendWhatsApp

  try {
    const result = await send({
      target: recipient,
      message,
    })

    return {
      success: true,
      notificationId: result.id,
    }
  } catch (error) {
    console.error('WhatsApp send failed:', error)
    return {
      success: false,
      notificationId: '',
    }
  }
}
