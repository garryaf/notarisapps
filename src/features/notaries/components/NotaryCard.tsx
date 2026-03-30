'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Notary } from '../types'

interface NotaryCardProps {
  notary: Notary
  onClick?: (notary: Notary) => void
}

export function NotaryCard({ notary, onClick }: NotaryCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(notary)}
      role="button"
      tabIndex={0}
      aria-label={`Notaris ${notary.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(notary)
        }
      }}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        {notary.logo_url && (
          <img
            src={notary.logo_url}
            alt={`Logo ${notary.name}`}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <CardTitle className="text-lg">{notary.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{notary.address}</p>
      </CardContent>
    </Card>
  )
}
