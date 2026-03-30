import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'

// Mock Supabase client
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

import { getAll, getById } from '../services/notary-service'
import { getByNotaryId } from '../../services/services/service-service'

// Generators
const uuidArb = fc.uuid()

const notaryArb = fc.record({
  id: uuidArb,
  name: fc.stringMatching(/^[A-Za-z ]{2,30}$/).filter((s) => s.trim().length >= 2),
  address: fc.stringMatching(/^[A-Za-z0-9 ,]{5,50}$/),
  phone: fc.stringMatching(/^[0-9]{8,15}$/),
  email: fc
    .tuple(
      fc.stringMatching(/^[a-z][a-z0-9]{2,8}$/),
      fc.stringMatching(/^[a-z]{2,6}$/)
    )
    .map(([local, domain]) => `${local}@${domain}.com`),
  logo_url: fc.constant('https://example.com/logo.png'),
  created_at: fc.constant(new Date().toISOString()),
})

const serviceArb = (notaryId: string) =>
  fc.record({
    id: uuidArb,
    notary_id: fc.constant(notaryId),
    name: fc.stringMatching(/^[A-Za-z ]{2,30}$/).filter((s) => s.trim().length >= 2),
    description: fc.stringMatching(/^[A-Za-z0-9 ]{5,50}$/),
    price: fc.integer({ min: 10000, max: 10000000 }),
    created_at: fc.constant(new Date().toISOString()),
  })

describe('notary-service property tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Feature: notary-service-platform, Property 8: Multi-Tenant Data Isolation
   * For any query filtered by notary_id, all returned services/orders/documents
   * belong to that notary_id. No data from other notaries should appear.
   *
   * **Validates: Requirements 3.4, 4.2, 6.8**
   */
  it('P8: multi-tenant data isolation - services filtered by notary_id only return data for that notary', async () => {
    await fc.assert(
      fc.asyncProperty(
        uuidArb,
        uuidArb.filter((id2) => id2 !== ''),
        fc.array(fc.nat({ max: 4 }), { minLength: 1, maxLength: 3 }),
        fc.array(fc.nat({ max: 4 }), { minLength: 0, maxLength: 3 }),
        async (targetNotaryId, otherNotaryId, targetServiceCounts, otherServiceCounts) => {
          // Ensure different notary IDs
          if (targetNotaryId === otherNotaryId) return

          // Generate services for target notary
          const targetServices = targetServiceCounts.map((_, i) => ({
            id: `svc-target-${i}`,
            notary_id: targetNotaryId,
            name: `Service ${i}`,
            description: `Description ${i}`,
            price: 100000 + i * 10000,
            created_at: new Date().toISOString(),
          }))

          // Generate services for other notary
          const otherServices = otherServiceCounts.map((_, i) => ({
            id: `svc-other-${i}`,
            notary_id: otherNotaryId,
            name: `Other Service ${i}`,
            description: `Other Description ${i}`,
            price: 200000 + i * 10000,
            created_at: new Date().toISOString(),
          }))

          // Mock: when querying services filtered by targetNotaryId,
          // only target services should be returned (simulating correct RLS/filter behavior)
          mockFrom.mockReturnValueOnce({
            select: () => ({
              eq: (field: string, value: string) => {
                expect(field).toBe('notary_id')
                expect(value).toBe(targetNotaryId)
                // Filter from all services - only return matching ones
                const allServices = [...targetServices, ...otherServices]
                const filtered = allServices.filter((s) => s.notary_id === value)
                return {
                  order: () =>
                    Promise.resolve({ data: filtered, error: null }),
                }
              },
            }),
          })

          const result = await getByNotaryId(targetNotaryId)

          // All returned services must belong to the target notary
          for (const service of result) {
            expect(service.notary_id).toBe(targetNotaryId)
          }

          // No services from other notary should appear
          for (const service of result) {
            expect(service.notary_id).not.toBe(otherNotaryId)
          }

          // Count should match target services only
          expect(result.length).toBe(targetServices.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 17: Service Listing by Notary
   * For any notary, the list of services returned must contain only services
   * with that notary's notary_id, and must include all services belonging to that notary.
   *
   * **Validates: Requirements 4.3, 12.3**
   */
  it('P17: service listing by notary - returned services contain only and all services for that notary_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        notaryArb,
        fc.array(
          fc.record({
            name: fc.stringMatching(/^[A-Za-z ]{2,20}$/).filter((s) => s.trim().length >= 2),
            description: fc.stringMatching(/^[A-Za-z0-9 ]{5,30}$/),
            price: fc.integer({ min: 10000, max: 10000000 }),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        async (notary, serviceInputs) => {
          // Build expected services for this notary
          const expectedServices = serviceInputs.map((input, i) => ({
            id: `svc-${i}`,
            notary_id: notary.id,
            name: input.name,
            description: input.description,
            price: input.price,
            created_at: new Date().toISOString(),
          }))

          // Mock the Supabase query
          mockFrom.mockReturnValueOnce({
            select: () => ({
              eq: (field: string, value: string) => {
                expect(field).toBe('notary_id')
                expect(value).toBe(notary.id)
                return {
                  order: () =>
                    Promise.resolve({ data: expectedServices, error: null }),
                }
              },
            }),
          })

          const result = await getByNotaryId(notary.id)

          // All returned services must have the correct notary_id
          for (const service of result) {
            expect(service.notary_id).toBe(notary.id)
          }

          // Must include ALL services belonging to this notary
          expect(result.length).toBe(expectedServices.length)

          // Each expected service must be present in the result
          for (const expected of expectedServices) {
            const found = result.find((s) => s.id === expected.id)
            expect(found).toBeDefined()
            expect(found!.name).toBe(expected.name)
            expect(found!.notary_id).toBe(notary.id)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
