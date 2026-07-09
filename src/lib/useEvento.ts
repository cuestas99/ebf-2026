'use client'
import { useState, useEffect } from 'react'

export type EventoInfo = {
  ativo: boolean
  dia: number | null
  nome: string | null
  dataHoje: string
  faltamDias: number
  encerrado: boolean
  totalDias: number
  inicioLabel: string
  fimLabel: string
}

/**
 * Busca o dia oficial do evento no servidor.
 * Nunca usar o relógio do dispositivo — o tablet do quiosque pode estar errado.
 */
export function useEvento() {
  const [evento, setEvento] = useState<EventoInfo | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let vivo = true
    function buscar() {
      fetch('/api/evento', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (vivo && d) setEvento(d) })
        .catch(() => {})
        .finally(() => { if (vivo) setCarregando(false) })
    }
    buscar()
    // Revalida a cada 5 min — cobre a virada de dia num quiosque que fica aberto
    const t = setInterval(buscar, 5 * 60 * 1000)
    return () => { vivo = false; clearInterval(t) }
  }, [])

  return { evento, carregando }
}
