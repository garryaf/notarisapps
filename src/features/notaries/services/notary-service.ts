import { createClient } from '@/lib/supabase/client'
import type { Notary, CreateNotaryInput, UpdateNotaryInput } from '../types'

export async function getAll(): Promise<Notary[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notaries')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data as Notary[]
}

export async function getById(id: string): Promise<Notary | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notaries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as Notary
}

export async function create(input: CreateNotaryInput): Promise<Notary> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notaries')
    .insert(input as any)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Notary
}

export async function update(id: string, input: UpdateNotaryInput): Promise<Notary> {
  const supabase = createClient()

  const { data, error } = await (supabase
    .from('notaries') as any)
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Notary
}
