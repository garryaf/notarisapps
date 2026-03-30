import type { Order, OrderStatus, Notary, Service, Document, StatusHistory } from '@/types/database'

export type CreateOrderInput = {
  user_name: string
  user_email: string
  notary_id: string
  service_id: string
}

export type OrderFilters = {
  status?: OrderStatus
  notaryId?: string
}

export type OrderWithDetails = Order & {
  notary: Notary
  service: Service
  documents: Document[]
  status_histories: StatusHistory[]
}

export type { Order, OrderStatus }
