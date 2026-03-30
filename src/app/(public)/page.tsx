'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { NotaryList } from '@/features/notaries/components/NotaryList'
import { getAll } from '@/features/notaries/services/notary-service'
import type { Notary } from '@/types/database'

export default function LandingPage() {
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getAll()
      .then(setNotaries)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Platform Layanan Notaris Online
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Pesan layanan notaris dengan mudah, unggah dokumen, dan lacak progres pesanan Anda secara real-time.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/booking" className={buttonVariants({ size: 'lg' })}>
              Pesan Sekarang
            </Link>
            <Link href="/tracking" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              Lacak Pesanan
            </Link>
          </div>
        </div>
      </section>

      {/* Notary List Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Notaris Terdaftar</h2>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Memuat data notaris...</p>
          ) : (
            <NotaryList notaries={notaries} />
          )}
        </div>
      </section>
    </div>
  )
}
