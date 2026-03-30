'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold mb-6 text-center">Lacak Pesanan</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Masukkan Kode Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tracking-code">Kode Tracking</Label>
              <Input
                id="tracking-code"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="ORD-XXXXXXXX-XXXXXX"
                aria-label="Kode Tracking"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking-email">Email (opsional)</Label>
              <Input
                id="tracking-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                aria-label="Email"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Mencari...' : 'Lacak Pesanan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && order && <OrderDetail order={order} />}
    </div>
  )
}
