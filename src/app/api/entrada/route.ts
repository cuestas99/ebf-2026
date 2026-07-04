import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Rota pública — usada pelo quiosque de auto-atendimento (/entrada)
// Busca somente por número de WhatsApp (sem expor outros dados)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get('whatsapp') || ''
  const nums = raw.replace(/\D/g, '')

  if (nums.length < 8) {
    return NextResponse.json([])
  }

  // Busca por dígitos finais (últimos 8) para compatibilizar
  // números salvos com ou sem formatação
  const sufixo = nums.slice(-8)

  const criancas = await prisma.crianca.findMany({
    where: {
      OR: [
        { whatsapp: { contains: nums } },
        { whatsapp: { contains: sufixo } },
        { outroContato: { contains: nums } },
        { outroContato: { contains: sufixo } },
      ],
    },
    select: {
      id: true,
      nome: true,
      idade: true,
      turma: true,
      nomePai: true,
      nomeMae: true,
      restricaoAlimentar: true,
      qualRestricao: true,
      checkins: { select: { id: true, dia: true } },
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(criancas)
}
