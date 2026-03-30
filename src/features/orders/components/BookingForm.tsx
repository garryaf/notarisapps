'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { getAll as getAllNotaries } from '@/features/notaries/services/notary-service'
import { getByNotaryId } from '@/features/services/services/service-service'
import { create } from '../services/order-service'
import type { Notary } from '@/types/database'
import type { Service } from '@/types/database'
import type { Order } from '../types'

interface BookingFormProps {
  onSuccess?: (order: Order) => void
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedNotaryId, setSelectedNotaryId] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getAllNotaries().then(setNotaries).catch(() => setError('Gagal memuat data notaris'))
  }, [])

  useEffect(() => {
    if (selectedNotaryId) {
      setSelectedServiceId('')
      getByNotaryId(selectedNotaryId)
        .then(setServices)
        .catch(() => setError('Gagal memuat data layanan'))
    } else {
      setServices([])
    }
  }, [selectedNotaryId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedNotaryId || !selectedServiceId || !userName.trim() || !userEmail.trim()) {
      setError('Semua field wajib diisi')
      return
    }

    setIsLoading(true)
    try {
      const order = await create({
        user_name: userName.trim(),
        user_email: userEmail.trim(),
        notary_id: selectedNotaryId,
        service_id: selectedServiceId,
      })
      onSuccess?.(order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesan Layanan Notaris</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-notary">Pilih Notaris</Label>
            <Select value={selectedNotaryId} onValueChange={(v) => setSelectedNotaryId(v ?? '')}>
              <SelectTrigger id="booking-notary" aria-label="Pilih Notaris" className="w-full">
                <SelectValue placeholder="Pilih notaris" />
              </SelectTrigger>
              <SelectContent>
                {notaries.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-service">Pilih Layanan</Label>
            <Select
              value={selectedServiceId}
              onValueChange={(v) => setSelectedServiceId(v ?? '')}
              disabled={!selectedNotaryId}
            >
              <SelectTrigger id="booking-service" aria-label="Pilih Layanan" className="w-full">
                <SelectValue placeholder="Pilih layanan" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - Rp {s.price.toLocaleString('id-ID')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-name">Nama Lengkap</Label>
            <Input
              id="booking-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nama lengkap Anda"
              aria-label="Nama Lengkap"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-email">Email</Label>
            <Input
              id="booking-email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="email@contoh.com"
              aria-label="Email"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Memproses...' : 'Pesan Sekarang'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
