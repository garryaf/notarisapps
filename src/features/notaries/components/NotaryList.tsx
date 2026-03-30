'use client'

import { NotaryCard } from './NotaryCard'
import type { Notary } from '../types'

interface NotaryListProps {
  notaries: Notary[]
  onSelect?: (notary: Notary) => void
}

export function NotaryList({ notaries, onSelect }: NotaryListProps) {
  if (notaries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Belum ada notaris terdaftar.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notaries.map((notary) => (
        <NotaryCard key={notary.id} notary={notary} onClick={onSelect} />
      ))}
    </div>
  )
}
