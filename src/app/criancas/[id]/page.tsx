'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TURMAS, turmaParaIdade, TurmaKey } from '@/lib/turmas'

type Form = {
  nome: string; idade: string; dataNascimento: string
  rua: string; numero: string; complemento: string; bairro: string; cidade: string
  nomePai: string; nomeMae: string; whatsapp: string; outroContato: string
  restricaoAlimentar: boolean | null; qualRestricao: string
}

function Campo({ label, obrigatorio, children }: { label: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label} {obrigatorio && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

export default function EditarCriancaPage() {
  const router = useRouter()
  const { id } = useParams()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    fetch(`/api/criancas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          nome: data.nome,
          idade: String(data.idade),
          dataNascimento: data.dataNascimento?.split('T')[0] ?? '',
          rua: data.rua, numero: data.numero,
          complemento: data.complemento ?? '', bairro: data.bairro, cidade: data.cidade,
          nomePai: data.nomePai, nomeMae: data.nomeMae,
          whatsapp: data.whatsapp, outroContato: data.outroContato,
          restricaoAlimentar: data.restricaoAlimentar,
          qualRestricao: data.qualRestricao ?? '',
        })
        setLoading(false)
      })
  }, [id])

  function set(campo: keyof Form, valor: string | boolean | null) {
    setForm((prev) => prev ? { ...prev, [campo]: valor } : prev)
    setErro('')
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSalvando(true)
    setErro('')
    try {
      const res = await fetch(`/api/criancas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          idade: Number(form.idade),
          dataNascimento: form.dataNascimento,
          restricaoAlimentar: form.restricaoAlimentar ?? false,
          qualRestricao: form.restricaoAlimentar ? form.qualRestricao : null,
        }),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setSucesso(true)
      setTimeout(() => router.push('/criancas'), 1200)
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return (
    <div className="card text-center py-16 text-gray-400 font-nunito">⏳ Carregando dados...</div>
  )
  if (!form) return (
    <div className="card text-center py-16 text-red-400 font-nunito">❌ Criança não encontrada</div>
  )

  const idadeNum = Number(form.idade)
  const turmaCalculada = form.idade ? turmaParaIdade(idadeNum) : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/criancas')}
          className="btn-secondary text-sm px-3 py-2">← Voltar</button>
        <div>
          <h1 className="font-fredoka text-2xl text-roxo">✏️ Editar Cadastro</h1>
          <p className="text-gray-500 text-sm font-nunito">{form.nome}</p>
        </div>
      </div>

      {sucesso && (
        <div className="bg-green-50 border-2 border-green-400 rounded-card p-4 mb-4 text-center shadow-[3px_3px_0px_#15803d]">
          <p className="font-fredoka text-green-700 text-lg">✅ Salvo com sucesso!</p>
        </div>
      )}
      {erro && (
        <div className="bg-red-50 border-2 border-red-400 rounded-card p-3 mb-4">
          <p className="text-red-700 font-nunito text-sm font-bold">❌ {erro}</p>
        </div>
      )}

      <form onSubmit={salvar} className="card space-y-6">

        {/* Dados da criança */}
        <div className="space-y-4">
          <h2 className="font-fredoka text-roxo text-lg border-b-2 border-[#f0e6d6] pb-2">👧 Dados da Criança</h2>

          <Campo label="Nome completo" obrigatorio>
            <input className="input" value={form.nome} onChange={(e) => set('nome', e.target.value)} required />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Idade" obrigatorio>
              <select className="input" value={form.idade} onChange={(e) => set('idade', e.target.value)} required>
                <option value="">Selecione</option>
                {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                  <option key={n} value={n}>{n} anos</option>
                ))}
              </select>
            </Campo>
            <Campo label="Data de nascimento" obrigatorio>
              <input className="input" type="date" value={form.dataNascimento}
                onChange={(e) => set('dataNascimento', e.target.value)} required />
            </Campo>
          </div>

          {turmaCalculada && (
            <div className={`rounded-card p-3 flex items-center gap-2 border-2 ${TURMAS[turmaCalculada as TurmaKey].borda} ${TURMAS[turmaCalculada as TurmaKey].corClaro}`}>
              <span>{TURMAS[turmaCalculada as TurmaKey].emoji}</span>
              <span className={`font-fredoka ${TURMAS[turmaCalculada as TurmaKey].texto}`}>
                Turma: {TURMAS[turmaCalculada as TurmaKey].label}
              </span>
            </div>
          )}
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h2 className="font-fredoka text-roxo text-lg border-b-2 border-[#f0e6d6] pb-2">🏠 Endereço</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Campo label="Rua" obrigatorio>
                <input className="input" value={form.rua} onChange={(e) => set('rua', e.target.value)} required />
              </Campo>
            </div>
            <Campo label="Número" obrigatorio>
              <input className="input" value={form.numero} onChange={(e) => set('numero', e.target.value)} required />
            </Campo>
          </div>
          <Campo label="Complemento">
            <input className="input" value={form.complemento} onChange={(e) => set('complemento', e.target.value)} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Bairro" obrigatorio>
              <input className="input" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} required />
            </Campo>
            <Campo label="Cidade" obrigatorio>
              <input className="input" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} required />
            </Campo>
          </div>
        </div>

        {/* Responsáveis */}
        <div className="space-y-4">
          <h2 className="font-fredoka text-roxo text-lg border-b-2 border-[#f0e6d6] pb-2">👨‍👩‍👧 Responsáveis</h2>
          <Campo label="Nome do pai ou responsável" obrigatorio>
            <input className="input" value={form.nomePai} onChange={(e) => set('nomePai', e.target.value)} required />
          </Campo>
          <Campo label="Nome da mãe ou responsável" obrigatorio>
            <input className="input" value={form.nomeMae} onChange={(e) => set('nomeMae', e.target.value)} required />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="WhatsApp" obrigatorio>
              <input className="input" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)}
                type="tel" required />
            </Campo>
            <Campo label="Outro contato" obrigatorio>
              <input className="input" value={form.outroContato} onChange={(e) => set('outroContato', e.target.value)} required />
            </Campo>
          </div>
        </div>

        {/* Restrição */}
        <div className="space-y-3">
          <h2 className="font-fredoka text-roxo text-lg border-b-2 border-[#f0e6d6] pb-2">⚠️ Restrição Alimentar</h2>
          <div className="flex gap-3">
            {([true, false] as const).map((v) => (
              <button key={String(v)} type="button" onClick={() => { set('restricaoAlimentar', v); if (!v) set('qualRestricao', '') }}
                className={`flex-1 py-2.5 rounded-btn font-fredoka text-sm border-2 transition-all ${
                  form.restricaoAlimentar === v
                    ? v ? 'bg-green-500 border-green-500 text-white shadow-[3px_3px_0_#15803d] -translate-y-0.5'
                        : 'bg-red-400 border-red-400 text-white shadow-cartoon-red -translate-y-0.5'
                    : 'border-[#d6c4a8] text-gray-500 bg-white hover:border-roxo'
                }`}>
                {v ? '✅ Sim' : '❌ Não'}
              </button>
            ))}
          </div>
          {form.restricaoAlimentar && (
            <div>
              <label className="label">Qual a restrição?</label>
              <input className="input" value={form.qualRestricao}
                onChange={(e) => set('qualRestricao', e.target.value)}
                placeholder="Ex: amendoim, lactose, glúten..." />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.push('/criancas')} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={salvando}
            className="btn-primary flex-1 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
            {salvando ? '⏳ Salvando...' : '💾 Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
