import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ebf2026-ipb-silva-jardim-secret'
)

const PUBLICO = ['/login', '/setup', '/entrada', '/api/auth/']
const SO_RECEPCIONIST = ['/checkin', '/api/checkin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    PUBLICO.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/logo') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('ebf_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, SECRET)

    if (payload.perfil === 'RECEPCIONIST') {
      const permitido = SO_RECEPCIONIST.some((p) => pathname.startsWith(p))
      if (!permitido) {
        return NextResponse.redirect(new URL('/checkin', req.url))
      }
    }

    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('ebf_token')
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
