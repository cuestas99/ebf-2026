import { TURMAS, TurmaKey } from '@/lib/turmas'

export default function TurmaBadge({ turma }: { turma: string }) {
  const t = TURMAS[turma as TurmaKey]
  if (!t) return <span className="badge bg-gray-100 text-gray-500">{turma}</span>
  return (
    <span className={`badge ${t.corClaro} ${t.texto}`}>
      {t.emoji} {t.label}
    </span>
  )
}
