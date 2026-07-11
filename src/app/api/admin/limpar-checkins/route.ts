export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// TEMPORÁRIO — limpar check-ins de teste. Remover após o uso.
async function exigirAdmin() {
  const s = await getSession()
  return s && s.perfil === 'ADMIN'
}

// Prévia: quantos check-ins existem hoje
export async function GET() {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }
  const total = await prisma.checkIn.count()
  return NextResponse.json({ total }, { headers: { 'Cache-Control': 'no-store' } })
}

// Apaga TODOS os check-ins. Exige body { confirmar: "APAGAR" }.
export async function POST(req: NextRequest) {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }
  const { confirmar } = await req.json().catch(() => ({}))
  if (confirmar !== 'APAGAR') {
    return NextResponse.json({ error: 'Confirmação inválida' }, { status: 400 })
  }
  const res = await prisma.checkIn.deleteMany({})
  return NextResponse.json({ apagados: res.count })
}
