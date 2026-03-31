'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OrderDetail } from '@/features/orders/components/OrderDetail'
import { getByTrackingCode } from '@/features/orders/services/order-service'
import type { OrderWithDetails } from '@/features/orders/types'

export default function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setOrder(null)
    setSearched(false)

    if (!trackingCode.trim()) {
      setError('Masukkan kode tracking')
      return
    }

    setIsLoading(true)
    try {
      const result = await getByTrackingCode(
        trackingCode.trim(),
        email.trim() || undefined
      )
      setSearched(true)
      if (result) {
        setOrder(result)
      } else {
        setError('Kode tracking tidak ditemukan. Periksa kembali kode Anda')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <h1 className="font-serif text-3xl font-bold text-[#EAE3D2] mb-8 text-center sm:text-4xl">
        Lacak Pesanan
      </h1>

      <div className="glass p-6 mb-8">
        <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">
          Masukkan Kode Tracking
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tracking-code" className="text-[#EAE3D2]">
              Kode Tracking
            </Label>
            <Input
              id="tracking-code"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="ORD-XXXXXXXX-XXXXXX"
              aria-label="Kode Tracking"
              required
              className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tracking-email" className="text-[#EAE3D2]">
              Email (opsional)
            </Label>
            <Input
              id="tracking-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              aria-label="Email"
              className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1F2A24] text-[#EAE3D2] hover:bg-[#2a3a30]"
          >
            {isLoading ? 'Mencari...' : 'Lacak Pesanan'}
          </Button>
        </form>
      </div>

      {searched && order && <OrderDetail order={order} />}
    </div>
  )
}
