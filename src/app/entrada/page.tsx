'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { TURMAS, TurmaKey } from '@/lib/turmas'
import Confetti from '@/components/Confetti'
import { useEvento } from '@/lib/useEvento'

type CheckIn = { id: number; dia: number }
type Crianca = {
  id: number; nome: string; idade: number; turma: string
  nomePai: string; nomeMae: string; whatsapp: string
  restricaoAlimentar: boolean; qualRestricao: string | null
  checkins: CheckIn[]
}

type Etapa = 'telefone' | 'selecionar' | 'sucesso'

export default function EntradaPage() {
  const { evento, carregando: carregandoEvento } = useEvento()
  const [etapa, setEtapa] = useState<Etapa>('telefone')
  const [telefone, setTelefone] = useState('')
  const [criancas, setCriancas] = useState<Crianca[]>([])
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set())
  const [buscando, setBuscando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erroNaoEncontrado, setErroNaoEncontrado] = useState(false)
  const [nomesConfirmados, setNomesConfirmados] = useState<string[]>([])
  const [pulseiras, setPulseiras] = useState<{ nome: string; turma: string }[]>([])
  const [confetti, setConfetti] = useState(false)
  const [countdown, setCountdown] = useState(12)
  const [erroCheckin, setErroCheckin] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const diaAtual = evento?.dia ?? 0

  function formatarTelefone(val: string) {
    const nums = val.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 2)  return nums
    if (nums.length <= 7)  return `(${nums.slice(0,2)}) ${nums.slice(2)}`
    return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`
  }

  function temCheckin(crianca: Crianca) {
    return crianca.checkins.some((c) => c.dia === diaAtual)
  }

  async function buscarPorTelefone() {
    const nums = telefone.replace(/\D/g, '')
    if (nums.length < 8) return
    setBuscando(true)
    setErroNaoEncontrado(false)
    const res = await fetch(`/api/entrada?whatsapp=${nums}`, { cache: 'no-store' })
    const data: Crianca[] = await res.json()
    setBuscando(false)
    if (data.length === 0) {
      setErroNaoEncontrado(true)
      return
    }
    setCriancas(data)
    // pré-selecionar crianças que ainda não fizeram check-in hoje
    const semCheckin = new Set(data.filter((c) => !temCheckin(c)).map((c) => c.id))
    setSelecionadas(semCheckin)
    setEtapa('selecionar')
  }

  function toggleSelecao(id: number) {
    setSelecionadas((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function confirmarCheckin() {
    const ids = Array.from(selecionadas)
    if (ids.length === 0 || !evento?.ativo) return
    setEnviando(true)
    setErroCheckin('')

    // O servidor decide o dia. Se ele recusar, nada é registrado.
    const respostas = await Promise.all(
      ids.map((criancaId) =>
        fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ criancaId }),
        })
      )
    )

    const bloqueado = respostas.find((r) => r.status === 403)
    if (bloqueado) {
      const { error } = await bloqueado.json().catch(() => ({ error: '' }))
      setErroCheckin(error || 'Check-in indisponível hoje.')
      setEnviando(false)
      return
    }

    const confirmadas = criancas.filter((c) => selecionadas.has(c.id))
    setNomesConfirmados(confirmadas.map((c) => c.nome.split(' ')[0]))
    setPulseiras(confirmadas.map((c) => ({ nome: c.nome.split(' ')[0], turma: c.turma })))
    setEnviando(false)
    setConfetti(true)
    setEtapa('sucesso')
    setTimeout(() => setConfetti(false), 3000)
    setCountdown(12)
    const intervalo = setInterval(() => setCountdown((n) => n - 1), 1000)
    setTimeout(() => { clearInterval(intervalo); reiniciar() }, 12000)
  }

  function reiniciar() {
    setEtapa('telefone')
    setTelefone('')
    setCriancas([])
    setSelecionadas(new Set())
    setErroNaoEncontrado(false)
    setNomesConfirmados([])
    setErroCheckin('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── TELA 0: CARREGANDO / FORA DO PERÍODO DA EBF ───────────────
  if (carregandoEvento) return (
    <div className="min-h-screen bg-fundo flex items-center justify-center">
      <p className="font-fredoka text-2xl text-gray-400">⏳ Carregando...</p>
    </div>
  )

  if (!evento?.ativo) {
    const antes = (evento?.faltamDias ?? 0) > 0
    return (
      <div className="min-h-screen bg-fundo flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="UCP Silva Jardim" width={180} height={90} className="object-contain" priority />
          </div>

          <div className="bg-white rounded-card border-2 border-[#e8d9c4] p-8 shadow-card space-y-4">
            <div className="text-7xl">{antes ? '⏳' : '🎊'}</div>
            <h1 className="font-fredoka text-3xl text-roxo leading-tight">
              {antes ? 'A EBF ainda não começou' : 'A EBF 2026 foi concluída!'}
            </h1>
            {antes ? (
              <>
                <p className="font-nunito text-gray-600 text-lg">
                  O check-in abre no dia <strong className="text-roxo">{evento?.inicioLabel}</strong>.
                </p>
                <div className="bg-roxo-claro border-2 border-roxo/30 rounded-card p-4">
                  <p className="font-fredoka text-roxo text-2xl">
                    Faltam {evento?.faltamDias} {evento?.faltamDias === 1 ? 'dia' : 'dias'}
                  </p>
                  <p className="font-nunito text-gray-500 text-sm mt-1">
                    {evento?.inicioLabel} a {evento?.fimLabel} de 2026
                  </p>
                </div>
              </>
            ) : (
              <p className="font-nunito text-gray-600 text-lg">
                Obrigado por participar! Que Deus abençoe cada criança. 🙏
              </p>
            )}
          </div>

          <p className="text-gray-400 text-sm font-nunito">
            Dúvidas? Chame a recepção. 😊
          </p>
        </div>
      </div>
    )
  }

  // ── TELA 1: DIGITAR TELEFONE ──────────────────────────────────
  if (etapa === 'telefone') return (
    <div className="min-h-screen bg-fundo flex flex-col items-center justify-center px-4 py-12">
      <Confetti ativo={confetti} />

      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="UCP Silva Jardim" width={180} height={90} className="object-contain" priority />
          </div>
          <h1 className="font-fredoka text-4xl text-roxo leading-tight">
            Check-in EBF 2026
          </h1>
          <p className="text-gray-500 font-nunito mt-3 text-lg">
            Digite o WhatsApp cadastrado para fazer o check-in dos seus filhos
          </p>
        </div>

        {/* Dia atual — definido pelo servidor, não editável */}
        <div className="bg-roxo rounded-card p-4 text-white shadow-cartoon border-2 border-roxo-escuro">
          <p className="font-fredoka text-amarelo text-2xl">
            📅 Dia {evento.dia} · {evento.nome}
          </p>
          <p className="font-nunito text-white/80 text-sm mt-0.5">
            {evento.dataHoje} — dia {evento.dia} de {evento.totalDias} da EBF
          </p>
        </div>

        {/* Input telefone */}
        <div className="bg-white rounded-card border-2 border-[#e8d9c4] p-6 shadow-card space-y-4">
          <input
            ref={inputRef}
            autoFocus
            type="tel"
            inputMode="numeric"
            value={telefone}
            onChange={(e) => {
              setTelefone(formatarTelefone(e.target.value))
              setErroNaoEncontrado(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && buscarPorTelefone()}
            placeholder="(22) 99999-0000"
            className="input text-center text-2xl font-fredoka tracking-widest py-5"
          />

          {erroNaoEncontrado && (
            <div className="bg-red-50 border-2 border-red-300 rounded-card p-4">
              <p className="font-fredoka text-red-600 text-base">😕 Nenhuma criança encontrada</p>
              <p className="text-red-500 text-sm font-nunito mt-1">
                Verifique o número ou procure a recepção para fazer o cadastro.
              </p>
            </div>
          )}

          <button
            onClick={buscarPorTelefone}
            disabled={buscando || telefone.replace(/\D/g, '').length < 8}
            className="btn-primary w-full py-5 text-xl disabled:opacity-40 disabled:shadow-none disabled:translate-y-0">
            {buscando ? '⏳ Buscando...' : '🔍 Buscar meus filhos'}
          </button>
        </div>

        <p className="text-gray-400 text-sm font-nunito">
          Problemas? Chame a recepção. 😊
        </p>
      </div>
    </div>
  )

  // ── TELA 2: SELECIONAR FILHOS ─────────────────────────────────
  if (etapa === 'selecionar') {
    const todasJaFizeram = criancas.every((c) => temCheckin(c))
    return (
      <div className="min-h-screen bg-fundo flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">

          <div className="text-center">
            <h1 className="font-fredoka text-3xl text-roxo">Seus filhos 👧👦</h1>
            <p className="text-gray-500 font-nunito mt-1">
              Selecione quem chegou hoje — <span className="font-bold text-roxo">Dia {diaAtual}</span>
            </p>
          </div>

          {/* Cards dos filhos */}
          <div className="space-y-3">
            {criancas.map((crianca) => {
              const jaFez = temCheckin(crianca)
              const sel   = selecionadas.has(crianca.id)
              const info  = TURMAS[crianca.turma as TurmaKey]

              return (
                <button
                  key={crianca.id}
                  type="button"
                  disabled={jaFez}
                  onClick={() => !jaFez && toggleSelecao(crianca.id)}
                  className={`w-full text-left rounded-card border-2 p-5 transition-all ${
                    jaFez
                      ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      : sel
                        ? 'bg-roxo-claro border-roxo shadow-cartoon -translate-y-0.5'
                        : 'bg-white border-[#e8d9c4] hover:border-roxo hover:shadow-cartoon-sm active:-translate-y-0.5'
                  }`}>
                  <div className="flex items-center gap-4">
                    {/* Checkbox visual */}
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-lg ${
                      jaFez
                        ? 'bg-green-500 border-green-500 text-white'
                        : sel
                          ? 'bg-roxo border-roxo text-white'
                          : 'bg-white border-[#d6c4a8]'
                    }`}>
                      {jaFez ? '✓' : sel ? '✓' : ''}
                    </div>

                    <div className="flex-1">
                      <p className={`font-fredoka text-xl ${sel ? 'text-roxo' : 'text-gray-800'}`}>
                        {crianca.nome}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-nunito ${info.corClaro} ${info.texto}`}>
                          {info.emoji} {info.label.split(' (')[0]}
                        </span>
                        {jaFez && (
                          <span className="text-xs text-green-600 font-bold font-nunito">
                            ✅ Já fez check-in hoje
                          </span>
                        )}
                        {crianca.restricaoAlimentar && (
                          <span className="text-xs bg-amarelo text-gray-900 font-bold px-2 py-0.5 rounded-full font-nunito">
                            ⚠️ {crianca.qualRestricao}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {erroCheckin && (
            <div className="bg-red-50 border-2 border-red-300 rounded-card p-4 text-center">
              <p className="font-fredoka text-red-600">🚫 {erroCheckin}</p>
            </div>
          )}

          {todasJaFizeram ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-card p-5 text-center">
              <p className="font-fredoka text-green-700 text-xl">🎉 Todos já fizeram check-in hoje!</p>
              <p className="text-green-600 font-nunito text-sm mt-1">Bom dia de EBF!</p>
            </div>
          ) : (
            <button
              onClick={confirmarCheckin}
              disabled={selecionadas.size === 0 || enviando}
              className="btn-primary w-full py-5 text-xl disabled:opacity-40 disabled:shadow-none disabled:translate-y-0">
              {enviando
                ? '⏳ Registrando...'
                : `✅ Confirmar check-in${selecionadas.size > 0 ? ` (${selecionadas.size})` : ''}`}
            </button>
          )}

          <button onClick={reiniciar} className="btn-secondary w-full py-3">
            ← Voltar
          </button>
        </div>
      </div>
    )
  }

  // ── TELA 3: SUCESSO ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-fundo flex flex-col items-center justify-center px-4 py-12">
      <Confetti ativo={confetti} />

      <div className="w-full max-w-lg text-center space-y-5">
        <div className="text-6xl animate-bounce">🎊</div>

        <div>
          <h1 className="font-fredoka text-3xl text-roxo">Check-in feito!</h1>
          <p className="font-nunito text-gray-600 mt-1">
            {nomesConfirmados.length === 1
              ? `${nomesConfirmados[0]} está registrado(a) no Dia ${diaAtual}.`
              : `${nomesConfirmados.join(' e ')} estão registrados no Dia ${diaAtual}.`}
          </p>
        </div>

        {/* Instrução principal: retirar a pulseira */}
        <div className="bg-amarelo rounded-card p-5 border-2 border-amarelo-escuro shadow-cartoon-amarelo">
          <p className="font-fredoka text-gray-900 text-2xl leading-tight">
            👉 Vá até a RECEPÇÃO
          </p>
          <p className="font-fredoka text-gray-800 text-lg mt-1">
            e retire {pulseiras.length === 1 ? 'a pulseira' : 'as pulseiras'}:
          </p>
        </div>

        <div className="space-y-3">
          {pulseiras.map(({ nome, turma }, i) => {
            const t = TURMAS[turma as TurmaKey]
            return (
              <div key={`${nome}-${i}`}
                className="flex items-center gap-4 rounded-card border-4 p-4 bg-white shadow-card"
                style={{ borderColor: t?.hex }}>
                <div
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg shrink-0 ring-2"
                  style={{ backgroundColor: t?.hex, boxShadow: `0 0 0 3px ${t?.hex}` }}
                />
                <div className="text-left min-w-0">
                  <p className="font-fredoka text-gray-800 text-xl leading-tight truncate">{nome}</p>
                  <p className="font-fredoka text-2xl leading-tight" style={{ color: t?.hex }}>
                    Pulseira {t?.pulseira}
                  </p>
                  <p className="font-nunito text-xs text-gray-400">{t?.label.split(' (')[0]}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-2">
          <div className="w-full bg-[#e8d9c4] rounded-full h-3 overflow-hidden border border-[#d6c4a8]">
            <div
              className="h-full bg-roxo rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 12) * 100}%` }}
            />
          </div>
          <p className="text-gray-400 font-nunito text-sm">
            Voltando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </div>

        <button
          onClick={reiniciar}
          className="btn-secondary w-full py-4 text-lg">
          🏠 Próxima família
        </button>
      </div>
    </div>
  )
}
