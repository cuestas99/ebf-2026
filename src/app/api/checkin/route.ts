import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  const { criancaId, dia } = await req.json()

  if (!criancaId || !dia) {
    return NextResponse.json({ error: 'criancaId e dia são obrigatórios' }, { status: 400 })
  }

  const existente = await prisma.checkIn.findUnique({
    where: { criancaId_dia: { criancaId: Number(criancaId), dia: Number(dia) } },
  })

  if (existente) {
    return NextResponse.json({ error: 'Check-in já realizado para este dia', checkin: existente }, { status: 409 })
  }

  const checkin = await prisma.checkIn.create({
    data: { criancaId: Number(criancaId), dia: Number(dia) },
    include: { crianca: true },
  })

  return NextResponse.json(checkin, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { criancaId, dia } = await req.json()

  await prisma.checkIn.delete({
    where: { criancaId_dia: { criancaId: Number(criancaId), dia: Number(dia) } },
  })

  return NextResponse.json({ ok: true })
}
