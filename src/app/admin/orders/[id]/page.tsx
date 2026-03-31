'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { OrderDetail } from '@/features/orders/components/OrderDetail'
import { StatusUpdateForm } from '@/features/orders/components/StatusUpdateForm'
import { DocumentList } from '@/features/documents/components/DocumentList'
import { getById } from '@/features/orders/services/order-service'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { OrderWithDetails } from '@/features/orders/types'

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadOrder() {
    if (!params.id) return
    setIsLoading(true)
    try {
      const data = await getById(params.id)
      setOrder(data)
    } catch {
      // handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [params.id])

  if (isLoading) {
    return <p className="p-6 text-[#8a8070]">Memuat detail pesanan...</p>
  }

  if (!order) {
    return <p className="p-6 text-[#8a8070]">Pesanan tidak ditemukan.</p>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-bold text-[#EAE3D2]">Detail Pesanan</h1>

      <OrderDetail order={order} />

      {/* Documents */}
      <div className="glass p-6">
        <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">Dokumen</h2>
        <DocumentList documents={order.documents || []} />
      </div>

      {/* Status Update */}
      <div className="glass p-6">
        <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">Perbarui Status</h2>
        <StatusUpdateForm
          order={order}
          changedBy={user?.id || 'admin'}
          onSuccess={() => loadOrder()}
        />
      </div>
    </div>
  )
}
