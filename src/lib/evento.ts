// ─── CONFIGURE AQUI AS DATAS DA EBF ───────────────────────────
export const EVENTO_INICIO = new Date('2026-07-13') // primeira segunda-feira
export const EVENTO_FIM    = new Date('2026-07-17') // última sexta-feira
// ───────────────────────────────────────────────────────────────

export const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

export function diaDoEvento(): { dia: number; nome: string } | null {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const inicio = new Date(EVENTO_INICIO)
  inicio.setHours(0, 0, 0, 0)
  const diff = Math.round((hoje.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0 || diff > 4) return null
  return { dia: diff + 1, nome: DIAS_SEMANA[diff] }
}

export function faltamDias(): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const inicio = new Date(EVENTO_INICIO)
  inicio.setHours(0, 0, 0, 0)
  return Math.round((inicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}
