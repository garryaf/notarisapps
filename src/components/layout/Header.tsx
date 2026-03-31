'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Scale, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { logout } from '@/features/auth/services/auth-service'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isLoading, isAdmin } = useAuth()

  const baseLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/booking', label: 'Layanan' },
    { href: '/tracking', label: 'Lacak Pesanan' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0D0D0D]/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F2A24] text-[#EAE3D2] transition-transform group-hover:scale-105">
            <Scale className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-[#EAE3D2] tracking-tight font-serif">
              Notaris Annisa
            </span>
            <span className="text-[10px] text-[#8a8070]">Mkn., SH</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
          {baseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-[#8a8070] transition-colors hover:text-[#EAE3D2] after:absolute after:bottom-0 after:left-1/2 after:h-[1px] after:w-0 after:bg-[#EAE3D2] after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}

          {!isLoading && user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="relative rounded-md px-3 py-2 text-sm font-medium text-[#8a8070] transition-colors hover:text-[#EAE3D2] after:absolute after:bottom-0 after:left-1/2 after:h-[1px] after:w-0 after:bg-[#EAE3D2] after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full"
                >
                  Admin
                </Link>
              )}
              <span className="px-3 py-2 text-sm text-[#EAE3D2]">
                {user.name}
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-[#8a8070] transition-colors hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </>
          ) : !isLoading ? (
            <Link
              href="/login"
              className="relative rounded-md px-3 py-2 text-sm font-medium text-[#8a8070] transition-colors hover:text-[#EAE3D2] after:absolute after:bottom-0 after:left-1/2 after:h-[1px] after:w-0 after:bg-[#EAE3D2] after:transition-all after:duration-300 hover:after:left-0 hover:after:w-full"
            >
              Masuk
            </Link>
          ) : null}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-[#EAE3D2] hover:bg-white/5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-white/5 bg-[#0D0D0D]/95 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-200"
          aria-label="Navigasi mobile"
        >
          <div className="flex flex-col px-4 py-2">
            {baseLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md py-3 px-2 text-sm font-medium text-[#8a8070] transition-colors hover:bg-white/5 hover:text-[#EAE3D2]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isLoading && user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="rounded-md py-3 px-2 text-sm font-medium text-[#8a8070] transition-colors hover:bg-white/5 hover:text-[#EAE3D2]"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="rounded-md py-3 px-2 text-sm text-[#EAE3D2]">
                  {user.name}
                </div>
                <button
                  onClick={() => { setMobileOpen(false); logout() }}
                  className="flex items-center gap-1.5 rounded-md py-3 px-2 text-sm font-medium text-[#8a8070] transition-colors hover:bg-white/5 hover:text-red-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </>
            ) : !isLoading ? (
              <Link
                href="/login"
                className="rounded-md py-3 px-2 text-sm font-medium text-[#8a8070] transition-colors hover:bg-white/5 hover:text-[#EAE3D2]"
                onClick={() => setMobileOpen(false)}
              >
                Masuk
              </Link>
            ) : null}
          </div>
        </nav>
      )}
    </header>
  )
}
