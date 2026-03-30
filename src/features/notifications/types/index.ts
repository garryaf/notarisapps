import type {
  Notification as NotificationDB,
  NotificationType,
  NotificationStatus,
} from '@/types/database'

export type { NotificationDB as Notification }
export type { NotificationType, NotificationStatus }

export interface NotificationResult {
  success: boolean
  notificationId: string
}

export interface SendEmailInput {
  recipient: string
  subject: string
  body: string
  orderId: string
}

export interface SendWhatsAppInput {
  recipient: string
  message: string
  orderId: string
}
