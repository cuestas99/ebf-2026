import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE, Payload } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json()

  if (!email || !senha) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } })

  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
  }

  const payload: Payload = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil as Payload['perfil'],
  }

  const token = await signToken(payload)
  const res = NextResponse.json({ ok: true, usuario: payload })
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 12,
    sameSite: 'lax',
  })
  return res
}
