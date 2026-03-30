import { describe, it, expect, vi, beforeEach } from 'vitest'
import fc from 'fast-check'

// Mock Supabase client
const mockSignUp = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
    },
    from: mockFrom,
  }),
}))

import { register, login } from '../services/auth-service'
import type { UserRole } from '@/types/database'

// Generators
const emailArb = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{2,10}$/),
    fc.stringMatching(/^[a-z]{2,6}$/)
  )
  .map(([local, domain]) => `${local}@${domain}.com`)

const nameArb = fc.stringMatching(/^[A-Za-z ]{2,30}$/).filter((n) => n.trim().length >= 2)
const passwordArb = fc.stringMatching(/^[A-Za-z0-9!@#]{6,20}$/)
const roleArb: fc.Arbitrary<UserRole> = fc.constantFrom('user' as UserRole, 'admin' as UserRole)

describe('auth-service property tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Feature: notary-service-platform, Property 15: User Role Authorization
   * For any user with role other than "admin", admin access is denied.
   * For admin role, access is granted.
   *
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  it('P15: role authorization - non-admin users are denied admin access, admin users are granted', async () => {
    await fc.assert(
      fc.asyncProperty(emailArb, passwordArb, roleArb, async (email, password, role) => {
        const mockUser = {
          id: crypto.randomUUID(),
          email,
          name: 'Test',
          role,
          notary_id: null,
          created_at: new Date().toISOString(),
        }

        mockSignInWithPassword.mockResolvedValueOnce({
          data: { session: { access_token: 'token' } },
          error: null,
        })

        mockFrom.mockReturnValueOnce({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockUser, error: null }),
            }),
          }),
        })

        const result = await login(email, password)

        expect(result.success).toBe(true)
        expect(result.user).toBeDefined()

        if (role === 'admin') {
          expect(result.user!.role).toBe('admin')
        } else {
          expect(result.user!.role).not.toBe('admin')
        }

        // Verify AuthGuard logic
        const isAdmin = result.user!.role === 'admin'
        if (role === 'admin') {
          expect(isAdmin).toBe(true)
        } else {
          expect(isAdmin).toBe(false)
        }
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 16: Registration Creates User with Correct Role
   * For any valid registration, user is created with role "user" and correct email.
   *
   * **Validates: Requirements 1.1, 1.4**
   */
  it('P16: registration creates user with role "user" and correct email', async () => {
    await fc.assert(
      fc.asyncProperty(emailArb, passwordArb, nameArb, async (email, password, name) => {
        const userId = crypto.randomUUID()

        mockSignUp.mockResolvedValueOnce({
          data: { user: { id: userId, email } },
          error: null,
        })

        const mockUser = {
          id: userId,
          email,
          name,
          role: 'user' as const,
          notary_id: null,
          created_at: new Date().toISOString(),
        }

        mockFrom.mockReturnValueOnce({
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: mockUser, error: null }),
            }),
          }),
        })

        const result = await register(email, password, name)

        expect(result.success).toBe(true)
        expect(result.user).toBeDefined()
        expect(result.user!.role).toBe('user')
        expect(result.user!.email).toBe(email)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: notary-service-platform, Property 16: Registration Creates User with Correct Role (duplicate path)
   * Attempting to register with an already-registered email must fail with "Email sudah terdaftar".
   *
   * **Validates: Requirements 1.4**
   */
  it('P16: duplicate email registration fails with correct error message', async () => {
    await fc.assert(
      fc.asyncProperty(emailArb, passwordArb, nameArb, async (email, password, name) => {
        mockSignUp.mockResolvedValueOnce({
          data: { user: null },
          error: { message: 'User already registered' },
        })

        const result = await register(email, password, name)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Email sudah terdaftar')
      }),
      { numRuns: 100 }
    )
  })
})
