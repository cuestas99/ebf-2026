export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { diaDoEvento, TOTAL_DIAS } from '@/lib/evento'

/**
 * Rotas de check-in da RECEPÇÃO (autenticadas).
 *
 * Aqui não há trava de dia: a equipe precisa poder lançar ou corrigir
 * a presença de qualquer dia do evento. A trava de "só o dia vigente"
 * vale para o quiosque dos pais, em POST /api/entrada/checkin.
 */

function diaValido(dia: unknown): number | null {
  const n = Number(dia)
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_DIAS ? n : null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dia = searchParams.get('dia')
  const turma = searchParams.get('turma') || ''

  const checkins = await prisma.checkIn.findMany({
    where: {
      ...(dia && { dia: Number(dia) }),
      crianca: turma ? { turma } : undefined,
    },
    include: { crianca: true },
    orderBy: { criadoEm: 'desc' },
  })

  return NextResponse.json(checkins)
}

export async function POST(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const criancaId = Number(body.criancaId)
  if (!criancaId) {
    return NextResponse.json({ error: 'criancaId é obrigatório' }, { status: 400 })
  }

  // Se a recepção não informar o dia, assume o dia corrente do evento.
  const dia = diaValido(body.dia) ?? diaDoEvento()?.dia ?? null
  if (!dia) {
    return NextResponse.json(
      { error: 'Informe o dia do evento (1 a 5).' },
      { status: 400 },
    )
  }

  const existente = await prisma.checkIn.findUnique({
    where: { criancaId_dia: { criancaId, dia } },
  })

  if (existente) {
    return NextResponse.json({ error: `Check-in já realizado no dia ${dia}`, checkin: existente }, { status: 409 })
  }

  const checkin = await prisma.checkIn.create({
    data: { criancaId, dia },
    include: { crianca: true },
  })

  return NextResponse.json(checkin, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const criancaId = Number(body.criancaId)
  const dia = diaValido(body.dia)

  if (!criancaId || !dia) {
    return NextResponse.json({ error: 'criancaId e dia são obrigatórios' }, { status: 400 })
  }

  await prisma.checkIn.delete({
    where: { criancaId_dia: { criancaId, dia } },
  }).catch(() => null)

  return NextResponse.json({ ok: true })
}
