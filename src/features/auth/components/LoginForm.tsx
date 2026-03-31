'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '../services/auth-service'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email wajib diisi')
      return
    }
    if (!password.trim()) {
      setError('Password wajib diisi')
      return
    }

    setIsLoading(true)
    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error ?? 'Login gagal')
      } else if (result.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="glass p-8 w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-[#EAE3D2]">Login</h2>
        <p className="text-sm text-[#8a8070] mt-1">Masuk ke akun Anda</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-[#EAE3D2]">Email</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="email@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
            required
            className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password" className="text-[#EAE3D2]">Password</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
            required
            className="bg-white/5 border-white/10 text-[#EAE3D2] placeholder:text-[#8a8070]/50"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-[#1F2A24] text-[#EAE3D2] hover:bg-[#2a3a30]"
          disabled={isLoading}
        >
          {isLoading ? 'Memproses...' : 'Login'}
        </Button>
      </form>
    </div>
  )
}
