'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ServiceForm } from '@/features/services/components/ServiceForm'
import { getByNotaryId } from '@/features/services/services/service-service'
import { getAll as getAllNotaries } from '@/features/notaries/services/notary-service'
import type { Notary } from '@/types/database'
import type { Service } from '@/types/database'

export default function AdminServicesPage() {
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [servicesByNotary, setServicesByNotary] = useState<Record<string, Service[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [selectedNotaryId, setSelectedNotaryId] = useState('')

  async function loadData() {
    try {
      const allNotaries = await getAllNotaries()
      setNotaries(allNotaries)
      const map: Record<string, Service[]> = {}
      await Promise.all(
        allNotaries.map(async (n) => {
          try {
            map[n.id] = await getByNotaryId(n.id)
          } catch {
            map[n.id] = []
          }
        })
      )
      setServicesByNotary(map)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleSuccess() {
    setDialogOpen(false)
    setEditingService(null)
    setSelectedNotaryId('')
    loadData()
  }

  function handleEdit(service: Service) {
    setEditingService(service)
    setSelectedNotaryId(service.notary_id)
    setDialogOpen(true)
  }

  function handleCancel() {
    setDialogOpen(false)
    setEditingService(null)
    setSelectedNotaryId('')
  }

  function handleOpenNew() {
    setEditingService(null)
    setSelectedNotaryId(notaries[0]?.id ?? '')
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  if (isLoading) {
    return <p className="p-6 text-[#8a8070]">Memuat data layanan...</p>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-[#EAE3D2]">Manajemen Layanan</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                onClick={handleOpenNew}
                className="bg-[#1F2A24] text-[#EAE3D2] hover:bg-[#2a3a30]"
              >
                Tambah Layanan
              </Button>
            }
          />
          <DialogContent className="bg-[#141414] border-white/10 text-[#EAE3D2] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-[#EAE3D2]">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </DialogTitle>
            </DialogHeader>
            {!editingService && (
              <div className="space-y-2">
                <Label className="font-serif text-[#EAE3D2]">Pilih Notaris</Label>
                <Select value={selectedNotaryId} onValueChange={(v) => setSelectedNotaryId(v ?? '')}>
                  <SelectTrigger aria-label="Pilih Notaris" className="w-full bg-white/5 border-white/10 text-[#EAE3D2]">
                    <SelectValue placeholder="Pilih notaris" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {notaries.map((n) => (
                      <SelectItem key={n.id} value={n.id} className="text-[#EAE3D2] focus:bg-white/10 focus:text-[#EAE3D2]">
                        {n.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedNotaryId && (
              <ServiceForm
                notaryId={selectedNotaryId}
                service={editingService}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {notaries.map((notary) => {
        const services = servicesByNotary[notary.id] ?? []
        return (
          <div key={notary.id} className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-[#EAE3D2]">
              {notary.name}
              {notary.region && (
                <span className="ml-2 text-sm font-normal text-[#8a8070]">— {notary.region}</span>
              )}
            </h2>
            {services.length === 0 ? (
              <p className="text-sm text-[#8a8070]">Belum ada layanan.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="glass p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
                    onClick={() => handleEdit(service)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Edit layanan ${service.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleEdit(service)
                      }
                    }}
                  >
                    <h3 className="font-serif text-base font-semibold text-[#EAE3D2]">{service.name}</h3>
                    <p className="mt-1 text-sm text-[#8a8070]">{service.description}</p>
                    <p className="mt-2 text-sm font-semibold text-[#EAE3D2]">{formatPrice(service.price)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
