import { createClient } from '@/lib/supabase/client'
import type { Service, CreateServiceInput, UpdateServiceInput } from '../types'

export async function getByNotaryId(notaryId: string): Promise<Service[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('notary_id', notaryId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data as Service[]
}

export async function getById(id: string): Promise<Service | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as Service
}

export async function create(input: CreateServiceInput): Promise<Service> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('services')
    .insert(input as any)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Service
}

export async function update(id: string, input: UpdateServiceInput): Promise<Service> {
  const supabase = createClient()

  const { data, error } = await (supabase
    .from('services') as any)
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Service
}
