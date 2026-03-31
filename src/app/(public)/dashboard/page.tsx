'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { StatusBadge } from '@/features/orders/components/StatusBadge'
import { createClient } from '@/lib/supabase/client'
import { FileText, Search, Loader2, PackageOpen } from 'lucide-react'
import type { Order } from '@/types/database'

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user?.email) return

    async function fetchOrders() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_email', user!.email)
          .order('created_at', { ascending: false })
          .limit(10)
        setOrders((data as Order[]) ?? [])
      } catch {
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [user?.email])

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8a8070]" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-[80vh] bg-[#0D0D0D] py-10 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="font-serif text-3xl font-bold text-[#EAE3D2] sm:text-4xl">
            Selamat Datang, {user.name}
          </h1>
          <p className="mt-2 text-[#8a8070]">
            Kelola pesanan dan layanan notaris Anda dari sini.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Link
            href="/booking"
            className="glass flex items-center gap-4 p-5 transition-all hover:bg-white/10 hover:scale-[1.01]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1F2A24] text-[#EAE3D2]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif font-semibold text-[#EAE3D2]">Pesan Layanan Baru</p>
              <p className="text-sm text-[#8a8070]">Ajukan layanan notaris secara online</p>
            </div>
          </Link>
          <Link
            href="/tracking"
            className="glass flex items-center gap-4 p-5 transition-all hover:bg-white/10 hover:scale-[1.01]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1F2A24] text-[#EAE3D2]">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <p className="font-serif font-semibold text-[#EAE3D2]">Lacak Pesanan</p>
              <p className="text-sm text-[#8a8070]">Pantau progres pesanan Anda</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-serif text-xl font-semibold text-[#EAE3D2] mb-4">
            Pesanan Terbaru
          </h2>

          {ordersLoading ? (
            <div className="glass flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#8a8070]" />
            </div>
          ) : orders.length === 0 ? (
            <div className="glass flex flex-col items-center justify-center py-16 text-center">
              <PackageOpen className="h-12 w-12 text-[#8a8070]/50 mb-4" />
              <p className="text-[#EAE3D2] font-serif font-semibold text-lg">
                Belum ada pesanan
              </p>
              <p className="mt-1 text-sm text-[#8a8070]">
                Mulai dengan memesan layanan notaris pertama Anda.
              </p>
              <Link
                href="/booking"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1F2A24] px-6 py-2.5 text-sm font-medium text-[#EAE3D2] transition-colors hover:bg-[#2a3a30]"
              >
                <FileText className="h-4 w-4" />
                Pesan Sekarang
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#EAE3D2] truncate">
                      {order.tracking_code}
                    </p>
                    <p className="text-xs text-[#8a8070] mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
