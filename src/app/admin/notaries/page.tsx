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
import { NotaryList } from '@/features/notaries/components/NotaryList'
import { NotaryForm } from '@/features/notaries/components/NotaryForm'
import { getAll } from '@/features/notaries/services/notary-service'
import type { Notary } from '@/features/notaries/types'

export default function AdminNotariesPage() {
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNotary, setEditingNotary] = useState<Notary | null>(null)

  async function loadNotaries() {
    try {
      const data = await getAll()
      setNotaries(data)
    } catch {
      // handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotaries()
  }, [])

  function handleSuccess() {
    setDialogOpen(false)
    setEditingNotary(null)
    loadNotaries()
  }

  function handleEdit(notary: Notary) {
    setEditingNotary(notary)
    setDialogOpen(true)
  }

  function handleCancel() {
    setDialogOpen(false)
    setEditingNotary(null)
  }

  if (isLoading) {
    return <p className="p-6 text-[#8a8070]">Memuat data notaris...</p>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-[#EAE3D2]">Manajemen Notaris</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                onClick={() => setEditingNotary(null)}
                className="bg-[#1F2A24] text-[#EAE3D2] hover:bg-[#2a3a30]"
              >
                Tambah Notaris
              </Button>
            }
          />
          <DialogContent className="bg-[#141414] border-white/10 text-[#EAE3D2]">
            <DialogHeader>
              <DialogTitle className="font-serif text-[#EAE3D2]">
                {editingNotary ? 'Edit Notaris' : 'Tambah Notaris Baru'}
              </DialogTitle>
            </DialogHeader>
            <NotaryForm
              notary={editingNotary}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>
      <NotaryList notaries={notaries} onSelect={handleEdit} />
    </div>
  )
}
