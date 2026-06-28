'use client'
import { useEffect, useState } from 'react'

const CORES = ['#8B3FBE', '#F5C518', '#EC4899', '#22C55E', '#3B82F6', '#F97316']
const FORMAS = ['rounded-sm', 'rounded-full', 'rounded-none']

type Particula = {
  id: number; left: number; color: string; shape: string
  delay: number; duration: number; size: number; rotation: number
}

export default function Confetti({ ativo }: { ativo: boolean }) {
  const [particulas, setParticulas] = useState<Particula[]>([])

  useEffect(() => {
    if (!ativo) { setParticulas([]); return }

    const novas = Array.from({ length: 36 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CORES[i % CORES.length],
      shape: FORMAS[i % FORMAS.length],
      delay: Math.random() * 0.4,
      duration: 0.9 + Math.random() * 0.7,
      size: 8 + Math.floor(Math.random() * 8),
      rotation: Math.random() * 360,
    }))
    setParticulas(novas)
  }, [ativo])

  if (!ativo || particulas.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particulas.map((p) => (
        <div
          key={p.id}
          className={`absolute ${p.shape} animate-confetti-fall`}
          style={{
            left: `${p.left}%`,
            top: '-12px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
