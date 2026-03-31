'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { create, update } from '../services/service-service'
import type { Service, CreateServiceInput } from '../types'

interface ServiceFormProps {
  notaryId: string
  service?: Service | null
  onSuccess?: (service: Service) => void
  onCancel?: () => void
}

export function ServiceForm({ notaryId, service, onSuccess, onCancel }: ServiceFormProps) {
  const isEditing = !!service
  const [name, setName] = useState(service?.name ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [price, setPrice] = useState(service?.price?.toString() ?? '')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim() || !description.trim() || !price.trim()) {
      setError('Semua field wajib diisi')
      return
    }

    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Harga harus berupa angka positif')
      return
    }

    setIsLoading(true)
    try {
      if (isEditing) {
        const result = await update(service!.id, {
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
        })
        onSuccess?.(result)
      } else {
        const input: CreateServiceInput = {
          notary_id: notaryId,
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
        }
        const result = await create(input)
        onSuccess?.(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="service-name" className="font-serif text-[#EAE3D2]">Nama Layanan</Label>
        <Input
          id="service-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama layanan"
          aria-label="Nama Layanan"
          required
          className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="service-description" className="font-serif text-[#EAE3D2]">Deskripsi</Label>
        <Input
          id="service-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi layanan"
          aria-label="Deskripsi"
          required
          className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="service-price" className="font-serif text-[#EAE3D2]">Harga (IDR)</Label>
        <Input
          id="service-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="100000"
          aria-label="Harga"
          min="1"
          required
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
          <Button type="button" variant="outline" onClick={onCancel} className="border-white/10 text-[#EAE3D2] hover:bg-white/5">
            Batal
          </Button>
        )}
      </div>
    </form>
  )
}
