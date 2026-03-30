'use client'

import { ServiceCard } from './ServiceCard'
import type { Service } from '../types'

interface ServiceListProps {
  services: Service[]
  onSelect?: (service: Service) => void
}

export function ServiceList({ services, onSelect }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Belum ada layanan tersedia.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onClick={onSelect} />
      ))}
    </div>
  )
}
