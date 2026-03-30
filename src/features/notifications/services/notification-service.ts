import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus, NotificationStatus } from '@/types/database'
import type { NotificationResult } from '../types'
import { sendEmail } from './email-service'
import { sendWhatsApp } from './whatsapp-service'

export interface NotificationDeps {
  sendEmailFn?: (recipient: string, subject: string, body: string) => Promise<NotificationResult>
  sendWhatsAppFn?: (recipient: string, message: string) => Promise<NotificationResult>
  insertNotification?: (record: {
    order_id: string
    type: 'email' | 'whatsapp'
    recipient: string
    message: string
    status: NotificationStatus
  }) => Promise<void>
}

async function defaultInsertNotification(record: {
  order_id: string
  type: 'email' | 'whatsapp'
  recipient: string
  message: string
  status: NotificationStatus
}): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .insert(record as any)

  if (error) {
    console.error('Failed to insert notification record:', error.message)
  }
}

export async function notifyStatusChange(
  order: Order,
  oldStatus: OrderStatus,
  newStatus: OrderStatus,
  phone?: string,
  deps?: NotificationDeps
): Promise<void> {
  const sendEmailFn = deps?.sendEmailFn ?? ((r, s, b) => sendEmail(r, s, b))
  const sendWhatsAppFn = deps?.sendWhatsAppFn ?? ((r, m) => sendWhatsApp(r, m))
  const insert = deps?.insertNotification ?? defaultInsertNotification

  const message = `Status pesanan ${order.tracking_code} telah berubah dari "${oldStatus}" menjadi "${newStatus}".`
  const subject = `Update Status Pesanan ${order.tracking_code}`

  // Send email notification
  const emailResult = await sendEmailFn(order.user_email, subject, message)
  const emailStatus: NotificationStatus = emailResult.success ? 'sent' : 'failed'

  await insert({
    order_id: order.id,
    type: 'email',
    recipient: order.user_email,
    message,
    status: emailStatus,
  })

  // Send WhatsApp if phone available
  if (phone) {
    const waResult = await sendWhatsAppFn(phone, message)
    const waStatus: NotificationStatus = waResult.success ? 'sent' : 'failed'

    await insert({
      order_id: order.id,
      type: 'whatsapp',
      recipient: phone,
      message,
      status: waStatus,
    })
  }
}

export async function notifyOrderCreated(
  order: Order,
  phone?: string,
  deps?: NotificationDeps
): Promise<void> {
  const sendEmailFn = deps?.sendEmailFn ?? ((r, s, b) => sendEmail(r, s, b))
  const sendWhatsAppFn = deps?.sendWhatsAppFn ?? ((r, m) => sendWhatsApp(r, m))
  const insert = deps?.insertNotification ?? defaultInsertNotification

  const message = `Pesanan Anda telah dibuat. Kode tracking: ${order.tracking_code}. Gunakan kode ini untuk melacak status pesanan Anda.`
  const subject = `Konfirmasi Pesanan - ${order.tracking_code}`

  // Send email notification
  const emailResult = await sendEmailFn(order.user_email, subject, message)
  const emailStatus: NotificationStatus = emailResult.success ? 'sent' : 'failed'

  await insert({
    order_id: order.id,
    type: 'email',
    recipient: order.user_email,
    message,
    status: emailStatus,
  })

  // Send WhatsApp if phone available
  if (phone) {
    const waResult = await sendWhatsAppFn(phone, message)
    const waStatus: NotificationStatus = waResult.success ? 'sent' : 'failed'

    await insert({
      order_id: order.id,
      type: 'whatsapp',
      recipient: phone,
      message,
      status: waStatus,
    })
  }
}
