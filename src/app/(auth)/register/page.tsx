import { RegisterForm } from '@/features/auth/components/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <Link href="/login" className="underline hover:text-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
