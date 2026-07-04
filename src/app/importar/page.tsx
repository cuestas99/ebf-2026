'use client'
import { useState, useEffect } from 'react'

type Resultado = {
  importados: number
  ignorados: number
  erros: string[]
  total: number
}

export default function ImportarPage() {
  const [totalAtual, setTotalAtual] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetch('/api/admin/importar')
      .then(r => r.json())
      .then(d => setTotalAtual(d.totalAtual))
      .catch(() => {})
  }, [])

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
    </div>
  )
}
