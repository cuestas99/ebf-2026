'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setErro(data.error)
      return
    }
    if (data.usuario.perfil === 'RECEPCIONIST') {
      router.push('/checkin')
    } else {
      router.push('/')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-fundo flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="UCP Silva Jardim" width={160} height={80} className="object-contain" priority />
          </div>
          <h1 className="font-fredoka text-3xl text-roxo">EBF 2026</h1>
          <p className="text-gray-500 font-nunito text-sm mt-1">Sistema de Gestão — IPB Silva Jardim</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-fredoka text-roxo text-xl text-center">🔐 Entrar</h2>

          {erro && (
            <div className="bg-red-50 border-2 border-red-300 rounded-card p-3 text-sm text-red-600 font-nunito text-center">
              {erro}
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" autoFocus required />
          </div>

          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••" required />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
            {loading ? '⏳ Entrando...' : '→ Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 font-nunito">
          Primeiro acesso?{' '}
          <a href="/setup" className="text-roxo underline">Configurar sistema</a>
        </p>
      </div>
    </div>
  )
}
