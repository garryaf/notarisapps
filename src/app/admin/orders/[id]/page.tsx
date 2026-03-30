'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
    return <p className="p-6">Memuat detail pesanan...</p>
  }

  if (!order) {
    return <p className="p-6">Pesanan tidak ditemukan.</p>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Detail Pesanan</h1>

      <OrderDetail order={order} />

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentList documents={order.documents || []} />
        </CardContent>
      </Card>

      {/* Status Update */}
      <Card>
        <CardHeader>
          <CardTitle>Perbarui Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusUpdateForm
            order={order}
            changedBy={user?.id || 'admin'}
            onSuccess={() => loadOrder()}
          />
        </CardContent>
      </Card>
    </div>
  )
}
