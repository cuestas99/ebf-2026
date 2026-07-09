// ─── CONFIGURE AQUI AS DATAS DA EBF ───────────────────────────
// Uma data por dia do evento, na ordem. Formato YYYY-MM-DD.
export const DATAS_EBF = [
  '2026-07-13', // Dia 1 - Segunda
  '2026-07-14', // Dia 2 - Terça
  '2026-07-15', // Dia 3 - Quarta
  '2026-07-16', // Dia 4 - Quinta
  '2026-07-17', // Dia 5 - Sexta
] as const

export const TIMEZONE = 'America/Sao_Paulo'
// ───────────────────────────────────────────────────────────────

export const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

export const TOTAL_DIAS = DATAS_EBF.length

/**
 * Data de "hoje" no fuso de Brasília, como YYYY-MM-DD.
 * Importante: o servidor (Vercel) roda em UTC. Sem forçar o fuso,
 * a partir das 21h de Brasília o servidor já viraria o dia.
 */
export function hojeISO(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora)
}

function diasEntre(isoA: string, isoB: string): number {
  const [ay, am, ad] = isoA.split('-').map(Number)
  const [by, bm, bd] = isoB.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
}

export type DiaEvento = { dia: number; nome: string; data: string }

/** Retorna o dia do evento hoje (1..5), ou null se hoje não é dia de EBF. */
export function diaDoEvento(agora: Date = new Date()): DiaEvento | null {
  const hoje = hojeISO(agora)
  const idx = DATAS_EBF.indexOf(hoje as (typeof DATAS_EBF)[number])
  if (idx === -1) return null
  return { dia: idx + 1, nome: DIAS_SEMANA[idx], data: hoje }
}

/** Dias que faltam para o início. Negativo se o evento já começou. */
export function faltamDias(agora: Date = new Date()): number {
  return diasEntre(hojeISO(agora), DATAS_EBF[0])
}

/** true se o evento já terminou. */
export function eventoEncerrado(agora: Date = new Date()): boolean {
  return diasEntre(hojeISO(agora), DATAS_EBF[TOTAL_DIAS - 1]) < 0
}

/** Formata YYYY-MM-DD como DD/MM. */
export function formatarDiaMes(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export const EVENTO_INICIO_LABEL = formatarDiaMes(DATAS_EBF[0])
export const EVENTO_FIM_LABEL    = formatarDiaMes(DATAS_EBF[TOTAL_DIAS - 1])

/** Data de um dia específico do evento (1..5), ou null. */
export function dataDoDia(dia: number): string | null {
  return DATAS_EBF[dia - 1] ?? null
}
