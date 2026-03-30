'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {ALL_STATUSES.map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {STATUS_LABELS[status]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : statusCounts[status]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order List with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderList onSelect={handleSelectOrder} />
        </CardContent>
      </Card>
    </div>
  )
}
