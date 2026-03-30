import type { Notary } from '@/types/database'

export type CreateNotaryInput = {
  name: string
  address: string
  phone: string
  email: string
  logo_url: string
}

export type UpdateNotaryInput = Partial<CreateNotaryInput>

export type { Notary }
