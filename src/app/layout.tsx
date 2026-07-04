export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { Fredoka, Nunito } from 'next/font/google'
import './globals.css'
import NavbarCondicional from '@/components/NavbarCondicional'
import MainCondicional from '@/components/MainCondicional'
import { getSession } from '@/lib/auth'

const fredoka = Fredoka({ weight: '400', subsets: ['latin'], variable: '--font-fredoka' })
const nunito  = Nunito({ subsets: ['latin'], variable: '--font-nunito' })

export const metadata: Metadata = {
  title: 'EBF 2026 - Escola Bíblica de Férias',
  description: 'Sistema de cadastro e check-in da Escola Bíblica de Férias',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const usuario = session ? { nome: session.nome, perfil: session.perfil } : undefined

  return (
    <html lang="pt-BR">
      <body className={`${fredoka.variable} ${nunito.variable} font-nunito`}>
        <NavbarCondicional usuario={usuario} />
        <MainCondicional>
          {children}
        </MainCondicional>
      </body>
    </html>
  )
}
