export const TURMAS = {
  BEBES: {
    label: 'Bebês/Maternal (2-4 anos)',
    pulseira: 'Amarela', pulseiraEmoji: '🟡',
    cor: 'bg-amber-400', corClaro: 'bg-amber-100', texto: 'text-amber-800', borda: 'border-amber-400',
    emoji: '👶', hex: '#F5C518',
  },
  JARDIM: {
    label: 'Jardim (5-6 anos)',
    pulseira: 'Verde', pulseiraEmoji: '🟢',
    cor: 'bg-green-500', corClaro: 'bg-green-100', texto: 'text-green-700', borda: 'border-green-500',
    emoji: '🌱', hex: '#22c55e',
  },
  JUNIORES: {
    label: 'Juniores (7-8 anos)',
    pulseira: 'Azul', pulseiraEmoji: '🔵',
    cor: 'bg-blue-500', corClaro: 'bg-blue-100', texto: 'text-blue-700', borda: 'border-blue-500',
    emoji: '⭐', hex: '#3b82f6',
  },
  PRE_ADOLESCENTES: {
    label: 'Pré-Adolescentes (9-12 anos)',
    pulseira: 'Roxa', pulseiraEmoji: '🟣',
    cor: 'bg-purple-500', corClaro: 'bg-purple-100', texto: 'text-purple-700', borda: 'border-purple-500',
    emoji: '🚀', hex: '#8B3FBE',
  },
}

export type TurmaKey = keyof typeof TURMAS

export function turmaParaIdade(idade: number): string {
  if (idade <= 4) return 'BEBES'
  if (idade <= 6) return 'JARDIM'
  if (idade <= 8) return 'JUNIORES'
  return 'PRE_ADOLESCENTES'
}

export function pulseiraDaTurma(turma: string) {
  const t = TURMAS[turma as TurmaKey]
  return t ? { nome: t.pulseira, emoji: t.pulseiraEmoji, hex: t.hex } : null
}

export const DIAS = [
  { num: 1, label: 'Dia 1 - Segunda' },
  { num: 2, label: 'Dia 2 - Terça' },
  { num: 3, label: 'Dia 3 - Quarta' },
  { num: 4, label: 'Dia 4 - Quinta' },
  { num: 5, label: 'Dia 5 - Sexta' },
]

export const COMO_SOUBE_OPCOES = [
  'Sou membro da IPB Silva Jardim',
  'Um amigo(a) me convidou',
  'Vi a faixa no portão da igreja',
  'Recebi um convite na rua',
]
