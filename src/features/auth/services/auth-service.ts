import { createClient } from '@/lib/supabase/client'
import type { AuthResult } from '../types'
import type { User } from '@/types/database'

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  const supabase = createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    if (
      authError.message.includes('already registered') ||
      authError.message.includes('already been registered')
    ) {
      return { success: false, error: 'Email sudah terdaftar' }
    }
    if (authError.message.includes('rate limit')) {
      return { success: false, error: 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.' }
    }
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Registrasi gagal' }
  }

  const { data: userData, error: insertError } = await supabase
    .from('users')
    .insert({
      email,
      name,
      role: 'user',
      notary_id: null,
    } as any)
    .select()
    .single()

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  return { success: true, user: userData as User }
}

export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = createClient()

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { success: false, error: 'Email atau password salah' }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select()
    .eq('email', email)
    .single()

  if (userError || !userData) {
    return { success: false, error: 'Email atau password salah' }
  }

  return { success: true, user: userData as User }
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  window.location.href = '/'
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: userData } = await supabase
    .from('users')
    .select()
    .eq('email', authUser.email!)
    .single()

  return (userData as unknown as User) ?? null
}

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return (data as { role: string } | null)?.role === 'admin'
}
