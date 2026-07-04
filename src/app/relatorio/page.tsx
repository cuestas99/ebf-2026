'use client'
import { useState, useEffect } from 'react'
import { TURMAS, TurmaKey } from '@/lib/turmas'
import TurmaBadge from '@/components/TurmaBadge'

type TurmaRelatorio = {
  turma: string; label: string; emoji: string
  total: number; totalDias: number; percentual: number
  porDia: { dia: number; presentes: number }[]
}
type DiaRelatorio = { dia: number; presentes: number; percentual: number }
type CriancaTabela = {
  id: number; nome: string; idade: number; turma: string; turmaLabel: string
  rua: string; numero: string; complemento: string | null; bairro: string; cidade: string
  nomePai: string; nomeMae: string; whatsapp: string; outroContato: string
  comoSoube: string | null; pertenceIgreja: boolean; qualIgreja: string | null
  restricaoAlimentar: boolean; qualRestricao: string | null
  diasPresente: number[]; totalDias: number
}
type IdadeRelatorio = { idade: number; total: number; percentual: number }
type RelatorioData = {
  totalCriancas: number
  porTurma: TurmaRelatorio[]
  porDia: DiaRelatorio[]
  porIdade: IdadeRelatorio[]
  tabela: CriancaTabela[]
}

export default function RelatorioPage() {
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [turmaBusca, setTurmaBusca] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'resumo' | 'tabela' | 'certificados'>('resumo')

  function carregarDados() {
    setLoading(true)
    fetch('/api/relatorio', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }

  useEffect(() => { carregarDados() }, [])

  async function exportarExcel() {
    const { utils, writeFile } = await import('xlsx')
    if (!data) return
    const linhas = data.tabela.map((c) => ({
      'Nome': c.nome, 'Idade': c.idade, 'Turma': c.turmaLabel,
      'Rua': c.rua, 'Número': c.numero, 'Complemento': c.complemento || '',
      'Bairro': c.bairro, 'Cidade': c.cidade,
      'Pai/Responsável': c.nomePai, 'Mãe/Responsável': c.nomeMae,
      'WhatsApp': c.whatsapp, 'Outro Contato': c.outroContato,
      'Como soube da EBF': c.comoSoube || '',
      'Pertence a Igreja': c.pertenceIgreja ? 'Sim' : 'Não', 'Qual Igreja': c.qualIgreja || '',
      'Restrição Alimentar': c.restricaoAlimentar ? 'Sim' : 'Não', 'Qual Restrição': c.qualRestricao || '',
      'Dia 1': c.diasPresente.includes(1) ? 'Presente' : 'Ausente',
      'Dia 2': c.diasPresente.includes(2) ? 'Presente' : 'Ausente',
      'Dia 3': c.diasPresente.includes(3) ? 'Presente' : 'Ausente',
      'Dia 4': c.diasPresente.includes(4) ? 'Presente' : 'Ausente',
      'Dia 5': c.diasPresente.includes(5) ? 'Presente' : 'Ausente',
      'Total de Dias': c.totalDias,
    }))
    const ws = utils.json_to_sheet(linhas)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Frequência')
    const resumo = data.porTurma.map((t) => ({
      'Turma': t.label, 'Total de Crianças': t.total,
      'Total Check-ins': t.totalDias, 'Frequência (%)': `${t.percentual}%`,
    }))
    utils.book_append_sheet(wb, utils.json_to_sheet(resumo), 'Por Turma')
    writeFile(wb, 'EBF_2026_Frequencia.xlsx')
  }

  const tabelaFiltrada = data?.tabela.filter((c) => !turmaBusca || c.turma === turmaBusca) ?? []

  if (loading) {
    return (
      <div className="card text-center py-16 text-gray-400 font-nunito">⏳ Carregando relatório...</div>
    )
  }
  if (!data) return null

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-fredoka text-3xl text-roxo">📊 Relatórios</h1>
          <p className="text-gray-500 text-sm font-nunito">{data.totalCriancas} crianças cadastradas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={carregarDados} disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
            {loading ? '⏳' : '🔄'} Atualizar
          </button>
          <button onClick={exportarExcel} className="btn-primary">📥 Exportar Excel</button>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 flex-wrap" id="certificados">
        {([
          { id: 'resumo',        label: '📈 Resumo' },
          { id: 'tabela',        label: '📋 Tabela Completa' },
          { id: 'certificados',  label: '🏅 Certificados' },
        ] as const).map((aba) => (
          <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
            className={`px-5 py-2 rounded-btn font-fredoka text-sm transition-all ${
              abaAtiva === aba.id
                ? 'bg-roxo text-white shadow-cartoon -translate-y-0.5'
                : 'bg-white border-2 border-[#d6c4a8] text-gray-600 hover:border-roxo hover:text-roxo'
            }`}>
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === 'resumo' && (
        <div className="space-y-4">

          {/* Inscritos por turma */}
          <div className="card">
            <h2 className="font-fredoka text-roxo text-xl mb-4">👥 Inscritos por Turma</h2>
            {(() => {
                const maximo = Math.max(...data.porTurma.map(x => x.total))
                return (
                  <div className="space-y-3">
                    {data.porTurma.map((t) => {
                      const info = TURMAS[t.turma as TurmaKey]
                      const pctBarra = maximo > 0 ? (t.total / maximo) * 100 : 0
                      return (
                        <div key={t.turma} className="flex items-center gap-3">
                          <span className="text-xl w-7 shrink-0">{t.emoji}</span>
                          <span className="w-36 text-sm font-bold text-gray-600 font-nunito truncate shrink-0">
                            {t.label.split(' (')[0]}
                          </span>
                          <div className="flex-1 bg-[#f0e6d6] rounded-full h-7 overflow-hidden border border-[#e0d0bc]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${t.total > 0 ? Math.max(pctBarra, 4) : 0}%`,
                                backgroundColor: info?.hex ?? '#8B3FBE',
                              }}
                            />
                          </div>
                          <span className="w-8 text-sm font-bold text-gray-700 font-nunito text-right shrink-0">{t.total}</span>
                          <span className="w-10 text-xs text-gray-400 font-nunito text-right shrink-0">
                            {data.totalCriancas > 0 ? Math.round((t.total / data.totalCriancas) * 100) : 0}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
            <div className="mt-4 pt-4 border-t border-[#f0e6d6] flex items-center justify-between text-sm font-nunito text-gray-500">
              <span>Total inscrito: <strong className="text-roxo font-fredoka text-lg">{data.totalCriancas}</strong> crianças</span>
              <span>
                Maior turma:{' '}
                <strong className="text-gray-700">
                  {data.porTurma.reduce((a, b) => a.total >= b.total ? a : b, data.porTurma[0])?.label.split(' (')[0] ?? '—'}
                </strong>
              </span>
            </div>
          </div>

          {/* Presença por dia */}
          <div className="card">
            <h2 className="font-fredoka text-roxo text-xl mb-4">📅 Presença por Dia</h2>
            <div className="grid grid-cols-5 gap-3">
              {data.porDia.map(({ dia, presentes, percentual }) => (
                <div key={dia} className="text-center">
                  <div className="relative bg-[#f0e6d6] rounded-card h-24 flex items-end overflow-hidden border border-[#e0d0bc]">
                    <div
                      className="w-full bg-roxo rounded-card transition-all"
                      style={{ height: `${Math.max(percentual, 4)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center font-fredoka text-xl text-gray-800">
                      {presentes}
                    </span>
                  </div>
                  <div className="mt-1 font-fredoka text-gray-600 text-sm">Dia {dia}</div>
                  <div className="text-xs text-roxo font-bold font-nunito">{percentual}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Por turma */}
          <div className="grid md:grid-cols-2 gap-4">
            {data.porTurma.map((t) => {
              const info = TURMAS[t.turma as TurmaKey]
              return (
                <div key={t.turma} className={`card border-l-4 ${info?.borda}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{t.emoji}</span>
                    <div>
                      <div className="font-fredoka text-gray-800">{t.label}</div>
                      <div className="text-gray-400 text-xs font-nunito">{t.total} crianças</div>
                    </div>
                    <div className={`ml-auto font-fredoka text-xl ${info?.texto}`}>{t.percentual}%</div>
                  </div>
                  <div className="bg-[#f0e6d6] rounded-full h-3 mb-3 border border-[#e0d0bc]">
                    <div className={`${info?.cor} h-3 rounded-full transition-all`}
                      style={{ width: `${t.percentual}%` }} />
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {t.porDia.map(({ dia, presentes }) => (
                      <div key={dia} className="text-center">
                        <div className={`${info?.corClaro} ${info?.texto} rounded-lg py-1 text-xs font-bold font-nunito`}>
                          {presentes}
                        </div>
                        <div className="text-xs text-gray-400 font-nunito">D{dia}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Por idade */}
          <div className="card">
            <h2 className="font-fredoka text-roxo text-xl mb-4">🎂 Inscritos por Idade</h2>
            <div className="space-y-2">
              {data.porIdade.map(({ idade, total, percentual }) => {
                const maximo = Math.max(...data.porIdade.map(i => i.total))
                const pctBarra = maximo > 0 ? Math.round((total / maximo) * 100) : 0
                return (
                  <div key={idade} className="flex items-center gap-3">
                    <span className="w-16 text-sm font-bold text-gray-600 font-nunito shrink-0">
                      {idade} anos
                    </span>
                    <div className="flex-1 bg-[#f0e6d6] rounded-full h-7 overflow-hidden border border-[#e0d0bc]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${total > 0 ? Math.max(pctBarra, 4) : 0}%`,
                          backgroundColor: '#F5C518',
                        }}
                      />
                    </div>
                    <span className="w-8 text-sm font-bold text-gray-700 font-nunito text-right shrink-0">{total}</span>
                    <span className="w-10 text-xs text-gray-400 font-nunito text-right shrink-0">
                      {percentual}%
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[#f0e6d6] grid grid-cols-3 gap-3 text-center">
              {(() => {
                const media = data.porIdade.length > 0
                  ? (data.porIdade.reduce((acc, i) => acc + i.idade * i.total, 0) / (data.totalCriancas || 1)).toFixed(1)
                  : '—'
                const moda = data.porIdade.reduce((a, b) => a.total >= b.total ? a : b, data.porIdade[0])
                const menores = data.porIdade.filter(i => i.idade <= 6).reduce((a, b) => a + b.total, 0)
                const maiores = data.porIdade.filter(i => i.idade >= 7).reduce((a, b) => a + b.total, 0)
                return (
                  <>
                    <div className="bg-roxo-claro rounded-card p-3">
                      <div className="font-fredoka text-roxo text-2xl">{media}</div>
                      <div className="text-xs text-gray-500 font-nunito">Média de idade</div>
                    </div>
                    <div className="bg-amarelo/20 rounded-card p-3">
                      <div className="font-fredoka text-amarelo-escuro text-2xl">{moda?.idade ?? '—'}</div>
                      <div className="text-xs text-gray-500 font-nunito">Idade mais comum</div>
                    </div>
                    <div className="bg-green-50 rounded-card p-3">
                      <div className="font-fredoka text-green-600 text-2xl">{menores}↕{maiores}</div>
                      <div className="text-xs text-gray-500 font-nunito">≤6 anos · ≥7 anos</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {abaAtiva === 'tabela' && (
        <div className="card overflow-x-auto">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="font-fredoka text-roxo text-xl">Todas as Crianças</h2>
            <select className="input w-auto text-sm" value={turmaBusca}
              onChange={(e) => setTurmaBusca(e.target.value)}>
              <option value="">Todas as turmas</option>
              {Object.entries(TURMAS).map(([key, info]) => (
                <option key={key} value={key}>{info.emoji} {info.label}</option>
              ))}
            </select>
            <span className="text-gray-400 text-sm font-nunito">{tabelaFiltrada.length} registros</span>
          </div>

          <table className="w-full text-sm font-nunito">
            <thead>
              <tr className="border-b-2 border-[#f0e6d6]">
                {['Nome', 'Turma', 'Pai/Responsável', 'WhatsApp', 'Restrição', 'D1','D2','D3','D4','D5','Total'].map((h, i) => (
                  <th key={h} className={`py-2 px-3 text-gray-500 font-fredoka text-left ${i >= 5 && i < 10 ? 'text-center px-1' : ''} ${i === 10 ? 'text-center' : ''} ${i === 2 ? 'hidden md:table-cell' : ''} ${i === 3 ? 'hidden md:table-cell' : ''} ${i === 4 ? 'hidden lg:table-cell' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabelaFiltrada.map((c, i) => (
                <tr key={c.id}
                  className={`border-b border-[#f5ece0] hover:bg-roxo-claro transition-colors ${
                    c.restricaoAlimentar ? 'bg-amarelo-claro' : i % 2 === 0 ? '' : 'bg-[#fdf8f0]'
                  }`}>
                  <td className="py-2 px-3">
                    <div className="font-bold text-gray-800">{c.nome}</div>
                    <div className="text-xs text-gray-400">{c.idade} anos</div>
                    {c.restricaoAlimentar && (
                      <div className="text-xs text-amber-700 font-bold">⚠️ {c.qualRestricao}</div>
                    )}
                  </td>
                  <td className="py-2 px-3"><TurmaBadge turma={c.turma} /></td>
                  <td className="py-2 px-3 hidden md:table-cell text-gray-600 text-xs">
                    <div>{c.nomePai}</div>
                    <div className="text-gray-400">{c.nomeMae}</div>
                  </td>
                  <td className="py-2 px-3 hidden md:table-cell text-gray-600 text-xs">{c.whatsapp}</td>
                  <td className="py-2 px-3 hidden lg:table-cell text-xs">
                    {c.restricaoAlimentar
                      ? <span className="text-amber-700 font-bold">{c.qualRestricao}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  {[1,2,3,4,5].map((d) => (
                    <td key={d} className="py-2 px-1 text-center">
                      {c.diasPresente.includes(d)
                        ? <span className="text-roxo font-bold">✓</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                  ))}
                  <td className="py-2 px-3 text-center">
                    <span className={`font-fredoka text-sm ${
                      c.totalDias >= 4 ? 'text-green-600' :
                      c.totalDias >= 2 ? 'text-amarelo-escuro' : 'text-red-400'
                    }`}>{c.totalDias}/5</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {abaAtiva === 'certificados' && (
        <div className="space-y-4">
          <div className="card bg-roxo-claro border-2 border-roxo/30">
            <p className="font-nunito text-gray-600 text-sm">
              🏅 Crianças com <span className="font-bold text-roxo">3 ou mais dias</span> de presença recebem certificado.
            </p>
          </div>

          {data.tabela.filter(c => c.totalDias >= 3).length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-3">🕐</div>
              <p className="font-fredoka text-xl text-gray-400">Nenhuma criança atingiu 3 dias ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.tabela
                .filter(c => c.totalDias >= 3)
                .sort((a, b) => b.totalDias - a.totalDias)
                .map(c => (
                  <div key={c.id} className="card flex items-center gap-4 py-3 px-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-fredoka text-gray-800">{c.nome}</span>
                        <TurmaBadge turma={c.turma} />
                        <span className={`font-fredoka text-sm ${c.totalDias === 5 ? 'text-green-600' : 'text-amarelo-escuro'}`}>
                          {c.totalDias === 5 ? '🌟 Presença total!' : `${c.totalDias}/5 dias`}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[1,2,3,4,5].map(d => (
                          <div key={d} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold font-nunito border-2 ${
                            c.diasPresente.includes(d) ? 'bg-roxo border-roxo text-white' : 'bg-white border-[#d6c4a8] text-gray-300'
                          }`}>{d}</div>
                        ))}
                      </div>
                    </div>
                    <a href={`/certificado/${c.id}`} target="_blank"
                      className="btn-primary text-sm px-4 py-2 shrink-0">
                      🖨️ Certificado
                    </a>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}
