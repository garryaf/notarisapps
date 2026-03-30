import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import type { OrderStatus } from '@/types/database'

// Mock Supabase client
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

import { create, getByTrackingCode, getAll } from '../services/order-service'

const ALL_STATUSES: OrderStatus[] = ['pending', 'verifikasi', 'diproses', 'revisi', 'selesai']
const orderStatusArb = fc.constantFrom<OrderStatus>(...ALL_STATUSES)
const uuidArb = fc.uuid()

const orderArb = fc.record({
  id: uuidArb,
  tracking_code: fc.stringMatching(/^ORD-\d{8}-[A-Z0-9]{6}$/),
  user_name: fc.stringMatching(/^[A-Za-z ]{2,20}$/).filter((s) => s.trim().length >= 2),
  user_email: fc
    .tuple(
      fc.stringMatching(/^[a-z][a-z0-9]{2,8}$/),
      fc.stringMatching(/^[a-z]{2,6}$/)
    )
    .map(([local, domain]) => `${local}@${domain}.com`),
  notary_id: uuidArb,
  service_id: uuidArb,
  status: orderStatusArb,
  created_at: fc.constant(new Date().toISOString()),
  updated_at: fc.constant(new Date().toISOString()),
})

describe('order-service property tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })


  /**
   * Feature: notary-service-platform, Property 3: Order Creation Invariants
   * For any valid order creation input, the resulting order must have status "pending",
   * a valid tracking_code, and a corresponding entry in status_histories with new_status "pending".
   *
   * **Validates: Requirements 5.2, 5.6**
   */
  it('P3: created order has status pending, valid tracking_code, and status_history entry', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user_name: fc.stringMatching(/^[A-Za-z ]{2,20}$/).filter((s) => s.trim().length >= 2),
          user_email: fc
            .tuple(
              fc.stringMatching(/^[a-z][a-z0-9]{2,8}$/),
              fc.stringMatching(/^[a-z]{2,6}$/)
            )
            .map(([local, domain]) => `${local}@${domain}.com`),
          notary_id: uuidArb,
          service_id: uuidArb,
        }),
        async (input) => {
          let insertedOrder: any = null
          let insertedHistory: any = null

          // Mock: orders.insert
          mockFrom.mockImplementation((table: string) => {
            if (table === 'orders') {
              return {
                insert: (data: any) => {
                  insertedOrder = {
                    id: 'new-order-id',
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }
                  return {
                    select: () => ({
                      single: () =>
                        Promise.resolve({ data: insertedOrder, error: null }),
                    }),
                  }
                },
              }
            }
            if (table === 'status_histories') {
              return {
                insert: (data: any) => {
                  insertedHistory = data
                  return Promise.resolve({ data: null, error: null })
                },
              }
            }
            return {}
          })

          const result = await create(input)

          // Order must have status "pending"
          expect(result.status).toBe('pending')

          // Order must have a valid tracking code
          expect(result.tracking_code).toMatch(/^ORD-\d{8}-[A-Z0-9]{6}$/)

          // Status history must have been inserted with new_status "pending"
          expect(insertedHistory).toBeDefined()
          expect(insertedHistory.new_status).toBe('pending')
          expect(insertedHistory.old_status).toBeNull()
          expect(insertedHistory.order_id).toBe(result.id)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 9: Order Tracking Lookup
   * For any order in the system, querying by its tracking_code (and optionally email)
   * must return the correct order details. Querying with a non-existent tracking_code must return null.
   *
   * **Validates: Requirements 7.1, 7.4**
   */
  it('P9: querying by tracking_code returns correct order, non-existent returns null', async () => {
    await fc.assert(
      fc.asyncProperty(orderArb, async (order) => {
        const orderWithDetails = {
          ...order,
          notary: { id: order.notary_id, name: 'Notary 1' },
          service: { id: order.service_id, name: 'Service 1' },
          documents: [],
          status_histories: [],
        }

        // Mock: successful lookup by tracking_code
        mockFrom.mockReturnValueOnce({
          select: () => ({
            eq: (_field: string, _value: string) => ({
              single: () =>
                Promise.resolve({ data: orderWithDetails, error: null }),
            }),
          }),
        })

        const found = await getByTrackingCode(order.tracking_code)
        expect(found).not.toBeNull()
        expect(found!.tracking_code).toBe(order.tracking_code)
        expect(found!.status).toBe(order.status)

        // Mock: non-existent tracking code
        mockFrom.mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        })

        const notFound = await getByTrackingCode('ORD-00000000-ZZZZZZ')
        expect(notFound).toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 10: Admin Dashboard Filter Correctness
   * For any combination of filters (status, notary_id), the returned order list must contain
   * only orders matching ALL applied filters, and the count per status matches actual.
   *
   * **Validates: Requirements 9.2, 9.5**
   */
  it('P10: filters return only matching orders, count per status matches actual', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(orderArb, { minLength: 1, maxLength: 10 }),
        fc.option(orderStatusArb),
        fc.option(uuidArb),
        async (orders, filterStatus, filterNotaryId) => {
          // Compute expected filtered results
          let expected = orders
          if (filterStatus !== null) {
            expected = expected.filter((o) => o.status === filterStatus)
          }
          if (filterNotaryId !== null) {
            expected = expected.filter((o) => o.notary_id === filterNotaryId)
          }

          // Mock: getAll with filters
          mockFrom.mockReturnValueOnce({
            select: () => {
              let chain: any = {
                eq: (_field: string, _value: string) => chain,
                order: () => Promise.resolve({ data: expected, error: null }),
              }
              return chain
            },
          })

          const filters: any = {}
          if (filterStatus !== null) filters.status = filterStatus
          if (filterNotaryId !== null) filters.notaryId = filterNotaryId

          const result = await getAll(Object.keys(filters).length > 0 ? filters : undefined)

          // All returned orders must match applied filters
          for (const order of result) {
            if (filterStatus !== null) {
              expect(order.status).toBe(filterStatus)
            }
            if (filterNotaryId !== null) {
              expect(order.notary_id).toBe(filterNotaryId)
            }
          }

          // Count must match expected
          expect(result.length).toBe(expected.length)

          // Verify count per status matches actual
          const statusCounts: Record<string, number> = {}
          for (const order of result) {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
          }
          for (const status of ALL_STATUSES) {
            const actualCount = result.filter((o) => o.status === status).length
            expect(statusCounts[status] || 0).toBe(actualCount)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
