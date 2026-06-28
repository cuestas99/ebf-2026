'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

type Usuario = { nome: string; perfil: string }

const LINKS_ADMIN = [
  { href: '/',          label: '🏠 Início' },
  { href: '/cadastro',  label: '✏️ Cadastro' },
  { href: '/checkin',   label: '✅ Check-in' },
  { href: '/criancas',  label: '👧 Crianças' },
  { href: '/relatorio', label: '📊 Relatório' },
  { href: '/usuarios',  label: '👤 Usuários' },
]

const LINKS_RECEPCIONIST = [
  { href: '/checkin', label: '✅ Check-in' },
]

export default function Navbar({ usuario }: { usuario?: Usuario }) {
  const pathname = usePathname()
  const router = useRouter()
  const links = usuario?.perfil === 'RECEPCIONIST' ? LINKS_RECEPCIONIST : LINKS_ADMIN

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-roxo shadow-[0_4px_0px_#5a2680]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">

          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative h-10 w-28 hidden sm:block">
              <Image src="/logo.png" alt="UCP Silva Jardim" fill className="object-contain" priority />
            </div>
            <span className="font-fredoka text-white text-xl tracking-wide sm:hidden">EBF 2026</span>
          </Link>

          <div className="flex items-center gap-1 flex-wrap justify-end">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-2 rounded-btn font-fredoka text-sm transition-all ${
                  pathname === link.href
                    ? 'bg-amarelo text-gray-900 shadow-cartoon-amarelo -translate-y-0.5'
                    : 'text-white hover:bg-white/20'
                }`}>
                {link.label}
              </Link>
            ))}

            {usuario && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/30">
                <div className="text-right hidden sm:block">
                  <p className="font-fredoka text-white text-sm leading-none">{usuario.nome.split(' ')[0]}</p>
                  <p className="text-white/60 text-xs font-nunito leading-none mt-0.5">
                    {usuario.perfil === 'ADMIN' ? 'Admin' : 'Recepcionista'}
                  </p>
                </div>
                <button onClick={logout}
                  className="px-3 py-1.5 rounded-btn font-fredoka text-xs bg-white/10 text-white border border-white/30 hover:bg-white/20 transition-all">
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
