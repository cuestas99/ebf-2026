'use client'
import { useState, useEffect, useCallback } from 'react'
import { TURMAS, TurmaKey, DIAS } from '@/lib/turmas'
import TurmaBadge from '@/components/TurmaBadge'
import Confetti from '@/components/Confetti'

type CheckIn = { id: number; dia: number }
type Crianca = {
  id: number; nome: string; idade: number; turma: string
  nomePai: string; nomeMae: string; whatsapp: string
  restricaoAlimentar: boolean; qualRestricao: string | null
  autorizadoNome1: string | null; autorizadoParentesco1: string | null
  autorizadoNome2: string | null; autorizadoParentesco2: string | null
  checkins: CheckIn[]
}

type FiltroPresenca = 'todos' | 'presentes' | 'ausentes'
type ConfirmDialog = { crianca: Crianca } | null

function formatWhatsApp(tel: string) {
  return 'https://wa.me/55' + tel.replace(/\D/g, '')
}

export default function CheckinPage() {
  const [diaAtual, setDiaAtual] = useState(1)
  const [busca, setBusca] = useState('')
  const [turmaBusca, setTurmaBusca] = useState('')
  const [filtroPresenca, setFiltroPresenca] = useState<FiltroPresenca>('todos')
  const [criancas, setCriancas] = useState<Crianca[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmar, setConfirmar] = useState<ConfirmDialog>(null)
  const [feedback, setFeedback] = useState<{ msg: string; tipo: 'ok' | 'erro' | 'ja' } | null>(null)
  const [confetti, setConfetti] = useState(false)

  const buscarCriancas = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    if (turmaBusca) params.set('turma', turmaBusca)
    const res = await fetch(`/api/criancas?${params}`)
    setCriancas(await res.json())
    setLoading(false)
  }, [busca, turmaBusca])

  useEffect(() => {
    const t = setTimeout(buscarCriancas, 300)
    return () => clearTimeout(t)
  }, [buscarCriancas])

  function temCheckin(crianca: Crianca, dia: number) {
    return crianca.checkins.some((c) => c.dia === dia)
  }

  async function fazerCheckin(crianca: Crianca) {
    setConfirmar(null)
    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criancaId: crianca.id, dia: diaAtual }),
    })
    if (res.status === 409) {
      setFeedback({ msg: `${crianca.nome} já fez check-in no Dia ${diaAtual}!`, tipo: 'ja' })
    } else if (res.ok) {
      setFeedback({ msg: `✅ ${crianca.nome} — Dia ${diaAtual} registrado!`, tipo: 'ok' })
      setConfetti(true)
      setTimeout(() => setConfetti(false), 2000)
      buscarCriancas()
    } else {
      setFeedback({ msg: 'Erro ao registrar check-in.', tipo: 'erro' })
    }
    setTimeout(() => setFeedback(null), 3000)
  }

  async function desfazerCheckin(crianca: Crianca) {
    await fetch('/api/checkin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criancaId: crianca.id, dia: diaAtual }),
    })
    buscarCriancas()
  }

  const presentes = criancas.filter((c) => temCheckin(c, diaAtual)).length
  const ausentes  = criancas.length - presentes

  const listaFiltrada = criancas.filter((c) => {
    if (filtroPresenca === 'presentes') return temCheckin(c, diaAtual)
    if (filtroPresenca === 'ausentes')  return !temCheckin(c, diaAtual)
    return true
  })

  return (
    <div className="space-y-4">
      <Confetti ativo={confetti} />

      <div>
        <h1 className="font-fredoka text-3xl text-roxo">✅ Check-in Diário</h1>
        <p className="text-gray-500 text-sm font-nunito">Registre a presença das crianças</p>
      </div>

      {/* Seletor de dia */}
      <div className="card">
        <p className="font-fredoka text-gray-500 text-sm mb-3">Dia do evento:</p>
        <div className="flex gap-2 flex-wrap">
          {DIAS.map(({ num, label }) => (
            <button key={num} onClick={() => setDiaAtual(num)}
              className={`px-4 py-2 rounded-btn font-fredoka text-sm transition-all ${
                diaAtual === num
                  ? 'bg-roxo text-white shadow-cartoon -translate-y-0.5'
                  : 'bg-white border-2 border-[#d6c4a8] text-gray-600 hover:border-roxo hover:text-roxo'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Total',    valor: criancas.length, cor: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
            { label: 'Presentes', valor: presentes,      cor: 'text-green-600', bg: 'bg-green-50 border-green-200' },
            { label: 'Ausentes',  valor: ausentes,       cor: 'text-red-500',   bg: 'bg-red-50 border-red-200'   },
          ].map(({ label, valor, cor, bg }) => (
            <div key={label} className={`rounded-card border-2 p-3 text-center ${bg}`}>
              <div className={`font-fredoka text-2xl ${cor}`}>{valor}</div>
              <div className="text-xs text-gray-500 font-nunito">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-card p-4 font-fredoka text-center text-sm border-2 ${
          feedback.tipo === 'ok'  ? 'bg-green-50 text-green-700 border-green-400 shadow-[3px_3px_0_#15803d]' :
          feedback.tipo === 'ja' ? 'bg-amarelo-claro text-gray-800 border-amarelo shadow-cartoon-amarelo' :
                                   'bg-red-50 text-red-700 border-red-400 shadow-cartoon-red'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Busca + filtro de presença */}
      <div className="card space-y-3">
        <div className="flex gap-3 flex-col sm:flex-row">
          <input className="input flex-1" placeholder="🔍 Buscar por nome..."
            value={busca} onChange={(e) => setBusca(e.target.value)} autoFocus />
          <select className="input sm:w-48" value={turmaBusca} onChange={(e) => setTurmaBusca(e.target.value)}>
            <option value="">Todas as turmas</option>
            {Object.entries(TURMAS).map(([key, info]) => (
              <option key={key} value={key}>{info.emoji} {info.label}</option>
            ))}
          </select>
        </div>

        {/* Tabs presença */}
        <div className="flex gap-2">
          {([
            { valor: 'todos',     label: `Todos (${criancas.length})` },
            { valor: 'presentes', label: `✅ Presentes (${presentes})` },
            { valor: 'ausentes',  label: `❌ Ausentes (${ausentes})` },
          ] as { valor: FiltroPresenca; label: string }[]).map(({ valor, label }) => (
            <button key={valor} onClick={() => setFiltroPresenca(valor)}
              className={`px-3 py-1.5 rounded-btn font-fredoka text-xs transition-all ${
                filtroPresenca === valor
                  ? 'bg-roxo text-white shadow-cartoon-sm -translate-y-0.5'
                  : 'bg-white border-2 border-[#d6c4a8] text-gray-600 hover:border-roxo'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {loading && (
          <div className="card text-center py-10 text-gray-400 font-nunito">⏳ Carregando...</div>
        )}

        {!loading && listaFiltrada.length === 0 && (
          <div className="card text-center py-12">
            {filtroPresenca === 'ausentes' && ausentes === 0 ? (
              <>
                <div className="text-5xl mb-3">🎉</div>
                <p className="font-fredoka text-xl text-green-600">Todas as crianças já fizeram check-in!</p>
              </>
            ) : filtroPresenca === 'presentes' && presentes === 0 ? (
              <>
                <div className="text-5xl mb-3">🕐</div>
                <p className="font-fredoka text-xl text-gray-400">Nenhum check-in ainda hoje</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-fredoka text-xl text-gray-400">Nenhuma criança encontrada</p>
              </>
            )}
          </div>
        )}

        {!loading && listaFiltrada.map((crianca) => {
          const jaFez = temCheckin(crianca, diaAtual)
          const temRestricao = crianca.restricaoAlimentar
          return (
            <div key={crianca.id}
              className={`card flex items-center gap-4 py-3 px-4 transition-all ${
                jaFez        ? 'border-2 border-green-400 bg-green-50' :
                temRestricao ? 'border-2 border-amarelo bg-amarelo-claro' : ''
              }`}>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-fredoka text-base ${jaFez ? 'text-green-700' : 'text-gray-800'}`}>
                    {crianca.nome}
                  </span>
                  {temRestricao && (
                    <span className="bg-amarelo text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full font-nunito animate-pulse">
                      ⚠️ RESTRIÇÃO
                    </span>
                  )}
                  {jaFez && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full font-nunito">
                      ✅ Presente
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <TurmaBadge turma={crianca.turma} />
                  <span className="text-xs text-gray-400 font-nunito">{crianca.nomePai} / {crianca.nomeMae}</span>
                  {temRestricao && (
                    <span className="text-xs text-amber-700 font-bold font-nunito">🚫 {crianca.qualRestricao}</span>
                  )}
                </div>

                <div className="flex gap-1 mt-2">
                  {[1,2,3,4,5].map((d) => (
                    <div key={d}
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold font-nunito border-2 ${
                        temCheckin(crianca, d)
                          ? 'bg-roxo border-roxo-escuro text-white'
                          : 'bg-white border-[#d6c4a8] text-gray-400'
                      }`}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                {jaFez ? (
                  <button onClick={() => desfazerCheckin(crianca)}
                    className="px-3 py-1.5 rounded-btn text-xs font-bold font-nunito bg-white border-2 border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 transition-all">
                    Desfazer
                  </button>
                ) : (
                  <button onClick={() => setConfirmar({ crianca })}
                    className={`px-4 py-2 rounded-btn font-fredoka text-sm -translate-y-0.5 transition-all ${
                      temRestricao
                        ? 'bg-amarelo text-gray-900 shadow-cartoon-amarelo hover:bg-amarelo-escuro'
                        : 'bg-roxo text-white shadow-cartoon hover:bg-roxo-escuro'
                    } active:translate-y-0 active:shadow-none`}>
                    Check-in ✓
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal confirmação */}
      {confirmar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-fundo rounded-card shadow-2xl border-2 border-[#e8d9c4] max-w-sm w-full p-6 space-y-4">
            <h2 className="font-fredoka text-roxo text-xl">Confirmar Check-in</h2>

            <div className="bg-white rounded-card p-4 space-y-2 border border-[#e8d9c4]">
              <p className="font-nunito text-sm"><span className="font-bold">Criança:</span> {confirmar.crianca.nome}</p>
              <TurmaBadge turma={confirmar.crianca.turma} />
              <p className="font-nunito text-sm"><span className="font-bold">Pai/Resp.:</span> {confirmar.crianca.nomePai}</p>
              <p className="font-nunito text-sm"><span className="font-bold">Mãe/Resp.:</span> {confirmar.crianca.nomeMae}</p>
              <p className="font-nunito text-sm">
                <span className="font-bold">WhatsApp: </span>
                <a href={formatWhatsApp(confirmar.crianca.whatsapp)} target="_blank" rel="noopener noreferrer"
                  className="text-green-600 font-bold hover:underline">
                  📱 {confirmar.crianca.whatsapp}
                </a>
              </p>
              <p className="font-nunito text-sm"><span className="font-bold">Dia:</span> {diaAtual}</p>

              {/* Autorização de retirada */}
              <div className="bg-gray-50 border border-[#e8d9c4] rounded-card p-3 mt-2 space-y-1">
                <p className="font-fredoka text-gray-700 text-sm">🔐 Autorizados para retirar:</p>
                <p className="font-nunito text-xs text-gray-600">✅ {confirmar.crianca.nomePai} <span className="text-gray-400">(pai)</span></p>
                <p className="font-nunito text-xs text-gray-600">✅ {confirmar.crianca.nomeMae} <span className="text-gray-400">(mãe)</span></p>
                {confirmar.crianca.autorizadoNome1 && (
                  <p className="font-nunito text-xs text-gray-600">✅ {confirmar.crianca.autorizadoNome1} <span className="text-gray-400">({confirmar.crianca.autorizadoParentesco1})</span></p>
                )}
                {confirmar.crianca.autorizadoNome2 && (
                  <p className="font-nunito text-xs text-gray-600">✅ {confirmar.crianca.autorizadoNome2} <span className="text-gray-400">({confirmar.crianca.autorizadoParentesco2})</span></p>
                )}
              </div>

              {confirmar.crianca.restricaoAlimentar && (
                <div className="bg-amarelo-claro border-2 border-amarelo rounded-card p-3 mt-2 shadow-cartoon-amarelo">
                  <p className="font-fredoka text-gray-800 text-sm">⚠️ ATENÇÃO — RESTRIÇÃO ALIMENTAR!</p>
                  <p className="text-gray-700 text-sm mt-1 font-nunito">{confirmar.crianca.qualRestricao}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setConfirmar(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={() => fazerCheckin(confirmar.crianca)} className="btn-success flex-1">
                Confirmar ✅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
