'use client'
import { useState, useEffect } from 'react'

type Resultado = {
  importados: number
  ignorados: number
  erros: string[]
  total: number
}

type Mudanca = { nome: string; idade: number; de: string; para: string; pulseira: string }

export default function ImportarPage() {
  const [totalAtual, setTotalAtual] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erro, setErro] = useState('')
  const [mudancas, setMudancas] = useState<Mudanca[] | null>(null)
  const [recalculando, setRecalculando] = useState(false)
  const [recalcOk, setRecalcOk] = useState<number | null>(null)

  function carregarPrevia() {
    fetch('/api/admin/recalcular-turmas', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMudancas(d.mudancas) })
      .catch(() => {})
  }

  useEffect(() => {
    fetch('/api/admin/importar')
      .then(r => r.json())
      .then(d => setTotalAtual(d.totalAtual))
      .catch(() => {})
    carregarPrevia()
  }, [])

  async function recalcular() {
    setRecalculando(true)
    setRecalcOk(null)
    try {
      const res = await fetch('/api/admin/recalcular-turmas', { method: 'POST' })
      const data = await res.json()
      if (res.ok) { setRecalcOk(data.atualizados); setMudancas([]) }
    } finally {
      setRecalculando(false)
    }
  }

  async function importar() {
    setCarregando(true)
    setErro('')
    setResultado(null)
    try {
      const res = await fetch('/api/admin/importar', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Erro desconhecido'); return }
      setResultado(data)
      setTotalAtual(prev => (prev ?? 0) + data.importados)
    } catch {
      setErro('Erro de conexão')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-fredoka text-3xl text-roxo">📥 Importar do Google Forms</h1>
        <p className="text-gray-500 font-nunito text-sm mt-1">
          Importa as inscrições da planilha Google Sheets da EBF 2026.
        </p>
      </div>

      <div className="card space-y-4">
        <div className="bg-roxo-claro border-2 border-roxo/30 rounded-card p-4 text-sm font-nunito text-gray-700 space-y-1">
          <p>📋 <strong>Planilha:</strong> Inscrições EBF 2026 (Google Forms)</p>
          <p>🔢 <strong>Crianças no banco:</strong> {totalAtual ?? '...'}</p>
          <p>⚠️ Crianças com o mesmo nome serão ignoradas (sem duplicatas).</p>
          <p>📍 O endereço será importado no campo <em>Rua</em> — os campos número e bairro ficarão como "-" para ajuste posterior.</p>
        </div>

        {erro && (
          <div className="bg-red-50 border-2 border-red-300 rounded-card p-3 text-sm text-red-600 font-nunito">{erro}</div>
        )}

        {resultado && (
          <div className="bg-green-50 border-2 border-green-400 rounded-card p-4 space-y-2 font-nunito text-sm">
            <p className="font-fredoka text-green-700 text-lg">✅ Importação concluída!</p>
            <p>✅ <strong>{resultado.importados}</strong> crianças importadas</p>
            <p>⏭️ <strong>{resultado.ignorados}</strong> ignoradas (já existiam ou linha vazia)</p>
            <p>📊 Total na planilha: <strong>{resultado.total}</strong></p>
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

        <button
          onClick={importar}
          disabled={carregando}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
          {carregando ? '⏳ Importando... (pode levar 30s)' : '🚀 Iniciar Importação'}
        </button>

        <p className="text-xs text-gray-400 font-nunito text-center">
          Você pode rodar novamente — duplicatas são ignoradas automaticamente.
        </p>
      </div>

      {/* Recálculo de turmas */}
      <div className="card space-y-4">
        <div>
          <h2 className="font-fredoka text-roxo text-xl">🎗️ Revisar Turmas e Pulseiras</h2>
          <p className="text-gray-500 font-nunito text-sm mt-1">
            As faixas etárias mudaram: Juniores agora é 7-8 anos e Pré-Adolescentes 9-12 anos.
            Crianças de 9 anos precisam trocar de turma (pulseira azul → roxa).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-nunito">
          {[
            { faixa: '2-4 anos', nome: 'Amarela', hex: '#F5C518' },
            { faixa: '5-6 anos', nome: 'Verde',   hex: '#22c55e' },
            { faixa: '7-8 anos', nome: 'Azul',    hex: '#3b82f6' },
            { faixa: '9-12 anos', nome: 'Roxa',   hex: '#8B3FBE' },
          ].map(p => (
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
              {mudancas.map(m => (
                <p key={m.nome} className="font-nunito text-xs text-gray-700">
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
