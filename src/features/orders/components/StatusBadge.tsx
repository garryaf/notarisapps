'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  verifikasi: 'bg-blue-100 text-blue-800 border-blue-300',
  diproses: 'bg-orange-100 text-orange-800 border-orange-300',
  revisi: 'bg-red-100 text-red-800 border-red-300',
  selesai: 'bg-green-100 text-green-800 border-green-300',
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
