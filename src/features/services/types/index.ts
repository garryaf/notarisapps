import type { Service } from '@/types/database'

export type CreateServiceInput = {
  notary_id: string
  name: string
  description: string
  price: number
}

export type UpdateServiceInput = Partial<Omit<CreateServiceInput, 'notary_id'>>

export type { Service }
