import { LoginForm } from '@/features/auth/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="underline hover:text-primary">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
