'use client'
import { usePathname } from 'next/navigation'

const SEM_PADDING = ['/entrada', '/login', '/setup', '/certificado']

export default function MainCondicional({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const limpo = SEM_PADDING.some((r) => pathname.startsWith(r))
  return (
    <main className={limpo ? '' : 'max-w-6xl mx-auto px-4 py-6'}>
      {children}
    </main>
  )
}
