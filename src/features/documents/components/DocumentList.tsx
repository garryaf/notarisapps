'use client'

import { DocumentItem } from './DocumentItem'
import type { Document } from '@/types/database'

interface DocumentListProps {
  documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4 text-sm">
        Belum ada dokumen yang diunggah.
      </p>
    )
  }

  return (
    <ul className="divide-y">
      {documents.map((doc) => (
        <DocumentItem key={doc.id} document={doc} />
      ))}
    </ul>
  )
}
