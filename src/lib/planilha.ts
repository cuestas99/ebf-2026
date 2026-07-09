export const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1brslI5q2VU0wA4Nju_jRJ3t3cZUx5aTfKK3mA9zK37w/export?format=csv&gid=661538264'

export function parseCSV(text: string): string[][] {
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
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else if (ch !== '\r') { field += ch }
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((f) => f.trim() !== ''))
}

export function parseDate(str: string): Date {
  const s = (str || '').trim()
  if (!s) return new Date('2015-01-01')
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`)
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date('2015-01-01') : d
}

/** Normaliza nome para comparação: sem acento, sem espaço duplo, minúsculo. */
export function chaveNome(nome: string): string {
  return nome
    .normalize('NFD')
    .split('')
    .filter((ch) => {
      const cp = ch.charCodeAt(0)
      return cp < 0x0300 || cp > 0x036f
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

export type LinhaPlanilha = {
  nome: string
  idade: number
  dataNascimento: Date
  endereco: string
  nomePai: string
  nomeMae: string
  whatsapp: string
  outroContato: string
  comoSoube: string | null
  pertenceIgreja: boolean
  qualIgreja: string | null
  restricaoAlimentar: boolean
  qualRestricao: string | null
  chave: string
}

/** Baixa a planilha e devolve as linhas já normalizadas (sem duplicatas internas). */
export async function lerPlanilha(): Promise<{
  linhas: LinhaPlanilha[]
  totalLinhas: number
  duplicadasNaPlanilha: string[]
}> {
  const res = await fetch(SHEET_URL, { redirect: 'follow', cache: 'no-store' })
  if (!res.ok) throw new Error('Não foi possível acessar a planilha')

  const rows = parseCSV(await res.text())
  if (rows.length < 2) throw new Error('Planilha vazia ou inacessível')

  const [headers, ...dataRows] = rows
  const col = (termo: string) => headers.findIndex((h) => h.toLowerCase().includes(termo.toLowerCase()))

  const iNome       = col('criança')
  const iIdade      = col('idade')
  const iDtNasc     = col('nascimento')
  const iEndereco   = col('endere')
  const iPai        = col('pai')
  const iMae        = col('mãe')
  const iWpp        = col('whatsapp')
  const iOutro      = col('outro')
  const iComoSoube  = col('sabendo')
  const iIgrejaQ    = col('pertence')
  const iIgrejaNome = col('qual igreja')
  const iRestricaoQ = col('restrição alimentar')
  const iRestricaoR = col('qual a restrição')

  const vistos = new Set<string>()
  const duplicadasNaPlanilha: string[] = []
  const linhas: LinhaPlanilha[] = []
  let totalLinhas = 0

  for (const row of dataRows) {
    const nome = row[iNome]?.trim()
    if (!nome) continue
    totalLinhas++

    const chave = chaveNome(nome)
    if (vistos.has(chave)) { duplicadasNaPlanilha.push(nome); continue }
    vistos.add(chave)

    const wpp      = (row[iWpp]?.trim()   || '').replace(/\D/g, '')
    const outroRaw = (row[iOutro]?.trim() || '').replace(/\D/g, '')
    const igrejaResp    = row[iIgrejaQ]?.trim()     || ''
    const igrejaNome    = row[iIgrejaNome]?.trim()  || ''
    const restricaoResp = row[iRestricaoQ]?.trim()  || ''
    const restricaoDesc = row[iRestricaoR]?.trim()  || ''

    const pertenceIgreja     = igrejaResp.toLowerCase().includes('sim') || igrejaNome.length > 0
    const restricaoAlimentar = restricaoResp.toLowerCase().startsWith('sim')

    linhas.push({
      nome,
      chave,
      idade: parseInt(row[iIdade]?.trim() || '0') || 0,
      dataNascimento: parseDate(row[iDtNasc] || ''),
      endereco: row[iEndereco]?.trim() || 'Não informado',
      nomePai: row[iPai]?.trim() || 'Não informado',
      nomeMae: row[iMae]?.trim() || 'Não informado',
      whatsapp: wpp || '00000000000',
      outroContato: outroRaw || wpp || '00000000000',
      comoSoube: row[iComoSoube]?.trim() || null,
      pertenceIgreja,
      qualIgreja: igrejaNome || (pertenceIgreja ? 'IPB Silva Jardim' : null),
      restricaoAlimentar,
      qualRestricao: restricaoAlimentar ? (restricaoDesc || 'Verificar') : null,
    })
  }

  return { linhas, totalLinhas, duplicadasNaPlanilha }
}
