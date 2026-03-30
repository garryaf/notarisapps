import type { Document } from '@/types/database'

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number]

export type { Document }
