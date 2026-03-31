'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderList } from '@/features/orders/components/OrderList'
import { getAll } from '@/features/orders/services/order-service'
import type { Order, OrderStatus } from '@/types/database'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  verifikasi: 'Verifikasi',
  diproses: 'Diproses',
  revisi: 'Revisi',
  selesai: 'Selesai',
}

const ALL_STATUSES: OrderStatus[] = ['pending', 'verifikasi', 'diproses', 'revisi', 'selesai']

export default function AdminDashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAll()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const statusCounts = ALL_STATUSES.reduce(
    (acc, status) => {
      acc[status] = orders.filter((o) => o.status === status).length
      return acc
    },
    {} as Record<OrderStatus, number>
  )

  function handleSelectOrder(order: Order) {
    router.push(`/admin/orders/${order.id}`)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-bold text-[#EAE3D2]">Dashboard</h1>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {ALL_STATUSES.map((status) => (
          <div key={status} className="glass p-4">
            <p className="text-sm font-medium text-[#8a8070] mb-1">
              {STATUS_LABELS[status]}
            </p>
            <p className="text-2xl font-bold text-[#EAE3D2]">
              {isLoading ? '...' : statusCounts[status]}
            </p>
          </div>
        ))}
      </div>

      {/* Order List */}
      <div className="glass p-6">
        <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">Daftar Pesanan</h2>
        <OrderList onSelect={handleSelectOrder} />
      </div>
    </div>
  )
}
