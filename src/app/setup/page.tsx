'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SetupPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [jaConfigurado, setJaConfigurado] = useState(false)

  useEffect(() => {
    fetch('/api/auth/setup')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.configurado) setJaConfigurado(true) })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirmar) { setErro('As senhas não coincidem'); return }
    setLoading(true); setErro('')
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setErro(data.error); return }
    router.push('/login')
  }

  if (jaConfigurado) return (
    <div className="min-h-screen bg-fundo flex items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h1 className="font-fredoka text-roxo text-2xl">Sistema já configurado</h1>
        <p className="font-nunito text-gray-500 text-sm">Esta página só está disponível no primeiro acesso.</p>
        <a href="/login" className="btn-primary inline-flex">→ Ir para o login</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-fundo flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="UCP Silva Jardim" width={160} height={80} className="object-contain" />
          </div>
          <h1 className="font-fredoka text-3xl text-roxo">Configuração Inicial</h1>
          <p className="text-gray-500 font-nunito text-sm mt-1">Crie a conta de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {erro && (
            <div className="bg-red-50 border-2 border-red-300 rounded-card p-3 text-sm text-red-600 font-nunito text-center">{erro}</div>
          )}
          <div>
            <label className="label">Nome completo</label>
            <input className="input" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@email.com" required />
          </div>
          <div>
            <label className="label">Senha (mín. 6 caracteres)</label>
            <input className="input" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
          </div>
          <div>
            <label className="label">Confirmar senha</label>
            <input className="input" type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
            {loading ? '⏳ Criando...' : '✅ Criar conta de administrador'}
          </button>
        </form>
      </div>
    </div>
  )
}
