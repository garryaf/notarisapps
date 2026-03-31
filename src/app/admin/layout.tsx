'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Users, Briefcase } from 'lucide-react'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Pesanan', icon: ClipboardList },
  { href: '/admin/notaries', label: 'Notaris', icon: Users },
  { href: '/admin/services', label: 'Layanan', icon: Briefcase },
]

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-white/[0.08] bg-[#0D0D0D]">
      <div className="flex h-16 items-center border-b border-white/[0.08] px-6">
        <Link href="/admin" className="font-serif text-lg font-bold text-[#EAE3D2]">
          Notaris Annisa
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1" aria-label="Admin navigation">
        {sidebarLinks.map((link) => {
          const Icon = link.icon
          const isActive =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#1F2A24]/50 text-[#EAE3D2]'
                  : 'text-[#8a8070] hover:bg-white/5 hover:text-[#EAE3D2]'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#0D0D0D]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex h-16 items-center border-b border-white/[0.08] bg-[#0D0D0D]/80 backdrop-blur-xl px-6 md:hidden">
            <Link href="/admin" className="font-serif text-lg font-bold text-[#EAE3D2]">
              Notaris Annisa
            </Link>
          </header>
          {/* Mobile nav */}
          <nav className="flex gap-2 border-b border-white/[0.08] bg-[#0D0D0D] px-4 py-2 md:hidden" aria-label="Admin mobile navigation">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-[#8a8070] hover:bg-white/5 hover:text-[#EAE3D2]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <main className="flex-1 overflow-auto bg-[#0D0D0D]">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
