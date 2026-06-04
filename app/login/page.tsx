'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-nido-blush px-6"
      style={{
        backgroundImage: [
          'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(196,120,106,0.13) 0%, transparent 70%)',
          'radial-gradient(ellipse 50% 45% at 85% 100%, rgba(122,148,96,0.09) 0%, transparent 65%)',
        ].join(', '),
      }}
    >
      <div className="w-full max-w-sm animate-scale-in">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-36 h-36 mb-3">
            <Image
              src="/images/nido-logo.png"
              alt="Nido"
              width={144}
              height={144}
              className="w-full h-full object-contain"
              style={{ mixBlendMode: 'multiply' }}
              priority
            />
          </div>
          <h1 className="font-display text-3xl text-nido-rose tracking-wide">Nido</h1>
          <p className="text-sm text-nido-mauve mt-1.5">Tu espacio personal</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-nido-mist mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-nido-mist mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nido-mist hover:text-nido-mauve transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-nido-rose-deep bg-nido-rose-pale rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-nido-mist mt-6 tracking-wide">
          Solo acceso para usuaria autorizada
        </p>
      </div>
    </div>
  )
}
