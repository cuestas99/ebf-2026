import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { turmaParaIdade } from '@/lib/turmas'
import { getSession } from '@/lib/auth'

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1brslI5q2VU0wA4Nju_jRJ3t3cZUx5aTfKK3mA9zK37w/export?format=csv&gid=661538264'

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++ }
      else if (ch === '"') { inQuotes = false }
      else { field += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { row.push(field); field = '' }
      else if (ch === '\n') { row.push(field); if (row.some(f => f)) rows.push(row); row = []; field = '' }
      else if (ch !== '\r') { field += ch }
    }
  }
  if (field || row.length > 1) { row.push(field); if (row.some(f => f)) rows.push(row) }
  return rows
}

function parseDate(str: string): Date {
  const s = str.trim()
  if (!s) return new Date('2015-01-01')
  // DD/MM/YYYY
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return new Date(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`)
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date('2015-01-01') : d
}

export async function GET() {
  const session = await getSession()
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }
  const total = await prisma.crianca.count()
  return NextResponse.json({ totalAtual: total })
}

export async function POST() {
  const session = await getSession()
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const res = await fetch(SHEET_URL, { redirect: 'follow' })
  if (!res.ok) return NextResponse.json({ error: 'Erro ao acessar planilha' }, { status: 500 })

  const text = await res.text()
  const rows = parseCSV(text)
  if (rows.length < 2) return NextResponse.json({ error: 'Planilha vazia ou inacessível' }, { status: 400 })

  const [headers, ...dataRows] = rows

  // Mapeamento de colunas pelo cabeçalho
  const col = (termo: string) => headers.findIndex(h => h.toLowerCase().includes(termo.toLowerCase()))

  const iNome      = col('criança')
  const iIdade     = col('idade')
  const iDtNasc    = col('nascimento')
  const iEndereco  = col('endere')
  const iPai       = col('pai')
  const iMae       = col('mãe')
  const iWpp       = col('whatsapp')
  const iOutro     = col('outro')
  const iComoSoube = col('sabendo')
  const iIgrejaQ   = col('pertence') // "Se não é membro..."
  const iIgrejaNome= col('qual igreja')
  const iRestricaoQ= col('restrição alimentar')
  const iRestricaoR= col('qual a restrição')

  let importados = 0
  let ignorados  = 0
  const erros: string[] = []

  for (const row of dataRows) {
    const nome = row[iNome]?.trim()
    if (!nome) { ignorados++; continue }

    // Pula duplicatas pelo nome exato
    const existe = await prisma.crianca.findFirst({ where: { nome } })
    if (existe) { ignorados++; continue }

    try {
      const idade        = parseInt(row[iIdade]?.trim() || '0') || 0
      const dataNasc     = parseDate(row[iDtNasc] || '')
      const endereco     = row[iEndereco]?.trim() || 'Não informado'
      const nomePai      = row[iPai]?.trim()  || 'Não informado'
      const nomeMae      = row[iMae]?.trim()  || 'Não informado'
      const wpp          = (row[iWpp]?.trim()   || '').replace(/\D/g, '')
      const outroRaw     = (row[iOutro]?.trim() || '').replace(/\D/g, '')
      const outroContato = outroRaw || wpp || '00000000000'
      const comoSoube    = row[iComoSoube]?.trim() || null
      const igrejaResp   = row[iIgrejaQ]?.trim()  || ''
      const igrejaNome   = row[iIgrejaNome]?.trim() || ''
      const restricaoResp= row[iRestricaoQ]?.trim() || ''
      const restricaoDesc= row[iRestricaoR]?.trim() || ''

      const pertenceIgreja    = igrejaResp.toLowerCase().includes('sim') || igrejaNome.length > 0
      const restricaoAlimentar= restricaoResp.toLowerCase().includes('sim')

      await prisma.crianca.create({
        data: {
          nome,
          idade,
          dataNascimento: dataNasc,
          turma: turmaParaIdade(idade),
          rua: endereco,
          numero: '-',
          complemento: null,
          bairro: '-',
          cidade: 'Silva Jardim',
          nomePai,
          nomeMae,
          whatsapp: wpp || '00000000000',
          outroContato,
          comoSoube,
          pertenceIgreja,
          qualIgreja: igrejaNome || (pertenceIgreja ? 'IPB Silva Jardim' : null),
          restricaoAlimentar,
          qualRestricao: restricaoAlimentar ? (restricaoDesc || 'Verificar') : null,
          aceitouTermo1: true,
          aceitouTermo2: true,
          aceitouTermo3: true,
        },
      })
      importados++
    } catch (e) {
      erros.push(`${nome}: ${String(e).slice(0, 80)}`)
    }
  }

  return NextResponse.json({ importados, ignorados, erros, total: dataRows.length })
}
