'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Service } from '../types'

interface ServiceCardProps {
  service: Service
  onClick?: (service: Service) => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(service.price)

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(service)}
      role="button"
      tabIndex={0}
      aria-label={`Layanan ${service.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(service)
        }
      }}
    >
      <CardHeader>
        <CardTitle className="text-lg">{service.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{service.description}</p>
        <p className="text-sm font-semibold">{formattedPrice}</p>
      </CardContent>
    </Card>
  )
}
