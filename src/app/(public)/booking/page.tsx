'use client'

import { useState } from 'react'
import { BookingForm } from '@/features/orders/components/BookingForm'
import { BookingConfirmation } from '@/features/orders/components/BookingConfirmation'
import { DocumentUploadForm } from '@/features/documents/components/DocumentUploadForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Order } from '@/types/database'

type Step = 'form' | 'confirmation' | 'upload'

export default function BookingPage() {
  const [step, setStep] = useState<Step>('form')
  const [order, setOrder] = useState<Order | null>(null)

  function handleBookingSuccess(newOrder: Order) {
    setOrder(newOrder)
    setStep('confirmation')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Pesan Layanan Notaris</h1>

      {step === 'form' && (
        <BookingForm onSuccess={handleBookingSuccess} />
      )}

      {step === 'confirmation' && order && (
        <div className="space-y-6">
          <BookingConfirmation order={order} />
          <Card>
            <CardHeader>
              <CardTitle>Unggah Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Anda dapat mengunggah dokumen pendukung untuk pesanan ini.
              </p>
              <DocumentUploadForm
                orderId={order.id}
                onSuccess={() => setStep('upload')}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'upload' && order && (
        <div className="space-y-6">
          <BookingConfirmation order={order} />
          <Card>
            <CardHeader>
              <CardTitle>Dokumen Berhasil Diunggah</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dokumen Anda telah berhasil diunggah. Anda dapat melacak status pesanan menggunakan kode tracking di atas.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
