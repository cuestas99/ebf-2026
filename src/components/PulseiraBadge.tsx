import { TURMAS, TurmaKey } from '@/lib/turmas'

export default function PulseiraBadge({ turma, tamanho = 'sm' }: { turma: string; tamanho?: 'sm' | 'lg' }) {
  const t = TURMAS[turma as TurmaKey]
  if (!t) return null

  if (tamanho === 'lg') {
    return (
      <div
        className="rounded-card border-2 p-4 flex items-center gap-3"
        style={{ backgroundColor: `${t.hex}1a`, borderColor: t.hex }}
      >
        <div
          className="w-12 h-12 rounded-full border-4 border-white shadow-md shrink-0"
          style={{ backgroundColor: t.hex }}
        />
        <div>
          <p className="text-xs text-gray-500 font-nunito uppercase tracking-wide">Pulseira</p>
          <p className="font-fredoka text-2xl" style={{ color: t.hex }}>{t.pulseira}</p>
        </div>
      </div>
    )
  }

  return (
    <span className="badge inline-flex items-center gap-1.5" style={{ backgroundColor: `${t.hex}1f`, color: t.hex }}>
      <span className="w-3 h-3 rounded-full border border-white/60 shrink-0" style={{ backgroundColor: t.hex }} />
      Pulseira {t.pulseira}
    </span>
  )
}
