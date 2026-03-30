import type { OrderStatus } from '@/types/database'

export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['verifikasi'],
  verifikasi: ['diproses'],
  diproses: ['revisi', 'selesai'],
  revisi: ['diproses'],
  selesai: [],
}

export function isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
  const allowed = STATUS_TRANSITIONS[current]
  return allowed.includes(next)
}

export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[current]
}
