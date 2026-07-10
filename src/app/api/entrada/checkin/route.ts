export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { diaDoEvento, faltamDias, EVENTO_INICIO_LABEL, EVENTO_FIM_LABEL } from '@/lib/evento'

/**
 * Check-in do quiosque de auto-atendimento (/entrada) — rota PÚBLICA.
 *
 * Aqui a trava é rígida: o dia vem sempre do servidor e só funciona
 * durante os dias da EBF. O pai não pode marcar presença antecipada.
 * A recepção usa POST /api/checkin, que é autenticada e sem essa trava.
 */
export async function POST(req: NextRequest) {
  const { criancaId } = await req.json()

  if (!criancaId) {
    return NextResponse.json({ error: 'criancaId é obrigatório' }, { status: 400 })
  }

  const hoje = diaDoEvento()
  if (!hoje) {
    const motivo = faltamDias() > 0
      ? `A EBF ainda não começou. O check-in abre no dia ${EVENTO_INICIO_LABEL}.`
      : `A EBF foi encerrada em ${EVENTO_FIM_LABEL}. O check-in está fechado.`
    return NextResponse.json({ error: motivo, foraDoEvento: true }, { status: 403 })
  }

  const existente = await prisma.checkIn.findUnique({
    where: { criancaId_dia: { criancaId: Number(criancaId), dia: hoje.dia } },
  })

  if (existente) {
    return NextResponse.json({ error: 'Check-in já realizado hoje', checkin: existente }, { status: 409 })
  }

  const checkin = await prisma.checkIn.create({
    data: { criancaId: Number(criancaId), dia: hoje.dia },
  })

  return NextResponse.json(checkin, { status: 201 })
}
