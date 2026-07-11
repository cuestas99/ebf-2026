export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { TURMAS, TurmaKey } from '@/lib/turmas'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import PrintButton from '@/components/PrintButton'

export default async function CertificadoPage({ params }: { params: { id: string } }) {
  const crianca = await prisma.crianca.findUnique({
    where: { id: Number(params.id) },
    include: { checkins: true },
  })

  if (!crianca) notFound()

  const diasPresente = crianca.checkins.map(c => c.dia).sort()
  const totalDias = diasPresente.length
  const turmaInfo = TURMAS[crianca.turma as TurmaKey]
  const NOMES_DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .certificado { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 40px !important; }
          .assinatura { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @page { size: A4 landscape; margin: 0; }
      `}</style>

      {/* Botão imprimir — some ao imprimir */}
      <div className="no-print bg-fundo px-6 py-4 flex items-center gap-4 border-b border-[#e8d9c4]">
        <a href="/relatorio#certificados" className="btn-secondary text-sm px-4 py-2">← Voltar</a>
        <PrintButton />
        <p className="text-gray-400 font-nunito text-sm">Ou use Ctrl+P / Cmd+P</p>
      </div>

      {/* Certificado */}
      <div className="certificado min-h-screen bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-3xl border-8 border-double border-roxo rounded-[20px] p-12 text-center space-y-6 relative">

          {/* Decoração cantos */}
          <div className="absolute top-4 left-4 w-6 h-6 border-l-4 border-t-4 border-amarelo rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-4 border-t-4 border-amarelo rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-4 border-b-4 border-amarelo rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-4 border-b-4 border-amarelo rounded-br-lg" />

          {/* Logo + título */}
          <div className="flex flex-col items-center gap-3">
            <Image src="/logo.png" alt="UCP Silva Jardim" width={120} height={60} className="object-contain" />
            <div className="w-24 h-1 bg-amarelo rounded-full" />
            <h1 className="font-fredoka text-4xl text-roxo tracking-wide">Certificado de Presença</h1>
            <div className="w-24 h-1 bg-amarelo rounded-full" />
          </div>

          {/* Texto */}
          <div className="space-y-2">
            <p className="font-nunito text-gray-500 text-lg">Certificamos que</p>
            <p className="font-fredoka text-5xl text-roxo">{crianca.nome}</p>
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-fredoka text-base ${turmaInfo.corClaro} ${turmaInfo.texto}`}>
              {turmaInfo.emoji} {turmaInfo.label}
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-nunito text-gray-600 text-lg">participou da</p>
            <p className="font-fredoka text-3xl text-roxo">Escola Bíblica de Férias 2026</p>
            <p className="font-nunito text-gray-500">Igreja Presbiteriana Silva Jardim — Curitiba, PR</p>
          </div>

          {/* Dias */}
          <div className="space-y-3">
            <p className="font-nunito text-gray-600">com presença em <span className="font-bold text-roxo">{totalDias}</span> de 5 dias</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((d) => {
                const presente = diasPresente.includes(d)
                return (
                  <div key={d} className={`flex flex-col items-center gap-1`}>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-fredoka text-lg ${
                      presente ? 'bg-roxo border-roxo text-white' : 'bg-gray-100 border-gray-200 text-gray-300'
                    }`}>
                      {presente ? '✓' : d}
                    </div>
                    <span className={`text-xs font-nunito ${presente ? 'text-roxo font-bold' : 'text-gray-300'}`}>
                      {NOMES_DIAS[d - 1].slice(0, 3)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Assinatura */}
          <div className="pt-6 flex justify-center">
            <div className="text-center">
              {/* PNG com fundo transparente (recortado e limpo) */}
              <img
                src="/assinatura-levy.png"
                alt="Assinatura de Levy Correa de Oliveira"
                className="assinatura h-24 w-auto mx-auto object-contain -mb-4 relative"
              />
              <div className="w-72 border-b-2 border-gray-400 mb-2 mx-auto" />
              <p className="font-fredoka text-gray-700">Levy Correa de Oliveira</p>
              <p className="font-nunito text-gray-500 text-sm">Reverendo</p>
            </div>
          </div>

          <p className="font-nunito text-gray-400 text-xs">Escola Bíblica de Férias 2026 · Curitiba, PR · 13 a 17 de julho de 2026</p>
        </div>
      </div>
    </>
  )
}
