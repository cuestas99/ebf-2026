'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TURMAS, TurmaKey } from '@/lib/turmas'
import TurmaBadge from '@/components/TurmaBadge'

type Crianca = {
  id: number; nome: string; idade: number; turma: string
  nomePai: string; nomeMae: string; whatsapp: string; outroContato: string
  restricaoAlimentar: boolean; qualRestricao: string | null
  checkins: { dia: number }[]
}

function formatWhatsApp(tel: string) {
  return 'https://wa.me/55' + tel.replace(/\D/g, '')
}

export default function CriancasPage() {
  const [criancas, setCriancas] = useState<Crianca[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [turmaBusca, setTurmaBusca] = useState('')
  const [confirmarExcluir, setConfirmarExcluir] = useState<Crianca | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const [feedback, setFeedback] = useState('')

  const buscar = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    if (turmaBusca) params.set('turma', turmaBusca)
    const res = await fetch(`/api/criancas?${params}`)
    setCriancas(await res.json())
    setLoading(false)
  }, [busca, turmaBusca])

  useEffect(() => {
    const t = setTimeout(buscar, 300)
    return () => clearTimeout(t)
  }, [buscar])

  async function excluir(crianca: Crianca) {
    setExcluindo(true)
    await fetch(`/api/criancas/${crianca.id}`, { method: 'DELETE' })
    setConfirmarExcluir(null)
    setFeedback(`${crianca.nome} foi removido(a).`)
    setTimeout(() => setFeedback(''), 3000)
    buscar()
    setExcluindo(false)
  }

  const comRestricao = criancas.filter((c) => c.restricaoAlimentar).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-fredoka text-3xl text-roxo">👧 Crianças Cadastradas</h1>
          <p className="text-gray-500 text-sm font-nunito">
            {criancas.length} crianças{comRestricao > 0 ? ` · ${comRestricao} com restrição alimentar` : ''}
          </p>
        </div>
        <Link href="/cadastro" className="btn-primary">✏️ Nova Inscrição</Link>
      </div>

      {feedback && (
        <div className="bg-green-50 border-2 border-green-400 rounded-card p-3 font-nunito text-green-700 text-sm font-semibold">
          ✅ {feedback}
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="flex gap-3 flex-col sm:flex-row">
          <input className="input flex-1" placeholder="🔍 Buscar por nome..."
            value={busca} onChange={(e) => setBusca(e.target.value)} autoFocus />
          <select className="input sm:w-56" value={turmaBusca}
            onChange={(e) => setTurmaBusca(e.target.value)}>
            <option value="">Todas as turmas</option>
            {Object.entries(TURMAS).map(([key, info]) => (
              <option key={key} value={key}>{info.emoji} {info.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {loading && (
          <div className="card text-center py-10 text-gray-400 font-nunito">⏳ Carregando...</div>
        )}

        {!loading && criancas.length === 0 && (
          <div className="card text-center py-14">
            <div className="text-6xl mb-3">🔍</div>
            <p className="font-fredoka text-xl text-gray-400">Nenhuma criança encontrada</p>
            <p className="text-gray-400 text-sm font-nunito mt-1">
              {busca || turmaBusca ? 'Tente outros filtros' : 'Comece cadastrando a primeira criança!'}
            </p>
            {!busca && !turmaBusca && (
              <Link href="/cadastro" className="btn-primary inline-flex mt-4">✏️ Cadastrar agora</Link>
            )}
          </div>
        )}

        {!loading && criancas.map((crianca) => (
          <div key={crianca.id}
            className={`card flex items-start gap-4 py-3 px-4 ${crianca.restricaoAlimentar ? 'border-2 border-amarelo bg-amarelo-claro' : ''}`}>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-fredoka text-gray-800 text-base">{crianca.nome}</span>
                <span className="text-xs text-gray-400 font-nunito">{crianca.idade} anos</span>
                {crianca.restricaoAlimentar && (
                  <span className="bg-amarelo text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full font-nunito">
                    ⚠️ {crianca.qualRestricao}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <TurmaBadge turma={crianca.turma} />
                <span className="text-xs text-gray-500 font-nunito">{crianca.nomePai} / {crianca.nomeMae}</span>
                <a href={formatWhatsApp(crianca.whatsapp)} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-600 font-bold font-nunito hover:underline">
                  📱 {crianca.whatsapp}
                </a>
              </div>
              {/* Dias presentes */}
              <div className="flex gap-1 mt-2">
                {[1,2,3,4,5].map((d) => (
                  <div key={d}
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold font-nunito border-2 ${
                      crianca.checkins.some((c) => c.dia === d)
                        ? 'bg-roxo border-roxo-escuro text-white'
                        : 'bg-white border-[#d6c4a8] text-gray-400'
                    }`}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 shrink-0 flex-col sm:flex-row">
              <Link href={`/criancas/${crianca.id}`}
                className="px-3 py-1.5 rounded-btn font-fredoka text-xs bg-roxo text-white shadow-cartoon-sm hover:bg-roxo-escuro active:translate-y-0.5 active:shadow-none transition-all">
                ✏️ Editar
              </Link>
              <button onClick={() => setConfirmarExcluir(crianca)}
                className="px-3 py-1.5 rounded-btn font-fredoka text-xs bg-white border-2 border-red-300 text-red-500 hover:bg-red-50 transition-all">
                🗑️ Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal excluir */}
      {confirmarExcluir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-fundo rounded-card shadow-2xl border-2 border-[#e8d9c4] max-w-sm w-full p-6 space-y-4">
            <h2 className="font-fredoka text-red-500 text-xl">Excluir Criança</h2>
            <div className="bg-white rounded-card p-4 border border-[#e8d9c4]">
              <p className="font-nunito text-gray-700 text-sm">
                Tem certeza que deseja excluir <span className="font-bold">{confirmarExcluir.nome}</span>?
                <br />
                <span className="text-red-500 text-xs mt-1 block">⚠️ Todos os check-ins serão removidos também.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExcluir(null)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={() => excluir(confirmarExcluir)} disabled={excluindo}
                className="btn-danger flex-1 disabled:opacity-50">
                {excluindo ? '⏳...' : '🗑️ Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
