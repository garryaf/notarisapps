'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedNotaryId, setSelectedNotaryId] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getAllNotaries().then(setNotaries).catch(() => setError('Gagal memuat data notaris'))
  }, [])

  const uniqueRegions = useMemo(() => {
    const regions = notaries
      .map((n) => n.region)
      .filter((r) => r && r.trim() !== '')
    return [...new Set(regions)].sort()
  }, [notaries])

  const filteredNotaries = useMemo(() => {
    if (!selectedRegion) return notaries
    return notaries.filter((n) => n.region === selectedRegion)
  }, [notaries, selectedRegion])

  useEffect(() => {
    setSelectedNotaryId('')
    setSelectedServiceId('')
    setServices([])
  }, [selectedRegion])

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
        user_phone: userPhone.trim() || undefined,
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
    <div className="glass p-6">
      <h2 className="font-serif text-lg font-semibold text-[#EAE3D2] mb-4">
        Pesan Layanan Notaris
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="booking-region" className="text-[#EAE3D2]">Pilih Daerah</Label>
          <Select value={selectedRegion || 'all'} onValueChange={(v) => setSelectedRegion(v === 'all' ? '' : (v ?? ''))}>
            <SelectTrigger id="booking-region" aria-label="Pilih Daerah" className="w-full bg-white/5 border-white/10 text-[#EAE3D2]">
              <SelectValue placeholder="Semua daerah" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              <SelectItem value="all" className="text-[#EAE3D2] focus:bg-white/10 focus:text-[#EAE3D2]">
                Semua Daerah
              </SelectItem>
              {uniqueRegions.map((r) => (
                <SelectItem key={r} value={r} className="text-[#EAE3D2] focus:bg-white/10 focus:text-[#EAE3D2]">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-notary" className="text-[#EAE3D2]">Pilih Notaris</Label>
          <Select value={selectedNotaryId} onValueChange={(v) => setSelectedNotaryId(v ?? '')}>
            <SelectTrigger id="booking-notary" aria-label="Pilih Notaris" className="w-full bg-white/5 border-white/10 text-[#EAE3D2]">
              <SelectValue placeholder="Pilih notaris" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              {filteredNotaries.map((n) => (
                <SelectItem key={n.id} value={n.id} className="text-[#EAE3D2] focus:bg-white/10 focus:text-[#EAE3D2]">
                  {n.name}{n.region ? ` — ${n.region}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-service" className="text-[#EAE3D2]">Pilih Layanan</Label>
          <Select
            value={selectedServiceId}
            onValueChange={(v) => setSelectedServiceId(v ?? '')}
            disabled={!selectedNotaryId}
          >
            <SelectTrigger id="booking-service" aria-label="Pilih Layanan" className="w-full bg-white/5 border-white/10 text-[#EAE3D2]">
              <SelectValue placeholder="Pilih layanan" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10">
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-[#EAE3D2] focus:bg-white/10 focus:text-[#EAE3D2]">
                  {s.name} - Rp {s.price.toLocaleString('id-ID')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-name" className="text-[#EAE3D2]">Nama Lengkap</Label>
          <Input
            id="booking-name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nama lengkap Anda"
            aria-label="Nama Lengkap"
            required
            className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-email" className="text-[#EAE3D2]">Email</Label>
          <Input
            id="booking-email"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="email@contoh.com"
            aria-label="Email"
            required
            className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-phone" className="text-[#EAE3D2]">No. WhatsApp (opsional)</Label>
          <Input
            id="booking-phone"
            type="tel"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            aria-label="Nomor WhatsApp"
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
          {isLoading ? 'Memproses...' : 'Pesan Sekarang'}
        </Button>
      </form>
    </div>
  )
}
