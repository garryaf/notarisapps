'use client'

import { useRouter } from 'next/navigation'
import { OrderList } from '@/features/orders/components/OrderList'
import type { Order } from '@/types/database'

export default function AdminOrdersPage() {
  const router = useRouter()

  function handleSelectOrder(order: Order) {
    router.push(`/admin/orders/${order.id}`)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-bold text-[#EAE3D2]">Daftar Pesanan</h1>
      <div className="glass p-6">
        <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">Semua Pesanan</h2>
        <OrderList onSelect={handleSelectOrder} />
      </div>
    </div>
  )
}
