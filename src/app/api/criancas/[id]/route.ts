import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { turmaParaIdade } from '@/lib/turmas'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const crianca = await prisma.crianca.findUnique({
    where: { id: Number(params.id) },
    include: { checkins: true },
  })
  if (!crianca) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(crianca)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const {
    nome, idade, dataNascimento,
    rua, numero, complemento, bairro, cidade,
    nomePai, nomeMae, whatsapp, outroContato,
    comoSoube, pertenceIgreja, qualIgreja,
    restricaoAlimentar, qualRestricao,
  } = body

  const crianca = await prisma.crianca.update({
    where: { id: Number(params.id) },
    data: {
      ...(nome !== undefined && { nome: nome.trim() }),
      ...(idade !== undefined && { idade: Number(idade), turma: turmaParaIdade(Number(idade)) }),
      ...(dataNascimento !== undefined && { dataNascimento: new Date(dataNascimento) }),
      ...(rua !== undefined && { rua: rua.trim() }),
      ...(numero !== undefined && { numero: numero.trim() }),
      ...(complemento !== undefined && { complemento: complemento?.trim() || null }),
      ...(bairro !== undefined && { bairro: bairro.trim() }),
      ...(cidade !== undefined && { cidade: cidade.trim() }),
      ...(nomePai !== undefined && { nomePai: nomePai.trim() }),
      ...(nomeMae !== undefined && { nomeMae: nomeMae.trim() }),
      ...(whatsapp !== undefined && { whatsapp: whatsapp.trim() }),
      ...(outroContato !== undefined && { outroContato: outroContato.trim() }),
      ...(comoSoube !== undefined && { comoSoube: comoSoube || null }),
      ...(pertenceIgreja !== undefined && { pertenceIgreja: Boolean(pertenceIgreja) }),
      ...(qualIgreja !== undefined && { qualIgreja: qualIgreja?.trim() || null }),
      ...(restricaoAlimentar !== undefined && { restricaoAlimentar: Boolean(restricaoAlimentar) }),
      ...(qualRestricao !== undefined && { qualRestricao: qualRestricao?.trim() || null }),
    },
  })

  return NextResponse.json(crianca)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.crianca.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
