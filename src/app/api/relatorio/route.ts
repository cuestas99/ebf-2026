export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TURMAS, TurmaKey } from '@/lib/turmas'

export async function GET() {
  const criancas = await prisma.crianca.findMany({
    include: { checkins: true },
    orderBy: { nome: 'asc' },
  })

  const totalCriancas = criancas.length
  const totalCheckins = criancas.reduce((acc, c) => acc + c.checkins.length, 0)

  // Frequência é calculada sobre os dias que JÁ aconteceram (tiveram ao menos
  // um check-in), não sobre os 5 dias totais. Assim, no Dia 1 a frequência
  // reflete a presença real do dia, e não fica artificialmente baixa.
  const diasComCheckin = [1, 2, 3, 4, 5].filter((dia) =>
    criancas.some((c) => c.checkins.some((ch) => ch.dia === dia))
  ).length
  const diasBase = Math.max(diasComCheckin, 1)

  const frequenciaGeral = totalCriancas > 0
    ? Math.round((totalCheckins / (totalCriancas * diasBase)) * 100)
    : 0

  const porTurma = Object.keys(TURMAS).map((turma) => {
    const kids = criancas.filter((c) => c.turma === turma)
    const totalDias = kids.reduce((acc, k) => acc + k.checkins.length, 0)
    const maxPossivel = kids.length * diasBase

    return {
      turma,
      label: TURMAS[turma as TurmaKey].label,
      emoji: TURMAS[turma as TurmaKey].emoji,
      pulseira: TURMAS[turma as TurmaKey].pulseira,
      total: kids.length,
      totalDias,
      percentual: maxPossivel > 0 ? Math.round((totalDias / maxPossivel) * 100) : 0,
      porDia: [1, 2, 3, 4, 5].map((dia) => ({
        dia,
        presentes: kids.filter((k) => k.checkins.some((c) => c.dia === dia)).length,
      })),
    }
  })

  const porDia = [1, 2, 3, 4, 5].map((dia) => ({
    dia,
    presentes: criancas.filter((c) => c.checkins.some((ch) => ch.dia === dia)).length,
    percentual: totalCriancas > 0
      ? Math.round((criancas.filter((c) => c.checkins.some((ch) => ch.dia === dia)).length / totalCriancas) * 100)
      : 0,
  }))

  // Distribuição por idade (2 a 12 anos)
  const todasIdades = criancas.map(c => c.idade).filter(i => i >= 2 && i <= 12)
  const minIdade = todasIdades.length ? Math.min(...todasIdades) : 2
  const maxIdade = todasIdades.length ? Math.max(...todasIdades) : 12
  const porIdade = Array.from({ length: maxIdade - minIdade + 1 }, (_, i) => {
    const idade = minIdade + i
    const kids  = criancas.filter(c => c.idade === idade)
    return {
      idade,
      total: kids.length,
      percentual: totalCriancas > 0 ? Math.round((kids.length / totalCriancas) * 100) : 0,
    }
  })

  const tabela = criancas.map((c) => ({
    id: c.id,
    nome: c.nome,
    idade: c.idade,
    turma: c.turma,
    turmaLabel: TURMAS[c.turma as TurmaKey]?.label || c.turma,
    pulseira: TURMAS[c.turma as TurmaKey]?.pulseira || '—',
    rua: c.rua,
    numero: c.numero,
    complemento: c.complemento,
    bairro: c.bairro,
    cidade: c.cidade,
    nomePai: c.nomePai,
    nomeMae: c.nomeMae,
    whatsapp: c.whatsapp,
    outroContato: c.outroContato,
    comoSoube: c.comoSoube,
    pertenceIgreja: c.pertenceIgreja,
    qualIgreja: c.qualIgreja,
    restricaoAlimentar: c.restricaoAlimentar,
    qualRestricao: c.qualRestricao,
    diasPresente: c.checkins.map((ch) => ch.dia).sort(),
    totalDias: c.checkins.length,
  }))

  return NextResponse.json({ totalCriancas, totalCheckins, frequenciaGeral, diasComCheckin, porTurma, porDia, porIdade, tabela }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}