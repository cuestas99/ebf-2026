'use client'
import { useState, useEffect, useCallback } from 'react'

type Conferencia = {
  totalAtual: number
  planilhaLinhas?: number
  planilhaUnicos?: number
  duplicadasNaPlanilha?: string[]
  faltando?: { nome: string; idade: number }[]
  soNoBanco?: string[]
  sincronizado?: boolean
  erroPlanilha?: string
}

type Resultado = {
  importados: number
  jaExistiam: number
  duplicadasNaPlanilha: string[]
  planilhaLinhas: number
  planilhaUnicos: number
  totalFinal: number
  erros: string[]
}

type Mudanca = { nome: string; idade: number; de: string; para: string; pulseira: string }

const PULSEIRAS = [
  { faixa: '2-4 anos',  nome: 'Amarela', hex: '#F5C518' },
  { faixa: '5-6 anos',  nome: 'Verde',   hex: '#22c55e' },
  { faixa: '7-8 anos',  nome: 'Azul',    hex: '#3b82f6' },
  { faixa: '9-12 anos', nome: 'Roxa',    hex: '#8B3FBE' },
]

export default function ImportarPage() {
  const [conf, setConf] = useState<Conferencia | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erro, setErro] = useState('')

  const [mudancas, setMudancas] = useState<Mudanca[] | null>(null)
  const [recalculando, setRecalculando] = useState(false)
  const [recalcOk, setRecalcOk] = useState<number | null>(null)

  const carregarConferencia = useCallback(() => {
    fetch('/api/admin/importar', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setConf(d) })
      .catch(() => {})
  }, [])

  const carregarPrevia = useCallback(() => {
    fetch('/api/admin/recalcular-turmas', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMudancas(d.mudancas) })
      .catch(() => {})
  }, [])

  useEffect(() => { carregarConferencia(); carregarPrevia() }, [carregarConferencia, carregarPrevia])

  async function importar() {
    setCarregando(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/admin/importar', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro desconhecido'); return }
      setResultado(data)
      carregarConferencia()
      carregarPrevia()
    } catch {
      setErro('Erro de conexão')
    } finally {
      setCarregando(false)
    }
  }

  async function recalcular() {
    setRecalculando(true); setRecalcOk(null)
    try {
      const res = await fetch('/api/admin/recalcular-turmas', { method: 'POST' })
      const data = await res.json()
      if (res.ok) { setRecalcOk(data.atualizados); setMudancas([]) }
    } finally {
      setRecalculando(false)
    }
  }

  const faltando = conf?.faltando ?? []
  const duplicadas = conf?.duplicadasNaPlanilha ?? []
  const soNoBanco = conf?.soNoBanco ?? []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-fredoka text-3xl text-roxo">📥 Importar do Google Forms</h1>
        <p className="text-gray-500 font-nunito text-sm mt-1">
          Sincroniza as inscrições da planilha da EBF 2026 com o banco do sistema.
        </p>
      </div>

      {/* Conferência planilha × banco */}
      <div className="card space-y-4">
        <h2 className="font-fredoka text-roxo text-xl">🔍 Conferência</h2>

        {conf?.erroPlanilha && (
          <div className="bg-red-50 border-2 border-red-300 rounded-card p-3 text-sm text-red-600 font-nunito">
            ⚠️ Não foi possível ler a planilha. Verifique se ela está compartilhada como
            &quot;qualquer pessoa com o link pode ver&quot;.
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-roxo-claro rounded-card p-3 border-2 border-roxo/30">
            <div className="font-fredoka text-roxo text-3xl">{conf?.planilhaLinhas ?? '—'}</div>
            <div className="text-xs text-gray-500 font-nunito mt-1">Linhas na planilha</div>
          </div>
          <div className="bg-amarelo/20 rounded-card p-3 border-2 border-amarelo">
            <div className="font-fredoka text-amarelo-escuro text-3xl">{conf?.planilhaUnicos ?? '—'}</div>
            <div className="text-xs text-gray-500 font-nunito mt-1">Crianças únicas</div>
          </div>
          <div className={`rounded-card p-3 border-2 ${
            conf?.sincronizado ? 'bg-green-50 border-green-400' : 'bg-white border-[#e8d9c4]'
          }`}>
            <div className={`font-fredoka text-3xl ${conf?.sincronizado ? 'text-green-600' : 'text-gray-700'}`}>
              {conf?.totalAtual ?? '—'}
            </div>
            <div className="text-xs text-gray-500 font-nunito mt-1">No banco</div>
          </div>
        </div>

        {conf?.sincronizado && (
          <div className="bg-green-50 border-2 border-green-400 rounded-card p-3 font-nunito text-sm text-green-700 text-center">
            ✅ Banco sincronizado com a planilha. Todas as telas mostram o mesmo número.
          </div>
        )}

        {duplicadas.length > 0 && (
          <details className="bg-amarelo-claro border-2 border-amarelo rounded-card p-3">
            <summary className="font-fredoka text-gray-800 text-sm cursor-pointer">
              🔁 {duplicadas.length} inscrição(ões) repetida(s) na planilha — contadas uma vez só
            </summary>
            <ul className="mt-2 space-y-0.5 text-xs text-gray-600 font-nunito">
              {duplicadas.map((n, i) => <li key={i}>• {n}</li>)}
            </ul>
          </details>
        )}

        {faltando.length > 0 && (
          <details open className="bg-red-50 border-2 border-red-300 rounded-card p-3">
            <summary className="font-fredoka text-red-700 text-sm cursor-pointer">
              ⬇️ {faltando.length} criança(s) da planilha ainda não estão no banco
            </summary>
            <ul className="mt-2 space-y-0.5 text-xs text-gray-700 font-nunito max-h-48 overflow-y-auto">
              {faltando.map((c, i) => <li key={i}>• {c.nome} ({c.idade} anos)</li>)}
            </ul>
          </details>
        )}

        {soNoBanco.length > 0 && (
          <details className="bg-blue-50 border-2 border-blue-300 rounded-card p-3">
            <summary className="font-fredoka text-blue-700 text-sm cursor-pointer">
              ℹ️ {soNoBanco.length} criança(s) no banco que não estão na planilha
            </summary>
            <p className="text-xs text-gray-500 font-nunito mt-1">
              Provavelmente cadastradas direto no sistema. Nada será removido.
            </p>
            <ul className="mt-2 space-y-0.5 text-xs text-gray-700 font-nunito max-h-40 overflow-y-auto">
              {soNoBanco.map((n, i) => <li key={i}>• {n}</li>)}
            </ul>
          </details>
        )}

        {erro && (
          <div className="bg-red-50 border-2 border-red-300 rounded-card p-3 text-sm text-red-600 font-nunito">{erro}</div>
        )}

        {resultado && (
          <div className="bg-green-50 border-2 border-green-400 rounded-card p-4 space-y-1 font-nunito text-sm">
            <p className="font-fredoka text-green-700 text-lg">✅ Importação concluída!</p>
            <p>✅ <strong>{resultado.importados}</strong> criança(s) importada(s)</p>
            <p>⏭️ <strong>{resultado.jaExistiam}</strong> já estavam no banco</p>
            <p>👧 Total agora: <strong>{resultado.totalFinal}</strong> crianças</p>
            {resultado.erros.length > 0 && (
              <details className="mt-2">
                <summary className="text-red-600 cursor-pointer">⚠️ {resultado.erros.length} erro(s)</summary>
                <ul className="mt-1 space-y-1 text-xs text-red-500">
                  {resultado.erros.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => { carregarConferencia(); carregarPrevia() }}
            className="btn-secondary px-4 py-3">🔄</button>
          <button
            onClick={importar}
            disabled={carregando || (conf?.sincronizado ?? false)}
            className="btn-primary flex-1 py-3 text-lg disabled:opacity-40 disabled:shadow-none disabled:translate-y-0">
            {carregando
              ? '⏳ Importando...'
              : conf?.sincronizado
                ? '✅ Nada a importar'
                : `🚀 Importar ${faltando.length || ''} criança(s)`}
          </button>
        </div>

        <p className="text-xs text-gray-400 font-nunito text-center">
          Seguro rodar quantas vezes quiser — só insere quem ainda não existe.
        </p>
      </div>

      {/* Recálculo de turmas */}
      <div className="card space-y-4">
        <div>
          <h2 className="font-fredoka text-roxo text-xl">🎗️ Revisar Turmas e Pulseiras</h2>
          <p className="text-gray-500 font-nunito text-sm mt-1">
            Juniores é 7-8 anos e Pré-Adolescentes 9-12 anos. Crianças de 9 anos cadastradas
            antes dessa mudança precisam trocar de turma (pulseira azul → roxa).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-nunito">
          {PULSEIRAS.map(p => (
            <div key={p.nome} className="rounded-card border-2 p-2"
              style={{ backgroundColor: `${p.hex}1a`, borderColor: p.hex }}>
              <div className="w-6 h-6 rounded-full mx-auto border-2 border-white shadow-sm mb-1"
                style={{ backgroundColor: p.hex }} />
              <div className="font-fredoka" style={{ color: p.hex }}>{p.nome}</div>
              <div className="text-gray-500">{p.faixa}</div>
            </div>
          ))}
        </div>

        {recalcOk !== null && (
          <div className="bg-green-50 border-2 border-green-400 rounded-card p-3 font-nunito text-sm text-green-700">
            ✅ {recalcOk} criança(s) tiveram a turma corrigida.
          </div>
        )}

        {mudancas === null ? (
          <p className="text-gray-400 font-nunito text-sm text-center">⏳ Verificando...</p>
        ) : mudancas.length === 0 ? (
          <div className="bg-green-50 border-2 border-green-300 rounded-card p-3 font-nunito text-sm text-green-700 text-center">
            ✅ Todas as turmas estão corretas para as idades cadastradas.
          </div>
        ) : (
          <>
            <div className="bg-amarelo-claro border-2 border-amarelo rounded-card p-3 space-y-1 max-h-56 overflow-y-auto">
              <p className="font-fredoka text-gray-800 text-sm">
                ⚠️ {mudancas.length} criança(s) na turma errada:
              </p>
              {mudancas.map((m, i) => (
                <p key={i} className="font-nunito text-xs text-gray-700">
                  <strong>{m.nome}</strong> ({m.idade} anos): {m.de} → <strong>{m.para}</strong> · pulseira {m.pulseira}
                </p>
              ))}
            </div>
            <button onClick={recalcular} disabled={recalculando}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
              {recalculando ? '⏳ Corrigindo...' : `🔧 Corrigir ${mudancas.length} turma(s)`}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
