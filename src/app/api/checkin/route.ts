export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { diaDoEvento, faltamDias, EVENTO_INICIO_LABEL, EVENTO_FIM_LABEL } from '@/lib/evento'

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
  const { criancaId } = await req.json()

  if (!criancaId) {
    return NextResponse.json({ error: 'criancaId é obrigatório' }, { status: 400 })
  }

  // O dia é sempre determinado pelo servidor — nunca pelo cliente.
  // Isso impede check-in antecipado ou retroativo.
  const hoje = diaDoEvento()
  if (!hoje) {
    const faltam = faltamDias()
    const motivo = faltam > 0
      ? `A EBF ainda não começou. O check-in abre no dia ${EVENTO_INICIO_LABEL}.`
      : `A EBF foi encerrada em ${EVENTO_FIM_LABEL}. O check-in está fechado.`
    return NextResponse.json({ error: motivo, foraDoEvento: true }, { status: 403 })
  }

  const dia = hoje.dia

  const existente = await prisma.checkIn.findUnique({
    where: { criancaId_dia: { criancaId: Number(criancaId), dia } },
  })

  if (existente) {
    return NextResponse.json(
      { error: 'Check-in já realizado hoje', checkin: existente },
      { status: 409 },
    )
  }

  const checkin = await prisma.checkIn.create({
    data: { criancaId: Number(criancaId), dia },
    include: { crianca: true },
  })

  return NextResponse.json(checkin, { status: 201 })
}

/** Marca (ou desmarca) a entrega da pulseira do dia de hoje. */
export async function PATCH(req: NextRequest) {
  const { criancaId, entregue } = await req.json()

  if (!criancaId) {
    return NextResponse.json({ error: 'criancaId é obrigatório' }, { status: 400 })
  }

  const hoje = diaDoEvento()
  if (!hoje) {
    return NextResponse.json({ error: 'Fora do período da EBF', foraDoEvento: true }, { status: 403 })
  }

  const entregar = entregue !== false

  const checkin = await prisma.checkIn.update({
    where: { criancaId_dia: { criancaId: Number(criancaId), dia: hoje.dia } },
    data: {
      pulseiraEntregue: entregar,
      pulseiraEntregueEm: entregar ? new Date() : null,
    },
  }).catch(() => null)

  if (!checkin) {
    return NextResponse.json({ error: 'Check-in não encontrado para hoje' }, { status: 404 })
  }

  return NextResponse.json(checkin)
}

export async function DELETE(req: NextRequest) {
  const { criancaId, dia } = await req.json()

  if (!criancaId || !dia) {
    return NextResponse.json({ error: 'criancaId e dia são obrigatórios' }, { status: 400 })
  }

  await prisma.checkIn.delete({
    where: { criancaId_dia: { criancaId: Number(criancaId), dia: Number(dia) } },
  })

  return NextResponse.json({ ok: true })
}
