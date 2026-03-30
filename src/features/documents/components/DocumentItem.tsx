'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getDownloadUrl } from '../services/document-service'
import type { Document } from '@/types/database'

interface DocumentItemProps {
  document: Document
}

export function DocumentItem({ document }: DocumentItemProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  async function handleDownload() {
    if (!downloadUrl) {
      const url = await getDownloadUrl(document.file_url)
      setDownloadUrl(url)
      window.open(url, '_blank')
    } else {
      window.open(downloadUrl, '_blank')
    }
  }

  return (
    <li className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{document.file_name}</p>
        <p className="text-xs text-muted-foreground">{document.file_type}</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        Unduh
      </Button>
    </li>
  )
}
