'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

type Usuario = { nome: string; perfil: string }
const ROTAS_SEM_NAVBAR = ['/entrada', '/login', '/setup', '/certificado']

export default function NavbarCondicional({ usuario }: { usuario?: Usuario }) {
  const pathname = usePathname()
  if (ROTAS_SEM_NAVBAR.some((r) => pathname.startsWith(r))) return null
  return <Navbar usuario={usuario} />
}
