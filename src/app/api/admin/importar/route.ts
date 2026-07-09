export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { turmaParaIdade } from '@/lib/turmas'
import { getSession } from '@/lib/auth'
import { lerPlanilha, chaveNome } from '@/lib/planilha'

async function exigirAdmin() {
  const session = await getSession()
  return session && session.perfil === 'ADMIN'
}

/** Conferência: compara planilha × banco sem alterar nada. */
export async function GET() {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const totalAtual = await prisma.crianca.count()

  try {
    const { linhas, totalLinhas, duplicadasNaPlanilha } = await lerPlanilha()
    const noBanco = await prisma.crianca.findMany({ select: { nome: true } })
    const chavesBanco = new Set(noBanco.map((c) => chaveNome(c.nome)))
    const chavesPlanilha = new Set(linhas.map((l) => l.chave))

    const faltando = linhas.filter((l) => !chavesBanco.has(l.chave)).map((l) => ({ nome: l.nome, idade: l.idade }))
    const soNoBanco = noBanco
      .filter((c) => !chavesPlanilha.has(chaveNome(c.nome)))
      .map((c) => c.nome)

    return NextResponse.json({
      totalAtual,
      planilhaLinhas: totalLinhas,
      planilhaUnicos: linhas.length,
      duplicadasNaPlanilha,
      faltando,
      soNoBanco,
      sincronizado: faltando.length === 0,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return NextResponse.json({ totalAtual, erroPlanilha: String(e) }, { status: 200 })
  }
}

/** Importa somente as crianças da planilha que ainda não existem no banco. */
export async function POST() {
  if (!(await exigirAdmin())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  let planilha
  try {
    planilha = await lerPlanilha()
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }

  const { linhas, totalLinhas, duplicadasNaPlanilha } = planilha

  const noBanco = await prisma.crianca.findMany({ select: { nome: true } })
  const chavesBanco = new Set(noBanco.map((c) => chaveNome(c.nome)))

  const novas = linhas.filter((l) => !chavesBanco.has(l.chave))

  let importados = 0
  const erros: string[] = []

  for (const l of novas) {
    try {
      await prisma.crianca.create({
        data: {
          nome: l.nome,
          idade: l.idade,
          dataNascimento: l.dataNascimento,
          turma: turmaParaIdade(l.idade),
          rua: l.endereco,
          numero: '-',
          complemento: null,
          bairro: '-',
          cidade: 'Silva Jardim',
          nomePai: l.nomePai,
          nomeMae: l.nomeMae,
          whatsapp: l.whatsapp,
          outroContato: l.outroContato,
          comoSoube: l.comoSoube,
          pertenceIgreja: l.pertenceIgreja,
          qualIgreja: l.qualIgreja,
          restricaoAlimentar: l.restricaoAlimentar,
          qualRestricao: l.qualRestricao,
          aceitouTermo1: true,
          aceitouTermo2: true,
          aceitouTermo3: true,
        },
      })
      importados++
    } catch (e) {
      erros.push(`${l.nome}: ${String(e).slice(0, 100)}`)
    }
  }

  const totalFinal = await prisma.crianca.count()

  return NextResponse.json({
    importados,
    jaExistiam: linhas.length - novas.length,
    duplicadasNaPlanilha,
    planilhaLinhas: totalLinhas,
    planilhaUnicos: linhas.length,
    totalFinal,
    erros,
  })
}
