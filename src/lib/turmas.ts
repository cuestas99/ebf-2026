export const TURMAS = {
  BEBES:            { label: 'Bebês/Maternal (2-4 anos)', cor: 'bg-pink-500',   corClaro: 'bg-pink-100',   texto: 'text-pink-700',   borda: 'border-pink-500',   emoji: '👶', hex: '#ec4899' },
  JARDIM:           { label: 'Jardim (5-6 anos)',         cor: 'bg-green-500',  corClaro: 'bg-green-100',  texto: 'text-green-700',  borda: 'border-green-500',  emoji: '🌱', hex: '#22c55e' },
  JUNIORES:         { label: 'Juniores (7-9 anos)',       cor: 'bg-blue-500',   corClaro: 'bg-blue-100',   texto: 'text-blue-700',   borda: 'border-blue-500',   emoji: '⭐', hex: '#3b82f6' },
  PRE_ADOLESCENTES: { label: 'Pré-Adolescentes (10-12)', cor: 'bg-purple-500', corClaro: 'bg-purple-100', texto: 'text-purple-700', borda: 'border-purple-500', emoji: '🚀', hex: '#a855f7' },
}

export type TurmaKey = keyof typeof TURMAS

export function turmaParaIdade(idade: number): string {
  if (idade <= 4) return 'BEBES'
  if (idade <= 6) return 'JARDIM'
  if (idade <= 9) return 'JUNIORES'
  return 'PRE_ADOLESCENTES'
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
