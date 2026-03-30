'use server'

import { createClient } from '@/lib/supabase/client'
import { isValidTransition } from '@/features/orders/services/status-machine'
import type { ActionResult } from '@/lib/utils'
import { success, error } from '@/lib/utils'
import type { Order, Notary, Service, OrderStatus } from '@/types/database'

// --- Order Status ---

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  changedBy: string,
  notes?: string
): Promise<ActionResult<Order>> {
  try {
    const supabase = createClient()

    const { data: current, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchErr || !current) {
      return error('Pesanan tidak ditemukan')
    }

    const order = current as Order

    if (!isValidTransition(order.status, newStatus)) {
      return error('Transisi status tidak valid')
    }

    if (newStatus === 'revisi' && (!notes || notes.trim() === '')) {
      return error('Catatan revisi wajib diisi')
    }

    const { data: updated, error: updateErr } = await (supabase
      .from('orders') as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (updateErr) {
      return error(updateErr.message)
    }

    await supabase.from('status_histories').insert({
      order_id: orderId,
      old_status: order.status,
      new_status: newStatus,
      changed_by: changedBy,
      notes: notes || null,
    } as any)

    return success(updated as Order)
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Terjadi kesalahan')
  }
}

// --- Notary Management ---

export async function createNotary(input: {
  name: string
  address: string
  phone: string
  email: string
  logo_url: string
}): Promise<ActionResult<Notary>> {
  try {
    const supabase = createClient()

    const { data, error: insertErr } = await supabase
      .from('notaries')
      .insert(input as any)
      .select()
      .single()

    if (insertErr) {
      return error(insertErr.message)
    }

    return success(data as Notary)
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Terjadi kesalahan')
  }
}

export async function updateNotary(
  id: string,
  input: Partial<{
    name: string
    address: string
    phone: string
    email: string
    logo_url: string
  }>
): Promise<ActionResult<Notary>> {
  try {
    const supabase = createClient()

    const { data, error: updateErr } = await (supabase
      .from('notaries') as any)
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      return error(updateErr.message)
    }

    return success(data as Notary)
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Terjadi kesalahan')
  }
}

// --- Service Management ---

export async function createService(input: {
  notary_id: string
  name: string
  description: string
  price: number
}): Promise<ActionResult<Service>> {
  try {
    const supabase = createClient()

    const { data, error: insertErr } = await supabase
      .from('services')
      .insert(input as any)
      .select()
      .single()

    if (insertErr) {
      return error(insertErr.message)
    }

    return success(data as Service)
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Terjadi kesalahan')
  }
}

export async function updateService(
  id: string,
  input: Partial<{
    name: string
    description: string
    price: number
  }>
): Promise<ActionResult<Service>> {
  try {
    const supabase = createClient()

    const { data, error: updateErr } = await (supabase
      .from('services') as any)
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) {
      return error(updateErr.message)
    }

    return success(data as Service)
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Terjadi kesalahan')
  }
}
