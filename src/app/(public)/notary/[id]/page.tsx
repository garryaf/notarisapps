'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Phone, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getById } from '@/features/notaries/services/notary-service'
import { getByNotaryId } from '@/features/services/services/service-service'
import type { Notary } from '@/types/database'
import type { Service } from '@/types/database'

export default function NotaryDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [notary, setNotary] = useState<Notary | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [n, s] = await Promise.all([
          getById(id),
          getByNotaryId(id),
        ])
        setNotary(n)
        setServices(s)
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!notary) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold text-[#EAE3D2]">Notaris tidak ditemukan</h1>
        <Link href="/" className="mt-4 inline-block text-sm text-[#8a8070] hover:text-[#EAE3D2]">
          ← Kembali ke beranda
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#8a8070] hover:text-[#EAE3D2] mb-8">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke beranda
      </Link>

      {/* Notary Profile Card */}
      <div className="glass p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-5">
          {notary.logo_url && (
            <img
              src={notary.logo_url}
              alt={`Logo ${notary.name}`}
              className="w-16 h-16 rounded-full object-cover border border-white/10 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#EAE3D2]">
              {notary.name}
            </h1>
            {notary.region && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-[#1F2A24]/60 text-sm text-[#EAE3D2]/80 border border-white/10">
                <MapPin className="h-3.5 w-3.5" />
                {notary.region}
              </span>
            )}
            <div className="mt-4 space-y-1.5 text-sm text-[#8a8070]">
              {notary.address && <p>{notary.address}</p>}
              {notary.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {notary.phone}
                </p>
              )}
              {notary.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {notary.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <h2 className="font-serif text-xl font-semibold text-[#EAE3D2] mb-4">Layanan yang Tersedia</h2>
      {services.length === 0 ? (
        <p className="text-sm text-[#8a8070]">Belum ada layanan tersedia untuk notaris ini.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.id} className="glass p-5 flex flex-col">
              <h3 className="font-serif text-base font-semibold text-[#EAE3D2]">{service.name}</h3>
              <p className="mt-1 text-sm text-[#8a8070] flex-1">{service.description}</p>
              <p className="mt-3 text-sm font-semibold text-[#EAE3D2]">{formatPrice(service.price)}</p>
              <Link
                href={`/booking?notary=${notary.id}&service=${service.id}`}
                className="mt-4"
              >
                <Button className="w-full bg-[#1F2A24] text-[#EAE3D2] hover:bg-[#2a3a30]">
                  Pesan Layanan Ini
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
