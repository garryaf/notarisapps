import Link from 'next/link'
import { Scale, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Scale className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold">Notaris Annisa Diah Paramitha</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kantor Notaris & PPAT profesional yang melayani berbagai kebutuhan legalitas dokumen Anda dengan integritas dan kepercayaan.
            </p>
          </div>

          {/* Layanan */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Layanan</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>Akta Jual Beli</li>
              <li>Akta Pendirian PT</li>
              <li>Legalisasi Dokumen</li>
              <li>Surat Kuasa Notariil</li>
            </ul>
          </div>

          {/* Navigasi */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Navigasi</h3>
            <nav className="flex flex-col gap-2" aria-label="Footer links">
              <Link href="/" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Beranda
              </Link>
              <Link href="/booking" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Pesan Layanan
              </Link>
              <Link href="/tracking" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                Lacak Pesanan
              </Link>
            </nav>
          </div>

          {/* Kontak */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Kontak</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-3 w-3 shrink-0" />
                Jakarta, Indonesia
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3 w-3 shrink-0" />
                (021) 1234-5678
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3 w-3 shrink-0" />
                info@notaris-annisa.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Kantor Notaris Annisa Diah Paramitha, Mkn., SH. Seluruh hak cipta dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  )
}
