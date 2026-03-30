'use client'

import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { OrderList } from '@/features/orders/components/OrderList'
import type { Order } from '@/types/database'

export default function AdminOrdersPage() {
  const router = useRouter()

  function handleSelectOrder(order: Order) {
    router.push(`/admin/orders/${order.id}`)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Daftar Pesanan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Semua Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderList onSelect={handleSelectOrder} />
        </CardContent>
      </Card>
    </div>
  )
}
