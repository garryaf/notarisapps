import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { notifyStatusChange, notifyOrderCreated } from '../services/notification-service'
import type { Order, OrderStatus, NotificationStatus } from '@/types/database'
import type { NotificationResult } from '../types'

/** Helper to create a mock Order */
function createMockOrder(overrides?: Partial<Order>): Order {
  return {
    id: overrides?.id ?? 'order-id',
    tracking_code: overrides?.tracking_code ?? 'ORD-20250101-ABC123',
    user_name: overrides?.user_name ?? 'Test User',
    user_email: overrides?.user_email ?? 'test@example.com',
    notary_id: overrides?.notary_id ?? 'notary-id',
    service_id: overrides?.service_id ?? 'service-id',
    status: overrides?.status ?? 'pending',
    created_at: overrides?.created_at ?? new Date().toISOString(),
    updated_at: overrides?.updated_at ?? new Date().toISOString(),
  }
}

/** Collects inserted notification records */
function createMockInsert() {
  const records: Array<{
    order_id: string
    type: 'email' | 'whatsapp'
    recipient: string
    message: string
    status: NotificationStatus
  }> = []
  const fn = async (record: {
    order_id: string
    type: 'email' | 'whatsapp'
    recipient: string
    message: string
    status: NotificationStatus
  }) => {
    records.push(record)
  }
  return { fn, records }
}

/** Arbitrary for order statuses */
const statusArb = fc.constantFrom<OrderStatus>('pending', 'verifikasi', 'diproses', 'revisi', 'selesai')

/** Arbitrary for emails */
const emailArb = fc.emailAddress()

/** Arbitrary for tracking codes */
const alphanumChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const trackingCodeArb = fc.tuple(
  fc.integer({ min: 20200101, max: 20301231 }),
  fc.array(fc.constantFrom(...alphanumChars.split('')), { minLength: 6, maxLength: 6 }).map(a => a.join(''))
).map(([date, rand]) => `ORD-${date}-${rand}`)

/** Arbitrary for phone numbers (optional) */
const digitChars = '0123456789'
const phoneArb = fc.option(
  fc.array(fc.constantFrom(...digitChars.split('')), { minLength: 10, maxLength: 13 }).map(a => '+62' + a.join('')),
  { nil: undefined }
)

/** Arbitrary for order with generated fields */
const orderArb = fc.tuple(fc.uuid(), trackingCodeArb, fc.string({ minLength: 1, maxLength: 50 }), emailArb, fc.uuid(), fc.uuid(), statusArb)
  .map(([id, tracking_code, user_name, user_email, notary_id, service_id, status]) =>
    createMockOrder({ id, tracking_code, user_name, user_email, notary_id, service_id, status })
  )

describe('notification-service property tests', () => {
  /**
   * Feature: notary-service-platform, Property 13: Notification Record Creation
   *
   * For any status change on an order, a notification record must be created in the
   * notifications table with type "email" and the user's email as recipient. If the
   * user has a phone number, an additional notification with type "whatsapp" must
   * also be created.
   *
   * **Validates: Requirements 11.1, 11.2, 11.3**
   */
  it('P13: status change creates email notification; if phone available, whatsapp too', async () => {
    // Sub-property 1: Always creates email notification record
    await fc.assert(
      fc.asyncProperty(orderArb, statusArb, statusArb, phoneArb, async (order, oldStatus, newStatus, phone) => {
        const mockInsert = createMockInsert()
        const mockEmailResult: NotificationResult = { success: true, notificationId: 'email-1' }
        const mockWaResult: NotificationResult = { success: true, notificationId: 'wa-1' }

        await notifyStatusChange(order, oldStatus, newStatus, phone, {
          sendEmailFn: async () => mockEmailResult,
          sendWhatsAppFn: async () => mockWaResult,
          insertNotification: mockInsert.fn,
        })

        // Email notification always created
        const emailRecords = mockInsert.records.filter(r => r.type === 'email')
        expect(emailRecords.length).toBe(1)
        expect(emailRecords[0].recipient).toBe(order.user_email)
        expect(emailRecords[0].order_id).toBe(order.id)
        expect(emailRecords[0].status).toBe('sent')

        // WhatsApp notification created only if phone provided
        const waRecords = mockInsert.records.filter(r => r.type === 'whatsapp')
        if (phone) {
          expect(waRecords.length).toBe(1)
          expect(waRecords[0].recipient).toBe(phone)
          expect(waRecords[0].order_id).toBe(order.id)
        } else {
          expect(waRecords.length).toBe(0)
        }
      }),
      { numRuns: 100 }
    )

    // Sub-property 2: Failed sends are recorded with status "failed"
    await fc.assert(
      fc.asyncProperty(orderArb, statusArb, statusArb, async (order, oldStatus, newStatus) => {
        const mockInsert = createMockInsert()
        const failedResult: NotificationResult = { success: false, notificationId: '' }

        await notifyStatusChange(order, oldStatus, newStatus, '+6281234567890', {
          sendEmailFn: async () => failedResult,
          sendWhatsAppFn: async () => failedResult,
          insertNotification: mockInsert.fn,
        })

        // Both records created with "failed" status
        expect(mockInsert.records.length).toBe(2)
        expect(mockInsert.records[0].status).toBe('failed')
        expect(mockInsert.records[1].status).toBe('failed')
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 14: Notification Contains Tracking Code
   *
   * For any newly created order, the notification message sent to the user must
   * contain the order's tracking_code.
   *
   * **Validates: Requirements 11.5**
   */
  it('P14: new order notification message contains tracking_code', async () => {
    await fc.assert(
      fc.asyncProperty(orderArb, phoneArb, async (order, phone) => {
        const mockInsert = createMockInsert()
        const mockResult: NotificationResult = { success: true, notificationId: 'notif-1' }

        await notifyOrderCreated(order, phone, {
          sendEmailFn: async () => mockResult,
          sendWhatsAppFn: async () => mockResult,
          insertNotification: mockInsert.fn,
        })

        // All notification messages must contain the tracking code
        for (const record of mockInsert.records) {
          expect(record.message).toContain(order.tracking_code)
        }

        // At least email notification exists
        expect(mockInsert.records.length).toBeGreaterThanOrEqual(1)
        const emailRecord = mockInsert.records.find(r => r.type === 'email')
        expect(emailRecord).toBeDefined()
        expect(emailRecord!.message).toContain(order.tracking_code)
      }),
      { numRuns: 100 }
    )
  })
})
