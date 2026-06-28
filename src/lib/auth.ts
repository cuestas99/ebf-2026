import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ebf2026-ipb-silva-jardim-secret'
)

export const COOKIE = 'ebf_token'

export type Perfil = 'ADMIN' | 'RECEPCIONIST'

export type Payload = {
  id: number
  nome: string
  email: string
  perfil: Perfil
}

export async function signToken(payload: Payload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<Payload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as Payload
  } catch {
    return null
  }
}

export async function getSession(): Promise<Payload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
