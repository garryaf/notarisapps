'use client'

import type { Order } from '../types'

interface BookingConfirmationProps {
  order: Order
}

export function BookingConfirmation({ order }: BookingConfirmationProps) {
  return (
    <div className="glass p-6">
      <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">
        Pesanan Berhasil Dibuat
      </h2>
      <p className="text-[#8a8070] mb-4">
        Terima kasih, pesanan Anda telah berhasil dibuat. Simpan kode tracking
        berikut untuk melacak status pesanan Anda.
      </p>
      <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center">
        <p className="text-sm text-[#8a8070]">Kode Tracking</p>
        <p className="font-serif text-2xl font-bold tracking-wider text-[#EAE3D2] mt-1">
          {order.tracking_code}
        </p>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#8a8070]">Nama</span>
          <span className="text-[#EAE3D2]">{order.user_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8a8070]">Email</span>
          <span className="text-[#EAE3D2]">{order.user_email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8a8070]">Status</span>
          <span className="text-[#EAE3D2] capitalize">{order.status}</span>
        </div>
      </div>
    </div>
  )
}
