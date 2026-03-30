import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NotaryPlatform. Semua hak dilindungi.
          </p>
          <nav className="flex gap-4" aria-label="Footer links">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Beranda
            </Link>
            <Link href="/booking" className="text-sm text-muted-foreground hover:text-foreground">
              Booking
            </Link>
            <Link href="/tracking" className="text-sm text-muted-foreground hover:text-foreground">
              Tracking
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
