import { LoginForm } from '@/features/auth/components/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] p-4">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-[#8a8070]">
          Belum punya akun?{' '}
          <Link href="/register" className="text-[#EAE3D2] underline hover:text-[#EAE3D2]/80">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
