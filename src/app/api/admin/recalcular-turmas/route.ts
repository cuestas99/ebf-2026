import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { turmaParaIdade, TURMAS, TurmaKey } from '@/lib/turmas'
import { getSession } from '@/lib/auth'

async function calcular() {
  const criancas = await prisma.crianca.findMany({
    select: { id: true, nome: true, idade: true, turma: true },
    orderBy: { nome: 'asc' },
  })
  return criancas
    .map((c) => ({ ...c, turmaCorreta: turmaParaIdade(c.idade) }))
    .filter((c) => c.turma !== c.turmaCorreta)
}

// Prévia: quem seria movido, sem alterar nada
export async function GET() {
  const session = await getSession()
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const divergentes = await calcular()
  return NextResponse.json({
    total: divergentes.length,
    mudancas: divergentes.map((c) => ({
      nome: c.nome,
      idade: c.idade,
      de: TURMAS[c.turma as TurmaKey]?.label ?? c.turma,
      para: TURMAS[c.turmaCorreta as TurmaKey]?.label ?? c.turmaCorreta,
      pulseira: TURMAS[c.turmaCorreta as TurmaKey]?.pulseira ?? '—',
    })),
  }, { headers: { 'Cache-Control': 'no-store' } })
}

// Aplica a correção
export async function POST() {
  const session = await getSession()
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const divergentes = await calcular()

  for (const c of divergentes) {
    await prisma.crianca.update({
      where: { id: c.id },
      data: { turma: c.turmaCorreta },
    })
  }

  return NextResponse.json({ atualizados: divergentes.length })
}
