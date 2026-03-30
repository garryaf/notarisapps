'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import type { OrderWithDetails } from '../types'

interface OrderDetailProps {
  order: OrderWithDetails
}

export function OrderDetail({ order }: OrderDetailProps) {
  const sortedHistory = [...order.status_histories].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detail Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tracking Code</span>
            <span className="font-mono font-medium">{order.tracking_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nama</span>
            <span>{order.user_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{order.user_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Notaris</span>
            <span>{order.notary?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Layanan</span>
            <span>{order.service?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tanggal Pemesanan</span>
            <span>{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
          </div>
        </CardContent>
      </Card>

      {order.documents && order.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dokumen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {order.documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between text-sm">
                  <span>{doc.file_name}</span>
                  <span className="text-muted-foreground">{doc.file_type}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Status</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada riwayat status.</p>
          ) : (
            <ul className="space-y-3">
              {sortedHistory.map((history) => (
                <li key={history.id} className="border-l-2 border-muted pl-4 text-sm">
                  <div className="flex items-center gap-2">
                    {history.old_status && (
                      <>
                        <StatusBadge status={history.old_status} />
                        <span className="text-muted-foreground">→</span>
                      </>
                    )}
                    <StatusBadge status={history.new_status} />
                  </div>
                  {history.notes && (
                    <p className="text-muted-foreground mt-1">{history.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(history.changed_at).toLocaleString('id-ID')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
