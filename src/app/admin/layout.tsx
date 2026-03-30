'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Users } from 'lucide-react'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Pesanan', icon: ClipboardList },
  { href: '/admin/notaries', label: 'Notaris', icon: Users },
]

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="text-lg font-bold text-primary">
          Admin Panel
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
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="flex h-16 items-center border-b bg-white px-6 md:hidden">
            <Link href="/admin" className="text-lg font-bold text-primary">
              Admin Panel
            </Link>
          </header>
          {/* Mobile nav */}
          <nav className="flex gap-2 border-b bg-white px-4 py-2 md:hidden" aria-label="Admin mobile navigation">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
