import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { generateTrackingCode } from '../services/tracking-code-generator'

describe('tracking-code property tests', () => {
  /**
   * Feature: notary-service-platform, Property 1: Tracking Code Format Validity
   * For any generated tracking code, the code must match the regex pattern
   * ^ORD-\d{8}-[A-Z0-9]{6}$, where the 8-digit portion represents a valid date in YYYYMMDD format.
   *
   * **Validates: Requirements 5.3**
   */
  it('P1: tracking code matches format ^ORD-\\d{8}-[A-Z0-9]{6}$ with valid YYYYMMDD date', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const code = generateTrackingCode()

        // Must match overall format
        expect(code).toMatch(/^ORD-\d{8}-[A-Z0-9]{6}$/)

        // Extract and validate date portion
        const datePart = code.slice(4, 12)
        const year = parseInt(datePart.slice(0, 4), 10)
        const month = parseInt(datePart.slice(4, 6), 10)
        const day = parseInt(datePart.slice(6, 8), 10)

        expect(year).toBeGreaterThanOrEqual(2000)
        expect(year).toBeLessThanOrEqual(2100)
        expect(month).toBeGreaterThanOrEqual(1)
        expect(month).toBeLessThanOrEqual(12)
        expect(day).toBeGreaterThanOrEqual(1)
        expect(day).toBeLessThanOrEqual(31)

        // Verify it's a real date
        const parsed = new Date(year, month - 1, day)
        expect(parsed.getFullYear()).toBe(year)
        expect(parsed.getMonth()).toBe(month - 1)
        expect(parsed.getDate()).toBe(day)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 2: Tracking Code Uniqueness
   * For any set of N generated tracking codes, all N codes must be distinct from each other.
   *
   * **Validates: Requirements 5.3**
   */
  it('P2: N generated tracking codes are all distinct', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 50 }), (n) => {
        const codes = new Set<string>()
        for (let i = 0; i < n; i++) {
          codes.add(generateTrackingCode())
        }
        expect(codes.size).toBe(n)
      }),
      { numRuns: 100 }
    )
  })
})
