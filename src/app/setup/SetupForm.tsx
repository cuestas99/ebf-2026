'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupForm() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
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
  )
}
