import { TURMAS, TurmaKey } from '@/lib/turmas'

export default function TurmaBadge({ turma, comPulseira = true }: { turma: string; comPulseira?: boolean }) {
  const t = TURMAS[turma as TurmaKey]
  if (!t) return <span className="badge bg-gray-100 text-gray-500">{turma}</span>
  return (
    <span className={`badge ${t.corClaro} ${t.texto} inline-flex items-center gap-1.5`}>
      {comPulseira && (
        <span
          className="w-3 h-3 rounded-full border border-white/70 shrink-0"
          style={{ backgroundColor: t.hex }}
          title={`Pulseira ${t.pulseira}`}
        />
      )}
      {t.emoji} {t.label}
    </span>
  )
}
