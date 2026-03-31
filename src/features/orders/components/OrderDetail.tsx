'use client'

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
      <div className="glass p-6">
        <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">
          Detail Pesanan
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8a8070]">Tracking Code</span>
            <span className="font-mono font-medium text-[#EAE3D2]">{order.tracking_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a8070]">Nama</span>
            <span className="text-[#EAE3D2]">{order.user_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a8070]">Email</span>
            <span className="text-[#EAE3D2]">{order.user_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a8070]">Notaris</span>
            <span className="text-[#EAE3D2]">{order.notary?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a8070]">Layanan</span>
            <span className="text-[#EAE3D2]">{order.service?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8a8070]">Status</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-[#8a8070]">Tanggal Pemesanan</span>
            <span className="text-[#EAE3D2]">{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
          </div>
        </div>
      </div>

      {order.documents && order.documents.length > 0 && (
        <div className="glass p-6">
          <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">
            Dokumen
          </h2>
          <ul className="space-y-2">
            {order.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between text-sm">
                <span className="text-[#EAE3D2]">{doc.file_name}</span>
                <span className="text-[#8a8070]">{doc.file_type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="glass p-6">
        <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">
          Riwayat Status
        </h2>
        {sortedHistory.length === 0 ? (
          <p className="text-[#8a8070] text-sm">Belum ada riwayat status.</p>
        ) : (
          <ul className="space-y-3">
            {sortedHistory.map((history) => (
              <li key={history.id} className="border-l-2 border-white/10 pl-4 text-sm">
                <div className="flex items-center gap-2">
                  {history.old_status && (
                    <>
                      <StatusBadge status={history.old_status} />
                      <span className="text-[#8a8070]">&rarr;</span>
                    </>
                  )}
                  <StatusBadge status={history.new_status} />
                </div>
                {history.notes && (
                  <p className="text-[#8a8070] mt-1">{history.notes}</p>
                )}
                <p className="text-xs text-[#8a8070] mt-1">
                  {new Date(history.changed_at).toLocaleString('id-ID')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
