import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
const mockSignUp = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
    from: mockFrom,
  }),
}))

// Chain helpers
function setupInsertChain(result: { data: unknown; error: unknown }) {
  mockSingle.mockResolvedValue(result)
  mockSelect.mockReturnValue({ single: mockSingle })
  mockInsert.mockReturnValue({ select: mockSelect })
  mockFrom.mockReturnValue({ insert: mockInsert })
}

function setupSelectChain(result: { data: unknown; error: unknown }) {
  mockSingle.mockResolvedValue(result)
  mockEq.mockReturnValue({ single: mockSingle })
  mockSelect.mockReturnValue({ eq: mockEq })
  mockFrom.mockReturnValue({ select: mockSelect })
}

import { register, login, logout } from '../services/auth-service'

describe('auth-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        notary_id: null,
        created_at: new Date().toISOString(),
      }

      mockSignUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null,
      })

      setupInsertChain({ data: mockUser, error: null })

      const result = await register('test@example.com', 'password123', 'Test User')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.user?.role).toBe('user')
      expect(result.user?.email).toBe('test@example.com')
    })

    it('should return error for duplicate email', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      })

      const result = await register('existing@example.com', 'password123', 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email sudah terdaftar')
    })

    it('should return error when signUp returns no user', async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await register('test@example.com', 'password123', 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Registrasi gagal')
    })
  })

  describe('login', () => {
    it('should login successfully and return user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
        notary_id: null,
        created_at: new Date().toISOString(),
      }

      mockSignInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      })

      setupSelectChain({ data: mockUser, error: null })

      const result = await login('test@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
    })

    it('should return error for invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' },
      })

      const result = await login('wrong@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email atau password salah')
    })

    it('should return error when user not found in users table', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      })

      setupSelectChain({ data: null, error: { message: 'Not found' } })

      const result = await login('test@example.com', 'password123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email atau password salah')
    })
  })

  describe('logout', () => {
    it('should sign out and redirect to landing page', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      // Setup global window for node environment
      const mockLocation = { href: '' }
      ;(globalThis as Record<string, unknown>).window = { location: mockLocation }

      await logout()

      expect(mockSignOut).toHaveBeenCalled()
      expect(mockLocation.href).toBe('/')

      // Cleanup
      delete (globalThis as Record<string, unknown>).window
    })
  })
})
