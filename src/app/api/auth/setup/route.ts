export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const count = await prisma.usuario.count()
  return NextResponse.json({ configurado: count > 0 })
}

export async function POST(req: NextRequest) {
  const count = await prisma.usuario.count()
  if (count > 0) {
    return NextResponse.json({ error: 'Sistema já possui usuários cadastrados' }, { status: 403 })
  }

  const { nome, email, senha } = await req.json()

  if (!nome || !email || !senha) {
    return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
  }

  if (senha.length < 6) {
    return NextResponse.json({ error: 'Senha deve ter no mínimo 6 caracteres' }, { status: 400 })
  }

  const hash = await bcrypt.hash(senha, 12)
  await prisma.usuario.create({ data: { nome, email, senha: hash, perfil: 'ADMIN' } })

  return NextResponse.json({ ok: true })
}