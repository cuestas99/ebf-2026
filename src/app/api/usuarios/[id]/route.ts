import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (session?.perfil !== 'ADMIN') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  if (session.id === Number(params.id)) {
    return NextResponse.json({ error: 'Não é possível excluir sua própria conta' }, { status: 400 })
  }
  await prisma.usuario.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
