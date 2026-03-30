'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Order } from '../types'

interface BookingConfirmationProps {
  order: Order
}

export function BookingConfirmation({ order }: BookingConfirmationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Berhasil Dibuat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Terima kasih, pesanan Anda telah berhasil dibuat. Simpan kode tracking berikut untuk melacak status pesanan Anda.
        </p>
        <div className="rounded-lg bg-muted p-4 text-center">
          <p className="text-sm text-muted-foreground">Kode Tracking</p>
          <p className="text-2xl font-bold tracking-wider mt-1">{order.tracking_code}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nama</span>
            <span>{order.user_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{order.user_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="capitalize">{order.status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
