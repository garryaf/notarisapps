'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NotaryList } from '@/features/notaries/components/NotaryList'
import { getAll } from '@/features/notaries/services/notary-service'
import { Scale, FileText, Search, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import type { Notary } from '@/types/database'

const features = [
  {
    icon: FileText,
    title: 'Pesan Online',
    description: 'Ajukan layanan notaris kapan saja tanpa perlu datang ke kantor.',
    href: '/booking',
    actionLabel: 'Pesan Sekarang',
  },
  {
    icon: Search,
    title: 'Lacak Pesanan',
    description: 'Pantau progres pesanan Anda secara real-time dengan kode tracking.',
    href: '/tracking',
    actionLabel: 'Lacak Sekarang',
  },
  {
    icon: Shield,
    title: 'Aman & Terpercaya',
    description: 'Dokumen Anda dilindungi dengan enkripsi dan keamanan berlapis.',
    href: null,
    actionLabel: null,
  },
  {
    icon: Clock,
    title: 'Proses Cepat',
    description: 'Layanan notaris yang efisien dengan estimasi waktu yang jelas.',
    href: null,
    actionLabel: null,
  },
]

export default function LandingPage() {
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [heroVisible, setHeroVisible] = useState(false)
  const [featuresVisible, setFeaturesVisible] = useState(false)

  useEffect(() => {
    setHeroVisible(true)
    const timer = setTimeout(() => setFeaturesVisible(true), 300)
    getAll()
      .then(setNotaries)
      .catch(() => {})
      .finally(() => setIsLoading(false))
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.02),transparent_70%)]" />
        <div
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
            Kantor Notaris
          </h1>
          <p className="mt-2 text-xl font-semibold text-primary sm:text-2xl lg:text-3xl">
            Annisa Diah Paramitha, Mkn., SH
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            Layanan notaris profesional dan terpercaya. Pesan layanan, unggah dokumen, dan lacak progres pesanan Anda secara online dengan mudah.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/booking"
              className={buttonVariants({ size: 'lg', className: 'shadow-md transition-transform hover:scale-[1.02]' })}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Pesan Layanan
            </Link>
            <Link
              href="/tracking"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'transition-transform hover:scale-[1.02]' })}
            >
              <Search className="mr-2 h-4 w-4" />
              Lacak Pesanan
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Mengapa Memilih Kami</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Kami menyediakan layanan notaris yang modern, transparan, dan mudah diakses.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              const isClickable = !!feature.href

              const cardContent = (
                <CardContent className="pt-6 text-center">
                  <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                    isClickable
                      ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  {isClickable && (
                    <p className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      {feature.actionLabel}
                      <ArrowRight className="h-3 w-3" />
                    </p>
                  )}
                </CardContent>
              )

              if (isClickable) {
                return (
                  <Link key={feature.title} href={feature.href!} className="group">
                    <Card
                      className={`h-full border-0 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer ${
                        featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      {cardContent}
                    </Card>
                  </Link>
                )
              }

              return (
                <Card
                  key={feature.title}
                  className={`h-full border-0 shadow-sm transition-all duration-500 ${
                    featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {cardContent}
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Notary List Section */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Notaris Kami</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Notaris berpengalaman dan terpercaya siap melayani kebutuhan legalitas Anda.
          </p>
          <div className="mt-10">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <NotaryList notaries={notaries} />
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Butuh Layanan Notaris?</h2>
          <p className="mt-4 text-muted-foreground">
            Hubungi kami atau langsung pesan layanan secara online. Proses mudah, cepat, dan transparan.
          </p>
          <div className="mt-8">
            <Link
              href="/booking"
              className={buttonVariants({ size: 'lg', className: 'shadow-md transition-transform hover:scale-[1.02]' })}
            >
              Mulai Pesan Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
