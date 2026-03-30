'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { getNextStatuses } from '../services/status-machine'
import { updateStatus } from '../services/order-service'
import type { Order, OrderStatus } from '../types'

interface StatusUpdateFormProps {
  order: Order
  changedBy: string
  onSuccess?: (order: Order) => void
}

export function StatusUpdateForm({ order, changedBy, onSuccess }: StatusUpdateFormProps) {
  const nextStatuses = getNextStatuses(order.status)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isRevisi = selectedStatus === 'revisi'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedStatus) {
      setError('Pilih status baru')
      return
    }

    if (isRevisi && !notes.trim()) {
      setError('Catatan revisi wajib diisi')
      return
    }

    setIsLoading(true)
    try {
      const updated = await updateStatus(
        order.id,
        selectedStatus as OrderStatus,
        changedBy,
        notes.trim() || undefined
      )
      onSuccess?.(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Pesanan sudah selesai. Tidak ada perubahan status yang tersedia.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status-update">Status Baru</Label>
        <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v ?? '')}>
          <SelectTrigger id="status-update" aria-label="Status Baru" className="w-full">
            <SelectValue placeholder="Pilih status baru" />
          </SelectTrigger>
          <SelectContent>
            {nextStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status-notes">
          Catatan {isRevisi && <span className="text-red-600">*</span>}
        </Label>
        <Textarea
          id="status-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={isRevisi ? 'Catatan revisi wajib diisi' : 'Catatan opsional'}
          aria-label="Catatan"
          required={isRevisi}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Memperbarui...' : 'Perbarui Status'}
      </Button>
    </form>
  )
}
