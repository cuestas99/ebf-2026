import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SetupForm from './SetupForm'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  const count = await prisma.usuario.count()
  if (count > 0) redirect('/login')

  return (
    <div className="min-h-screen bg-fundo flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="UCP Silva Jardim" width={160} height={80} className="object-contain" />
          </div>
          <h1 className="font-fredoka text-3xl text-roxo">Configuração Inicial</h1>
          <p className="text-gray-500 font-nunito text-sm mt-1">Crie a conta de administrador</p>
        </div>
        <SetupForm />
      </div>
    </div>
  )
}
