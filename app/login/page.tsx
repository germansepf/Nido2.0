'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff } from 'lucide-react'

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
          'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(220,107,132,0.13) 0%, transparent 70%)',
          'radial-gradient(ellipse 50% 45% at 85% 100%, rgba(184,169,217,0.1) 0%, transparent 65%)',
        ].join(', '),
      }}
    >
      <div className="w-full max-w-sm animate-scale-in">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-20 h-20 rounded-[1.75rem] flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #dc6b84 0%, #9a8cbf 100%)',
              boxShadow: '0 10px 40px -8px rgba(220,107,132,0.55)',
            }}
          >
            <span className="font-display text-white text-4xl font-bold leading-none select-none">
              N
            </span>
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
