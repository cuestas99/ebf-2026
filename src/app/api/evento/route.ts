export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import {
  diaDoEvento, faltamDias, eventoEncerrado,
  EVENTO_INICIO_LABEL, EVENTO_FIM_LABEL, TOTAL_DIAS, hojeISO, formatarDiaMes,
} from '@/lib/evento'

/**
 * Rota pública: informa qual é o dia oficial do evento segundo o servidor.
 * O quiosque e a recepção usam isso em vez do relógio do dispositivo.
 */
export async function GET() {
  const hoje = diaDoEvento()

  return NextResponse.json({
    ativo: hoje !== null,
    dia: hoje?.dia ?? null,
    nome: hoje?.nome ?? null,
    dataHoje: formatarDiaMes(hojeISO()),
    faltamDias: faltamDias(),
    encerrado: eventoEncerrado(),
    totalDias: TOTAL_DIAS,
    inicioLabel: EVENTO_INICIO_LABEL,
    fimLabel: EVENTO_FIM_LABEL,
  }, { headers: { 'Cache-Control': 'no-store' } })
}
