'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { create, update } from '../services/notary-service'
import type { Notary, CreateNotaryInput } from '../types'

interface NotaryFormProps {
  notary?: Notary | null
  onSuccess?: (notary: Notary) => void
  onCancel?: () => void
}

export function NotaryForm({ notary, onSuccess, onCancel }: NotaryFormProps) {
  const isEditing = !!notary
  const [name, setName] = useState(notary?.name ?? '')
  const [address, setAddress] = useState(notary?.address ?? '')
  const [phone, setPhone] = useState(notary?.phone ?? '')
  const [email, setEmail] = useState(notary?.email ?? '')
  const [logoUrl, setLogoUrl] = useState(notary?.logo_url ?? '')
  const [region, setRegion] = useState(notary?.region ?? '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !address.trim() || !phone.trim() || !email.trim()) {
      setError('Semua field wajib diisi')
      return
    }

    setIsLoading(true)
    try {
      const input: CreateNotaryInput = {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        logo_url: logoUrl.trim(),
        region: region.trim(),
      }

      const result = isEditing
        ? await update(notary!.id, input)
        : await create(input)

      onSuccess?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notary-name" className="text-[#EAE3D2]">Nama Notaris</Label>
        <Input
          id="notary-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama notaris"
          aria-label="Nama Notaris"
          required
          className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notary-region" className="text-[#EAE3D2]">Daerah/Wilayah</Label>
        <Input
          id="notary-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Contoh: Jakarta, Bandung, Surabaya"
          aria-label="Daerah/Wilayah"
          className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notary-address" className="text-[#EAE3D2]">Alamat</Label>
        <Input
          id="notary-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Alamat notaris"
          aria-label="Alamat"
          required
          className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notary-phone" className="text-[#EAE3D2]">Telepon</Label>
        <Input
          id="notary-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nomor telepon"
          aria-label="Telepon"
          required
          className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notary-email" className="text-[#EAE3D2]">Email</Label>
        <Input
          id="notary-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@notaris.com"
          aria-label="Email"
          required
          className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notary-logo" className="text-[#EAE3D2]">URL Logo</Label>
        <Input
          id="notary-logo"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          aria-label="URL Logo"
          className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="bg-[#1F2A24] text-[#EAE3D2] hover:bg-[#2a3a30]">
          {isLoading ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Tambah'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="border-white/10 text-[#8a8070] hover:bg-white/5 hover:text-[#EAE3D2]">
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}
