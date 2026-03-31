import { RegisterForm } from '@/features/auth/components/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] p-4">
      <div className="w-full max-w-md space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-[#8a8070]">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[#EAE3D2] underline hover:text-[#EAE3D2]/80">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
