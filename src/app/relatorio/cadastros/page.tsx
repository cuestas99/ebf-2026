export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { TURMAS, TurmaKey } from '@/lib/turmas'
import PrintButton from '@/components/PrintButton'

const TZ = 'America/Sao_Paulo'

// 00:00 do dia (horário de Brasília) convertido para UTC.
// Brasília é UTC-3, então 00:00 BRT = 03:00 UTC do mesmo dia.
function inicioDiaBRT(iso: string): Date {
  return new Date(`${iso}T03:00:00.000Z`)
}
function inicioDiaSeguinteBRT(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + 1, 3, 0, 0))
}

function fmtData(dt: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit' }).format(dt)
}
function fmtHora(dt: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(dt)
}
function fmtTelefone(tel: string): string {
  const n = (tel || '').replace(/\D/g, '')
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return tel || '—'
}

export default async function CadastrosPorDiaPage({
  searchParams,
}: {
  searchParams: { de?: string; ate?: string }
}) {
  const session = await getSession()
  if (!session || session.perfil !== 'ADMIN') redirect('/login')

  const de = searchParams.de || '2026-07-13'
  const ate = searchParams.ate || '2026-07-14'

  const criancas = await prisma.crianca.findMany({
    where: { criadoEm: { gte: inicioDiaBRT(de), lt: inicioDiaSeguinteBRT(ate) } },
    select: {
      id: true, nome: true, turma: true,
      nomePai: true, nomeMae: true, whatsapp: true, outroContato: true,
      criadoEm: true,
    },
    orderBy: { criadoEm: 'asc' },
  })

  // Agrupa por dia (Brasília)
  const porDia = new Map<string, typeof criancas>()
  for (const c of criancas) {
    const dia = fmtData(c.criadoEm)
    if (!porDia.has(dia)) porDia.set(dia, [])
    porDia.get(dia)!.push(c)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h1 className="font-fredoka text-3xl text-roxo">📋 Cadastros por dia</h1>
          <p className="text-gray-500 text-sm font-nunito">
            Crianças cadastradas no sistema entre {fmtData(inicioDiaBRT(de))} e {fmtData(inicioDiaBRT(ate))} ·{' '}
            <strong className="text-roxo">{criancas.length}</strong> no total
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/relatorio" className="btn-secondary text-sm px-4 py-2">← Relatórios</Link>
          <PrintButton />
        </div>
      </div>

      {/* Filtro de datas */}
      <form className="card flex items-end gap-3 flex-wrap no-print" method="get">
        <div>
          <label className="label">De</label>
          <input type="date" name="de" defaultValue={de} className="input w-auto" />
        </div>
        <div>
          <label className="label">Até</label>
          <input type="date" name="ate" defaultValue={ate} className="input w-auto" />
        </div>
        <button type="submit" className="btn-primary text-sm px-4 py-2">🔍 Filtrar</button>
      </form>

      {criancas.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🗓️</div>
          <p className="font-fredoka text-xl text-gray-400">Nenhum cadastro nesse período</p>
        </div>
      ) : (
        Array.from(porDia.entries()).map(([dia, lista]) => (
          <div key={dia} className="card overflow-x-auto">
            <h2 className="font-fredoka text-roxo text-xl mb-3">
              {dia} <span className="text-gray-400 text-sm font-nunito">· {lista.length} cadastro(s)</span>
            </h2>
            <table className="w-full text-sm font-nunito">
              <thead>
                <tr className="border-b-2 border-[#f0e6d6] text-left">
                  {['#', 'Criança', 'Pai / Responsável', 'Mãe / Responsável', 'WhatsApp', 'Outro contato', 'Hora'].map((h) => (
                    <th key={h} className="py-2 px-2 text-gray-500 font-fredoka">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((c, i) => {
                  const info = TURMAS[c.turma as TurmaKey]
                  return (
                    <tr key={c.id} className={`border-b border-[#f5ece0] ${i % 2 ? 'bg-[#fdf8f0]' : ''}`}>
                      <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                      <td className="py-2 px-2">
                        <div className="font-bold text-gray-800">{c.nome}</div>
                        {info && <div className="text-xs" style={{ color: info.hex }}>{info.emoji} {info.label.split(' (')[0]}</div>}
                      </td>
                      <td className="py-2 px-2 text-gray-700">{c.nomePai}</td>
                      <td className="py-2 px-2 text-gray-700">{c.nomeMae}</td>
                      <td className="py-2 px-2">
                        <a href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="text-green-600 font-bold hover:underline">📱 {fmtTelefone(c.whatsapp)}</a>
                      </td>
                      <td className="py-2 px-2 text-gray-600">{fmtTelefone(c.outroContato)}</td>
                      <td className="py-2 px-2 text-gray-400 text-xs">{fmtHora(c.criadoEm)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
