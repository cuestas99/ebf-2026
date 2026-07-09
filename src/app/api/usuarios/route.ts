export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (session?.perfil !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nome: true, email: true, perfil: true, criadoEm: true },
    orderBy: { criadoEm: 'asc' },
  })
  return NextResponse.json(usuarios)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (session?.perfil !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { nome, email, senha, perfil } = await req.json()
  if (!nome || !email || !senha || !perfil) {
    return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
  }
  const existe = await prisma.usuario.findUnique({ where: { email } })
  if (existe) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })

  const hash = await bcrypt.hash(senha, 12)
  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: hash, perfil },
    select: { id: true, nome: true, email: true, perfil: true },
  })
  return NextResponse.json(usuario, { status: 201 })
}