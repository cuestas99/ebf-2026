import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { turmaParaIdade } from '@/lib/turmas'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const busca     = searchParams.get('busca')     || ''
  const turma     = searchParams.get('turma')     || ''
  const whatsapp  = searchParams.get('whatsapp')  || ''

  const criancas = await prisma.crianca.findMany({
    where: {
      ...(busca     && { nome:      { contains: busca } }),
      ...(turma     && { turma }),
      ...(whatsapp  && { whatsapp:  { contains: whatsapp.replace(/\D/g, '') } }),
    },
    include: { checkins: true },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(criancas)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const {
    nome, idade, dataNascimento,
    rua, numero, complemento, bairro, cidade,
    nomePai, nomeMae, whatsapp, outroContato,
    autorizadoNome1, autorizadoParentesco1,
    autorizadoNome2, autorizadoParentesco2,
    comoSoube, pertenceIgreja, qualIgreja,
    restricaoAlimentar, qualRestricao,
    aceitouTermo1, aceitouTermo2, aceitouTermo3,
  } = body

  const obrigatorios = { nome, idade, dataNascimento, rua, numero, bairro, cidade, nomePai, nomeMae, whatsapp, outroContato }
  for (const [campo, val] of Object.entries(obrigatorios)) {
    if (val === undefined || val === null || val === '') {
      return NextResponse.json({ error: `Campo obrigatório: ${campo}` }, { status: 400 })
    }
  }

  if (!aceitouTermo1 || !aceitouTermo2 || !aceitouTermo3) {
    return NextResponse.json({ error: 'Todos os termos devem ser aceitos' }, { status: 400 })
  }

  if (restricaoAlimentar && !qualRestricao?.trim()) {
    return NextResponse.json({ error: 'Informe a restrição alimentar' }, { status: 400 })
  }

  const turma = turmaParaIdade(Number(idade))

  const crianca = await prisma.crianca.create({
    data: {
      nome: nome.trim(),
      idade: Number(idade),
      dataNascimento: new Date(dataNascimento),
      turma,
      rua: rua.trim(),
      numero: numero.trim(),
      complemento: complemento?.trim() || null,
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      nomePai: nomePai.trim(),
      nomeMae: nomeMae.trim(),
      whatsapp: whatsapp.trim(),
      outroContato: outroContato.trim(),
      autorizadoNome1: autorizadoNome1?.trim() || null,
      autorizadoParentesco1: autorizadoNome1?.trim() ? autorizadoParentesco1?.trim() || null : null,
      autorizadoNome2: autorizadoNome2?.trim() || null,
      autorizadoParentesco2: autorizadoNome2?.trim() ? autorizadoParentesco2?.trim() || null : null,
      comoSoube: comoSoube || null,
      pertenceIgreja: Boolean(pertenceIgreja),
      qualIgreja: pertenceIgreja ? qualIgreja?.trim() || null : null,
      restricaoAlimentar: Boolean(restricaoAlimentar),
      qualRestricao: restricaoAlimentar ? qualRestricao?.trim() || null : null,
      aceitouTermo1: Boolean(aceitouTermo1),
      aceitouTermo2: Boolean(aceitouTermo2),
      aceitouTermo3: Boolean(aceitouTermo3),
    },
  })

  return NextResponse.json(crianca, { status: 201 })
}
