'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  verifikasi: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  diproses: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  revisi: 'bg-red-900/40 text-red-300 border-red-700/50',
  selesai: 'bg-green-900/40 text-green-300 border-green-700/50',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  verifikasi: 'Verifikasi',
  diproses: 'Diproses',
  revisi: 'Revisi',
  selesai: 'Selesai',
}

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_COLORS[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
