export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { TURMAS, TurmaKey } from '@/lib/turmas'
import { diaDoEvento, faltamDias, EVENTO_INICIO_LABEL, EVENTO_FIM_LABEL } from '@/lib/evento'

async function getDashboardData() {
  const [totalCriancas, totalCheckins, porTurma] = await Promise.all([
    prisma.crianca.count(),
    prisma.checkIn.count(),
    prisma.crianca.groupBy({ by: ['turma'], _count: { _all: true } }),
  ])

  const checkinsPorDia = await Promise.all(
    [1, 2, 3, 4, 5].map(async (dia) => ({
      dia,
      count: await prisma.checkIn.count({ where: { dia } }),
    }))
  )

  const comRestricao = await prisma.crianca.count({ where: { restricaoAlimentar: true } })

  return { totalCriancas, totalCheckins, porTurma, checkinsPorDia, comRestricao }
}

export default async function Home() {
  const { totalCriancas, totalCheckins, porTurma, checkinsPorDia, comRestricao } = await getDashboardData()

  const frequenciaGeral = totalCriancas > 0
    ? Math.round((totalCheckins / (totalCriancas * 5)) * 100)
    : 0

  const diaAtual = diaDoEvento()
  const diasRestantes = faltamDias()
  const inicioStr = EVENTO_INICIO_LABEL
  const fimStr    = EVENTO_FIM_LABEL

  return (
    <div className="space-y-6">

      {/* Indicador de dia do evento */}
      {diaAtual ? (
        <div className="bg-roxo rounded-card p-4 text-white shadow-cartoon border-2 border-roxo-escuro flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-fredoka text-amarelo text-lg">🎉 HOJE É O DIA {diaAtual.dia} DA EBF!</p>
            <p className="font-nunito text-white/80 text-sm">{diaAtual.nome} · {inicioStr} a {fimStr}</p>
          </div>
          <Link href="/checkin" className="bg-amarelo text-gray-900 font-fredoka px-5 py-2 rounded-btn shadow-cartoon-amarelo hover:bg-amarelo-escuro transition-all -translate-y-0.5 active:translate-y-0 active:shadow-none text-sm">
            Fazer Check-in →
          </Link>
        </div>
      ) : diasRestantes > 0 ? (
        <div className="bg-roxo-claro rounded-card p-4 border-2 border-roxo flex items-center justify-between flex-wrap gap-3 shadow-cartoon-sm">
          <div>
            <p className="font-fredoka text-roxo text-lg">⏳ Faltam {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'} para a EBF!</p>
            <p className="font-nunito text-gray-500 text-sm">{inicioStr} a {fimStr} de 2026</p>
          </div>
          <Link href="/cadastro" className="btn-primary text-sm px-4 py-2">
            Cadastrar Crianças
          </Link>
        </div>
      ) : diasRestantes <= 0 && !diaAtual ? (
        <div className="bg-green-50 rounded-card p-4 border-2 border-green-400 text-center shadow-[3px_3px_0_#15803d]">
          <p className="font-fredoka text-green-700 text-lg">🎊 A EBF 2026 foi concluída! Que Deus abençoe cada criança!</p>
        </div>
      ) : null}

      {/* Hero */}
      <div className="text-center py-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="UCP Silva Jardim"
            width={220}
            height={110}
            className="object-contain drop-shadow-lg"
            priority
          />
        </div>
        <h1 className="font-fredoka text-4xl text-roxo">Escola Bíblica de Férias 2026</h1>
        <p className="text-gray-500 mt-2 font-nunito">Sistema de Cadastro e Check-in</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { valor: totalCriancas, label: 'Crianças',      emoji: '👧', cor: 'text-roxo' },
          { valor: totalCheckins,  label: 'Check-ins',     emoji: '✅', cor: 'text-green-600' },
          { valor: `${frequenciaGeral}%`, label: 'Frequência', emoji: '📈', cor: 'text-blue-600' },
          { valor: comRestricao,   label: 'Com Restrição', emoji: '⚠️', cor: 'text-red-500' },
        ].map(({ valor, label, emoji, cor }) => (
          <div key={label} className="card text-center">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className={`font-fredoka text-3xl ${cor}`}>{valor}</div>
            <div className="text-xs text-gray-500 mt-1 font-nunito">{label}</div>
          </div>
        ))}
      </div>

      {/* Acesso rápido */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/cadastro" className="card hover:-translate-y-1 transition-transform group block">
          <div className="text-4xl mb-3">✏️</div>
          <h2 className="font-fredoka text-xl text-roxo group-hover:text-roxo-escuro">Cadastrar Criança</h2>
          <p className="text-gray-500 text-sm mt-1 font-nunito">Adicione novas crianças com todas as informações.</p>
        </Link>

        <Link href="/checkin" className="card hover:-translate-y-1 transition-transform group block">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="font-fredoka text-xl text-green-600 group-hover:text-green-700">Fazer Check-in</h2>
          <p className="text-gray-500 text-sm mt-1 font-nunito">Registre a presença a cada dia do evento.</p>
        </Link>

        <Link href="/relatorio" className="card hover:-translate-y-1 transition-transform group block">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="font-fredoka text-xl text-blue-600 group-hover:text-blue-700">Ver Relatórios</h2>
          <p className="text-gray-500 text-sm mt-1 font-nunito">Frequência por turma, dias e exportação Excel.</p>
        </Link>
      </div>

      {/* Presença por dia */}
      <div className="card">
        <h2 className="font-fredoka text-roxo text-xl mb-4">📅 Presença por Dia</h2>
        <div className="grid grid-cols-5 gap-3">
          {checkinsPorDia.map(({ dia, count }) => (
            <div key={dia} className="text-center">
              <div className="bg-roxo rounded-card p-3 text-white shadow-cartoon-sm">
                <div className="font-fredoka text-2xl">{count}</div>
                <div className="text-xs opacity-80 font-nunito">crianças</div>
              </div>
              <div className="font-fredoka text-gray-600 mt-1 text-sm">Dia {dia}</div>
              <div className="text-xs text-roxo font-bold font-nunito">
                {totalCriancas > 0 ? Math.round((count / totalCriancas) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Por turma */}
      <div className="card">
        <h2 className="font-fredoka text-roxo text-xl mb-4">👥 Crianças por Turma</h2>
        <div className="space-y-3">
          {Object.entries(TURMAS).map(([key, info]) => {
            const count = porTurma.find((t) => t.turma === key)?._count?._all ?? 0
            const pct   = totalCriancas > 0 ? (count / totalCriancas) * 100 : 0
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-8 text-xl">{info.emoji}</span>
                <span className="w-32 text-sm font-bold text-gray-600 font-nunito truncate">
                  {info.label.split(' (')[0]}
                </span>
                <div className="flex-1 bg-[#f0e6d6] rounded-full h-7 overflow-hidden border border-[#e0d0bc]">
                  {count > 0 && (
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-3 transition-all"
                      style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: info.hex }}
                    >
                      <span className="text-white text-xs font-bold font-nunito">{count}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
