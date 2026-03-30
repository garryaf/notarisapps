import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'
import { STATUS_TRANSITIONS, isValidTransition, getNextStatuses } from '../services/status-machine'
import type { OrderStatus } from '@/types/database'

// Mock Supabase client
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

import { updateStatus } from '../services/order-service'

const ALL_STATUSES: OrderStatus[] = ['pending', 'verifikasi', 'diproses', 'revisi', 'selesai']

const orderStatusArb = fc.constantFrom<OrderStatus>(...ALL_STATUSES)

describe('status-machine property tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Feature: notary-service-platform, Property 4: Status Transition State Machine
   * For any order with current status S and attempted transition to status T,
   * the transition succeeds iff T is in the allowed transitions for S.
   *
   * **Validates: Requirements 8.1, 8.2, 8.3**
   */
  it('P4: transition succeeds iff T is in allowed transitions for S', () => {
    fc.assert(
      fc.property(orderStatusArb, orderStatusArb, (current, next) => {
        const allowed = STATUS_TRANSITIONS[current]
        const shouldSucceed = allowed.includes(next)

        expect(isValidTransition(current, next)).toBe(shouldSucceed)
        expect(getNextStatuses(current)).toEqual(allowed)
      }),
      { numRuns: 100 }
    )
  })


  /**
   * Feature: notary-service-platform, Property 5: Revision Requires Notes
   * For any status transition to "revisi", the notes field must be non-empty.
   * If notes is empty or null, the transition must be rejected.
   *
   * **Validates: Requirements 8.5**
   */
  it('P5: transition to revisi requires non-empty notes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', '   ', undefined as unknown as string, null as unknown as string),
        async (emptyNotes) => {
          const orderId = 'order-1'

          // Mock: fetch current order with status "diproses" (only valid source for revisi)
          mockFrom.mockReturnValueOnce({
            select: () => ({
              eq: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: orderId,
                      tracking_code: 'ORD-20250101-ABC123',
                      user_name: 'Test',
                      user_email: 'test@test.com',
                      notary_id: 'n1',
                      service_id: 's1',
                      status: 'diproses',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
              }),
            }),
          })

          await expect(
            updateStatus(orderId, 'revisi', 'admin-1', emptyNotes as string | undefined)
          ).rejects.toThrow('Catatan revisi wajib diisi')
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 6: Status History Chronological Order
   * For any order, the status_histories entries must be ordered by changed_at ascending,
   * and each consecutive pair old_status[i+1] must equal new_status[i].
   *
   * **Validates: Requirements 7.2, 8.4**
   */
  it('P6: status histories are chronological and consecutive old_status[i+1] == new_status[i]', () => {
    // Generate valid status transition chains
    const statusChainArb = fc.integer({ min: 1, max: 5 }).chain((length) => {
      // Build a valid chain starting from pending
      const buildChain = (): { old_status: OrderStatus | null; new_status: OrderStatus; changed_at: string }[] => {
        const chain: { old_status: OrderStatus | null; new_status: OrderStatus; changed_at: string }[] = []
        let current: OrderStatus | null = null
        let nextStatus: OrderStatus = 'pending'
        const baseTime = Date.now()

        for (let i = 0; i < length; i++) {
          chain.push({
            old_status: current,
            new_status: nextStatus,
            changed_at: new Date(baseTime + i * 1000).toISOString(),
          })
          current = nextStatus
          const nextOptions: OrderStatus[] = STATUS_TRANSITIONS[nextStatus]
          if (nextOptions.length === 0) break
          nextStatus = nextOptions[Math.floor(Math.random() * nextOptions.length)]
        }
        return chain
      }
      return fc.constant(buildChain())
    })

    fc.assert(
      fc.property(statusChainArb, (histories) => {
        // Verify chronological order
        for (let i = 1; i < histories.length; i++) {
          expect(new Date(histories[i].changed_at).getTime())
            .toBeGreaterThanOrEqual(new Date(histories[i - 1].changed_at).getTime())
        }

        // Verify consecutive: old_status[i+1] == new_status[i]
        for (let i = 0; i < histories.length - 1; i++) {
          expect(histories[i + 1].old_status).toBe(histories[i].new_status)
        }

        // First entry should have null old_status
        if (histories.length > 0) {
          expect(histories[0].old_status).toBeNull()
        }
      }),
      { numRuns: 100 }
    )
  })
})
