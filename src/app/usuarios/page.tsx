'use client'
import { useState, useEffect, useCallback } from 'react'

type Usuario = { id: number; nome: string; email: string; perfil: string; criadoEm: string }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('RECEPCIONIST')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [feedback, setFeedback] = useState('')
  const [excluindo, setExcluindo] = useState<number | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/usuarios')
    setUsuarios(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true); setErro('')
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, perfil }),
    })
    const data = await res.json()
    setSalvando(false)
    if (!res.ok) { setErro(data.error); return }
    setShowForm(false); setNome(''); setEmail(''); setSenha(''); setPerfil('RECEPCIONIST')
    setFeedback(`${data.nome} adicionado(a) com sucesso!`)
    setTimeout(() => setFeedback(''), 3000)
    carregar()
  }

  async function excluir(id: number, nome: string) {
    if (!confirm(`Excluir ${nome}?`)) return
    setExcluindo(id)
    await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    setExcluindo(null)
    carregar()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-fredoka text-3xl text-roxo">👤 Usuários</h1>
          <p className="text-gray-500 text-sm font-nunito">Controle de acesso ao sistema</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setErro('') }} className="btn-primary text-sm px-4 py-2">
          {showForm ? '✕ Cancelar' : '+ Novo usuário'}
        </button>
      </div>

      {feedback && (
        <div className="bg-green-50 border-2 border-green-400 rounded-card p-3 text-green-700 font-nunito text-sm font-semibold">
          ✅ {feedback}
        </div>
      )}

      {showForm && (
        <form onSubmit={salvar} className="card space-y-4">
          <h2 className="font-fredoka text-roxo text-lg">Novo usuário</h2>
          {erro && <div className="bg-red-50 border-2 border-red-300 rounded-card p-3 text-red-600 font-nunito text-sm">{erro}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mín. 6 caracteres" required />
            </div>
            <div>
              <label className="label">Perfil</label>
              <select className="input" value={perfil} onChange={e => setPerfil(e.target.value)}>
                <option value="ADMIN">🛡️ Admin (acesso total)</option>
                <option value="RECEPCIONIST">🎫 Recepcionista (só check-in)</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-50">
            {salvando ? '⏳ Salvando...' : '✅ Criar usuário'}
          </button>
        </form>
      )}

      <div className="card space-y-3">
        <h2 className="font-fredoka text-gray-700 text-base">Usuários cadastrados</h2>
        {loading && <p className="text-gray-400 font-nunito text-sm">⏳ Carregando...</p>}
        {!loading && usuarios.map((u) => (
          <div key={u.id} className="flex items-center gap-4 py-3 border-b border-[#f0e6d6] last:border-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-fredoka text-base shrink-0 ${
              u.perfil === 'ADMIN' ? 'bg-roxo-claro text-roxo' : 'bg-green-100 text-green-700'
            }`}>
              {u.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-fredoka text-gray-800">{u.nome}</p>
              <p className="text-xs text-gray-400 font-nunito">{u.email}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full font-nunito ${
              u.perfil === 'ADMIN' ? 'bg-roxo-claro text-roxo' : 'bg-green-100 text-green-700'
            }`}>
              {u.perfil === 'ADMIN' ? '🛡️ Admin' : '🎫 Recepcionista'}
            </span>
            <button onClick={() => excluir(u.id, u.nome)} disabled={excluindo === u.id}
              className="text-red-400 hover:text-red-600 text-sm font-nunito disabled:opacity-50 transition-colors">
              {excluindo === u.id ? '...' : 'Excluir'}
            </button>
          </div>
        ))}
      </div>

      <div className="card bg-roxo-claro border-2 border-roxo/30">
        <h3 className="font-fredoka text-roxo text-base mb-2">🔑 Níveis de acesso</h3>
        <div className="space-y-2 font-nunito text-sm text-gray-600">
          <p><span className="font-bold">🛡️ Admin</span> — acesso total: dashboard, cadastro, crianças, check-in, relatórios, usuários</p>
          <p><span className="font-bold">🎫 Recepcionista</span> — somente a tela de check-in diário</p>
        </div>
      </div>
    </div>
  )
}
