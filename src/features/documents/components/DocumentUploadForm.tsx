'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upload, validateFile } from '../services/document-service'
import type { Document } from '@/types/database'

interface DocumentUploadFormProps {
  orderId: string
  onSuccess?: (document: Document) => void
}

export function DocumentUploadForm({ orderId, onSuccess }: DocumentUploadFormProps) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError('')
    const file = e.target.files?.[0]
    if (!file) {
      setSelectedFile(null)
      return
    }

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setSelectedFile(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedFile) {
      setError('Pilih file untuk diunggah')
      return
    }

    setIsLoading(true)
    try {
      const doc = await upload(orderId, selectedFile)
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
      onSuccess?.(doc)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah file')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="document-file">Pilih Dokumen</Label>
        <Input
          ref={inputRef}
          id="document-file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          aria-label="Pilih Dokumen"
        />
        <p className="text-xs text-muted-foreground">
          Format: PDF, JPG, JPEG, PNG. Maksimal 10MB.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isLoading || !selectedFile}>
        {isLoading ? 'Mengunggah...' : 'Unggah Dokumen'}
      </Button>
    </form>
  )
}
