import type { User, UserRole } from '@/types/database'

export type AuthResult = {
  success: boolean
  error?: string
  user?: User
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  name: string
}

export type AuthState = {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
}

export type { User, UserRole }
