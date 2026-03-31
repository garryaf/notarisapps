import { createClient } from '@/lib/supabase/client'
import type { Order, OrderStatus } from '@/types/database'
import type { CreateOrderInput, OrderFilters, OrderWithDetails } from '../types'
import { generateTrackingCode } from './tracking-code-generator'
import { isValidTransition } from './status-machine'
import { notifyOrderCreated, notifyStatusChange } from '@/features/notifications/services/notification-service'

export async function create(input: CreateOrderInput): Promise<Order> {
  const supabase = createClient()
  const tracking_code = generateTrackingCode()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      tracking_code,
      user_name: input.user_name,
      user_email: input.user_email,
      user_phone: input.user_phone || null,
      notary_id: input.notary_id,
      service_id: input.service_id,
      status: 'pending' as OrderStatus,
    } as any)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const order = data as Order

  // Insert initial status history
  const { error: historyError } = await supabase
    .from('status_histories')
    .insert({
      order_id: order.id,
      old_status: null,
      new_status: 'pending' as OrderStatus,
      changed_by: 'system',
      notes: 'Order created',
    } as any)

  if (historyError) {
    throw new Error(historyError.message)
  }

  // Send notification (fire-and-forget, don't block order creation)
  notifyOrderCreated(order, input.user_phone).catch(() => {})

  return order
}


export async function getByTrackingCode(trackingCode: string, email?: string): Promise<OrderWithDetails | null> {
  const supabase = createClient()

  let query = supabase
    .from('orders')
    .select('*, notary:notaries(*), service:services(*), documents(*), status_histories(*)')
    .eq('tracking_code', trackingCode)

  if (email) {
    query = query.eq('user_email', email)
  }

  const { data, error } = await query.single()

  if (error) {
    return null
  }

  return data as unknown as OrderWithDetails
}

export async function getAll(filters?: OrderFilters): Promise<Order[]> {
  const supabase = createClient()

  let query = supabase
    .from('orders')
    .select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.notaryId) {
    query = query.eq('notary_id', filters.notaryId)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data as Order[]
}

export async function updateStatus(
  id: string,
  newStatus: OrderStatus,
  changedBy: string,
  notes?: string
): Promise<Order> {
  const supabase = createClient()

  // Get current order
  const { data: current, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    throw new Error('Order not found')
  }

  const order = current as Order

  // Validate transition
  if (!isValidTransition(order.status, newStatus)) {
    throw new Error('Transisi status tidak valid')
  }

  // Require notes for revisi
  if (newStatus === 'revisi' && (!notes || notes.trim() === '')) {
    throw new Error('Catatan revisi wajib diisi')
  }

  // Update order status
  const { data: updated, error: updateError } = await (supabase
    .from('orders') as any)
    .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    throw new Error(updateError.message)
  }

  // Insert status history
  const { error: historyError } = await supabase
    .from('status_histories')
    .insert({
      order_id: id,
      old_status: order.status,
      new_status: newStatus,
      changed_by: changedBy,
      notes: notes || null,
    } as any)

  if (historyError) {
    throw new Error(historyError.message)
  }

  // Send notification (fire-and-forget)
  notifyStatusChange(updated as Order, order.status, newStatus, (order as any).user_phone).catch(() => {})

  return updated as Order
}


export async function getById(id: string): Promise<OrderWithDetails | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('orders')
    .select('*, notary:notaries(*), service:services(*), documents(*), status_histories(*)')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as unknown as OrderWithDetails
}
