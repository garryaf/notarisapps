'use client'

import { useState } from 'react'
import { BookingForm } from '@/features/orders/components/BookingForm'
import { BookingConfirmation } from '@/features/orders/components/BookingConfirmation'
import { DocumentUploadForm } from '@/features/documents/components/DocumentUploadForm'
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
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <h1 className="font-serif text-3xl font-bold text-[#EAE3D2] mb-8 text-center sm:text-4xl">
        Pesan Layanan Notaris
      </h1>

      {step === 'form' && (
        <BookingForm onSuccess={handleBookingSuccess} />
      )}

      {step === 'confirmation' && order && (
        <div className="space-y-6">
          <BookingConfirmation order={order} />
          <div className="glass p-6">
            <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">
              Unggah Dokumen
            </h2>
            <p className="text-sm text-[#8a8070] mb-4">
              Anda dapat mengunggah dokumen pendukung untuk pesanan ini.
            </p>
            <DocumentUploadForm
              orderId={order.id}
              onSuccess={() => setStep('upload')}
            />
          </div>
        </div>
      )}

      {step === 'upload' && order && (
        <div className="space-y-6">
          <BookingConfirmation order={order} />
          <div className="glass p-6">
            <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">
              Dokumen Berhasil Diunggah
            </h2>
            <p className="text-sm text-[#8a8070]">
              Dokumen Anda telah berhasil diunggah. Anda dapat melacak status
              pesanan menggunakan kode tracking di atas.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
