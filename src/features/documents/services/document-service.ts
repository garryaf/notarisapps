import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/types/database'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../types'

export function validateFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
    return 'Format file tidak didukung. Gunakan PDF, JPG, JPEG, atau PNG'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Ukuran file melebihi batas maksimal 10MB'
  }
  return null
}

export async function upload(orderId: string, file: File): Promise<Document> {
  const validationError = validateFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const filePath = `${orderId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) {
    throw new Error('Gagal mengunggah file. Silakan coba lagi')
  }

  const { data: metadata, error: insertError } = await supabase
    .from('documents')
    .insert({
      order_id: orderId,
      file_name: file.name,
      file_url: filePath,
      file_type: file.type,
    } as any)
    .select()
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  return metadata as Document
}

export async function getByOrderId(orderId: string): Promise<Document[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('order_id', orderId)
    .order('uploaded_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data as Document[]
}

export async function getDownloadUrl(fileUrl: string): Promise<string> {
  const supabase = createClient()

  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(fileUrl)

  return data.publicUrl
}
