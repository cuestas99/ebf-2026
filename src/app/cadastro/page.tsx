'use client'
import { useState } from 'react'
import { COMO_SOUBE_OPCOES, TURMAS, turmaParaIdade, TurmaKey } from '@/lib/turmas'

const PARENTESCOS = ['Avó/Avô', 'Tio/Tia', 'Irmão/Irmã', 'Padrinho/Madrinha', 'Amigo(a) da família', 'Outro']

type FormState = {
  nome: string
  idade: string
  dataNascimento: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  nomePai: string
  nomeMae: string
  whatsapp: string
  outroContato: string
  autorizadoNome1: string
  autorizadoParentesco1: string
  autorizadoNome2: string
  autorizadoParentesco2: string
  comoSoube: string
  pertenceIgreja: boolean | null
  qualIgreja: string
  restricaoAlimentar: boolean | null
  qualRestricao: string
  aceitouTermo1: boolean
  aceitouTermo2: boolean
  aceitouTermo3: boolean
}

const FORM_INICIAL: FormState = {
  nome: '', idade: '', dataNascimento: '',
  rua: '', numero: '', complemento: '', bairro: '', cidade: '',
  nomePai: '', nomeMae: '', whatsapp: '', outroContato: '',
  autorizadoNome1: '', autorizadoParentesco1: '',
  autorizadoNome2: '', autorizadoParentesco2: '',
  comoSoube: '', pertenceIgreja: null, qualIgreja: '',
  restricaoAlimentar: null, qualRestricao: '',
  aceitouTermo1: false, aceitouTermo2: false, aceitouTermo3: false,
}

function Secao({ titulo, emoji, children }: { titulo: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b-2 border-[#f0e6d6]">
        <span className="text-xl">{emoji}</span>
        <h2 className="font-fredoka text-roxo text-lg">{titulo}</h2>
      </div>
      {children}
    </div>
  )
}

function Campo({ label, obrigatorio, children }: { label: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {label} {obrigatorio && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function RadioSimNao({ valor, onChange }: { valor: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3 mt-1">
      {([true, false] as const).map((v) => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-btn font-fredoka text-sm border-2 transition-all ${
            valor === v
              ? v
                ? 'bg-green-500 border-green-500 text-white shadow-cartoon-verde -translate-y-0.5'
                : 'bg-red-400 border-red-400 text-white shadow-cartoon-red -translate-y-0.5'
              : 'border-[#d6c4a8] text-gray-500 bg-white hover:border-roxo hover:text-roxo'
          }`}>
          {v ? '✅ Sim' : '❌ Não'}
        </button>
      ))}
    </div>
  )
}

type DadosFamilia = Omit<FormState, 'nome' | 'idade' | 'dataNascimento'>

const CAMPOS_CRIANCA: (keyof FormState)[] = ['nome', 'idade', 'dataNascimento']

export default function CadastroPage() {
  const [form, setForm] = useState<FormState>(FORM_INICIAL)
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [nomeSalvo, setNomeSalvo] = useState('')
  const [dadosFamilia, setDadosFamilia] = useState<DadosFamilia | null>(null)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState<Partial<Record<keyof FormState, string>>>({})

  function set(campo: keyof FormState, valor: string | boolean | null) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrosCampos((prev) => { const n = { ...prev }; delete n[campo]; return n })
    setErro('')
    setSucesso('')
  }

  const idadeNum = Number(form.idade)
  const precisaAcompanhante = idadeNum >= 2 && idadeNum <= 4
  const turmaCalculada = form.idade ? turmaParaIdade(idadeNum) : null

  function validar(): boolean {
    const erros: Partial<Record<keyof FormState, string>> = {}
    if (!form.nome.trim())         erros.nome = 'Obrigatório'
    if (!form.idade)               erros.idade = 'Obrigatório'
    if (!form.dataNascimento)      erros.dataNascimento = 'Obrigatório'
    if (!form.rua.trim())          erros.rua = 'Obrigatório'
    if (!form.numero.trim())       erros.numero = 'Obrigatório'
    if (!form.bairro.trim())       erros.bairro = 'Obrigatório'
    if (!form.cidade.trim())       erros.cidade = 'Obrigatório'
    if (!form.nomePai.trim())      erros.nomePai = 'Obrigatório'
    if (!form.nomeMae.trim())      erros.nomeMae = 'Obrigatório'
    if (!form.whatsapp.trim())     erros.whatsapp = 'Obrigatório'
    if (!form.outroContato.trim()) erros.outroContato = 'Obrigatório'
    if (form.restricaoAlimentar === null) erros.restricaoAlimentar = 'Informe se há restrição'
    if (form.restricaoAlimentar && !form.qualRestricao.trim()) erros.qualRestricao = 'Descreva a restrição'
    if (!form.aceitouTermo1) erros.aceitouTermo1 = 'Necessário'
    if (!form.aceitouTermo2) erros.aceitouTermo2 = 'Necessário'
    if (!form.aceitouTermo3) erros.aceitouTermo3 = 'Necessário'
    setErrosCampos(erros)
    return Object.keys(erros).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) {
      setErro('Preencha todos os campos obrigatórios.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/criancas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pertenceIgreja: form.pertenceIgreja ?? false,
          restricaoAlimentar: form.restricaoAlimentar ?? false,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao cadastrar')
      }
      const crianca = await res.json()
      setSucesso(`🎉 ${crianca.nome} foi inscrito(a) com sucesso na EBF 2026!`)
      setNomeSalvo(crianca.nome)
      // guarda dados da família para pré-preenchimento do próximo irmão
      const { nome: _n, idade: _i, dataNascimento: _d, ...familia } = form
      setDadosFamilia(familia)
      setForm(FORM_INICIAL)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const erroCampo = (campo: keyof FormState) =>
    errosCampos[campo]
      ? <p className="text-red-500 text-xs mt-1 font-nunito">⚠ {errosCampos[campo]}</p>
      : null

  const TERMOS = [
    {
      campo: 'aceitouTermo1' as keyof FormState,
      titulo: 'Lanche',
      texto: 'Nós fornecemos o lanche, mas para crianças com restrição alimentar pedimos que os pais enviem o lanche do filho(a).',
    },
    {
      campo: 'aceitouTermo2' as keyof FormState,
      titulo: 'Medicamentos',
      texto: 'No período das atividades, não damos medicamentos para as crianças mesmo com receita médica. Pedimos que administrem a medicação em casa fora do horário da EBF.',
    },
    {
      campo: 'aceitouTermo3' as keyof FormState,
      titulo: 'Imagens',
      texto: 'Ao realizar a inscrição, os pais concordam com a eventual utilização das imagens dos filhos em mídias sociais relativas à EBF 2026.',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto">

      <div className="text-center mb-6">
        <div className="text-4xl mb-2">✝️ 🎉</div>
        <h1 className="font-fredoka text-3xl text-roxo">Inscrição — EBF 2026</h1>
        <p className="text-gray-500 text-sm mt-1 font-nunito">
          Campos com <span className="text-red-500 font-bold">*</span> são obrigatórios
        </p>
      </div>

      {sucesso && (
        <div className="bg-green-50 border-2 border-green-400 rounded-card p-5 mb-6 shadow-[3px_3px_0px_#15803d]">
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">🎊</div>
            <p className="font-fredoka text-green-700 text-lg">{sucesso}</p>
            <p className="text-green-600 text-sm mt-1 font-nunito">Que Deus abençoe muito!</p>
          </div>
          <div className="flex gap-3 flex-col sm:flex-row">
            <button
              type="button"
              onClick={() => { setSucesso(''); setDadosFamilia(null) }}
              className="btn-secondary flex-1 text-sm py-2.5">
              ✏️ Nova Inscrição
            </button>
            {dadosFamilia && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...FORM_INICIAL, ...dadosFamilia })
                  setSucesso('')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="btn-primary flex-1 text-sm py-2.5">
                👨‍👩‍👧 Cadastrar irmão/irmã de {nomeSalvo.split(' ')[0]}
              </button>
            )}
          </div>
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border-2 border-red-400 rounded-card p-4 mb-6 shadow-cartoon-red">
          <p className="text-red-700 font-bold font-nunito text-sm">❌ {erro}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-8" noValidate>

        {/* ── DADOS DA CRIANÇA ── */}
        <Secao titulo="Dados da Criança" emoji="👧">
          <Campo label="Nome completo da criança" obrigatorio>
            <input className={`input ${errosCampos.nome ? 'border-red-400' : ''}`}
              value={form.nome} onChange={(e) => set('nome', e.target.value)}
              placeholder="Nome completo" />
            {erroCampo('nome')}
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Idade" obrigatorio>
              <select className={`input ${errosCampos.idade ? 'border-red-400' : ''}`}
                value={form.idade} onChange={(e) => set('idade', e.target.value)}>
                <option value="">Selecione</option>
                {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                  <option key={n} value={n}>{n} anos</option>
                ))}
              </select>
              {erroCampo('idade')}
            </Campo>

            <Campo label="Data de nascimento" obrigatorio>
              <input className={`input ${errosCampos.dataNascimento ? 'border-red-400' : ''}`}
                type="date" value={form.dataNascimento}
                onChange={(e) => set('dataNascimento', e.target.value)} />
              {erroCampo('dataNascimento')}
            </Campo>
          </div>

          {precisaAcompanhante && (
            <div className="bg-amarelo-claro border-2 border-amarelo rounded-card p-4 flex gap-3 shadow-cartoon-amarelo">
              <span className="text-2xl shrink-0">⚠️</span>
              <p className="text-gray-800 text-sm font-nunito font-semibold leading-snug">
                Precisa estar acompanhada de um responsável e ser membro da IPB Silva Jardim.
              </p>
            </div>
          )}

          {turmaCalculada && (
            <div className={`rounded-card p-3 flex items-center gap-2 border-2 ${TURMAS[turmaCalculada as TurmaKey].borda} ${TURMAS[turmaCalculada as TurmaKey].corClaro}`}>
              <span className="text-lg">{TURMAS[turmaCalculada as TurmaKey].emoji}</span>
              <span className={`font-fredoka ${TURMAS[turmaCalculada as TurmaKey].texto}`}>
                Turma: {TURMAS[turmaCalculada as TurmaKey].label}
              </span>
            </div>
          )}
        </Secao>

        {/* ── ENDEREÇO ── */}
        <Secao titulo="Endereço" emoji="🏠">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Campo label="Rua" obrigatorio>
                <input className={`input ${errosCampos.rua ? 'border-red-400' : ''}`}
                  value={form.rua} onChange={(e) => set('rua', e.target.value)} placeholder="Nome da rua" />
                {erroCampo('rua')}
              </Campo>
            </div>
            <Campo label="Número" obrigatorio>
              <input className={`input ${errosCampos.numero ? 'border-red-400' : ''}`}
                value={form.numero} onChange={(e) => set('numero', e.target.value)} placeholder="Nº" />
              {erroCampo('numero')}
            </Campo>
          </div>

          <Campo label="Complemento">
            <input className="input" value={form.complemento}
              onChange={(e) => set('complemento', e.target.value)}
              placeholder="Apto, bloco, casa... (opcional)" />
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Bairro" obrigatorio>
              <input className={`input ${errosCampos.bairro ? 'border-red-400' : ''}`}
                value={form.bairro} onChange={(e) => set('bairro', e.target.value)} placeholder="Bairro" />
              {erroCampo('bairro')}
            </Campo>
            <Campo label="Cidade" obrigatorio>
              <input className={`input ${errosCampos.cidade ? 'border-red-400' : ''}`}
                value={form.cidade} onChange={(e) => set('cidade', e.target.value)} placeholder="Cidade" />
              {erroCampo('cidade')}
            </Campo>
          </div>
        </Secao>

        {/* ── RESPONSÁVEIS ── */}
        <Secao titulo="Responsáveis e Contatos" emoji="👨‍👩‍👧">
          <Campo label="Nome do pai ou responsável" obrigatorio>
            <input className={`input ${errosCampos.nomePai ? 'border-red-400' : ''}`}
              value={form.nomePai} onChange={(e) => set('nomePai', e.target.value)}
              placeholder="Nome completo do pai ou responsável" />
            {erroCampo('nomePai')}
          </Campo>

          <Campo label="Nome da mãe ou responsável" obrigatorio>
            <input className={`input ${errosCampos.nomeMae ? 'border-red-400' : ''}`}
              value={form.nomeMae} onChange={(e) => set('nomeMae', e.target.value)}
              placeholder="Nome completo da mãe ou responsável" />
            {erroCampo('nomeMae')}
          </Campo>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="WhatsApp do responsável" obrigatorio>
              <input className={`input ${errosCampos.whatsapp ? 'border-red-400' : ''}`}
                value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="(22) 99999-0000" type="tel" />
              {erroCampo('whatsapp')}
            </Campo>
            <Campo label="Outro contato (se não atender)" obrigatorio>
              <input className={`input ${errosCampos.outroContato ? 'border-red-400' : ''}`}
                value={form.outroContato} onChange={(e) => set('outroContato', e.target.value)}
                placeholder="Nome e telefone" />
              {erroCampo('outroContato')}
            </Campo>
          </div>
        </Secao>

        {/* ── AUTORIZAÇÃO DE RETIRADA ── */}
        <Secao titulo="Autorização de Retirada" emoji="🔐">
          <div className="bg-roxo-claro border-2 border-roxo/30 rounded-card p-3">
            <p className="text-sm font-nunito text-gray-600">
              <span className="font-bold text-roxo">Pai e mãe já estão autorizados.</span> Informe abaixo outras pessoas autorizadas a buscar a criança, se necessário.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Nome do autorizado 1">
              <input className="input" value={form.autorizadoNome1}
                onChange={(e) => set('autorizadoNome1', e.target.value)}
                placeholder="Nome completo" />
            </Campo>
            <Campo label="Parentesco">
              <select className="input" value={form.autorizadoParentesco1}
                onChange={(e) => set('autorizadoParentesco1', e.target.value)}>
                <option value="">Selecione...</option>
                {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo label="Nome do autorizado 2 (opcional)">
              <input className="input" value={form.autorizadoNome2}
                onChange={(e) => set('autorizadoNome2', e.target.value)}
                placeholder="Nome completo" />
            </Campo>
            <Campo label="Parentesco">
              <select className="input" value={form.autorizadoParentesco2}
                onChange={(e) => set('autorizadoParentesco2', e.target.value)}>
                <option value="">Selecione...</option>
                {PARENTESCOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </Campo>
          </div>
        </Secao>

        {/* ── INFORMAÇÕES ADICIONAIS ── */}
        <Secao titulo="Informações Adicionais" emoji="ℹ️">
          <Campo label="Como ficou sabendo da EBF?">
            <div className="space-y-2 mt-1">
              {COMO_SOUBE_OPCOES.map((op) => (
                <label key={op}
                  className={`flex items-center gap-3 p-3 rounded-card border-2 cursor-pointer transition-all ${
                    form.comoSoube === op
                      ? 'border-roxo bg-roxo-claro'
                      : 'border-[#e8d9c4] bg-white hover:border-roxo/40'
                  }`}>
                  <input type="radio" name="comoSoube" value={op}
                    checked={form.comoSoube === op}
                    onChange={() => {
                      set('comoSoube', op)
                      if (op === 'Sou membro da IPB Silva Jardim') {
                        setForm(prev => ({ ...prev, comoSoube: op, pertenceIgreja: true, qualIgreja: 'IPB Silva Jardim' }))
                      }
                    }}
                    className="accent-roxo w-4 h-4 shrink-0" />
                  <span className="text-sm font-nunito text-gray-700">{op}</span>
                </label>
              ))}
              {form.comoSoube && (
                <button type="button" onClick={() => set('comoSoube', '')}
                  className="text-xs text-gray-400 hover:text-gray-600 underline font-nunito">
                  Limpar seleção
                </button>
              )}
            </div>
          </Campo>

          {form.comoSoube === 'Sou membro da IPB Silva Jardim' ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-card p-3 flex items-center gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <p className="font-nunito text-sm text-green-700 font-semibold">Membro da IPB Silva Jardim — preenchido automaticamente</p>
            </div>
          ) : (
            <Campo label="Pertence a alguma igreja?">
              <RadioSimNao valor={form.pertenceIgreja}
                onChange={(v) => { set('pertenceIgreja', v); if (!v) set('qualIgreja', '') }} />
              {form.pertenceIgreja === true && (
                <div className="mt-3">
                  <label className="label">Qual igreja frequentam?</label>
                  <input className="input" value={form.qualIgreja}
                    onChange={(e) => set('qualIgreja', e.target.value)} placeholder="Nome da igreja" />
                </div>
              )}
            </Campo>
          )}

          <Campo label="Tem restrição alimentar?" obrigatorio>
            <RadioSimNao valor={form.restricaoAlimentar}
              onChange={(v) => { set('restricaoAlimentar', v); if (!v) set('qualRestricao', '') }} />
            {erroCampo('restricaoAlimentar')}
            {form.restricaoAlimentar === true && (
              <div className="mt-3">
                <label className="label">Qual a restrição? <span className="text-red-500">*</span></label>
                <input className={`input ${errosCampos.qualRestricao ? 'border-red-400' : ''}`}
                  value={form.qualRestricao} onChange={(e) => set('qualRestricao', e.target.value)}
                  placeholder="Ex: amendoim, lactose, glúten..." />
                {erroCampo('qualRestricao')}
              </div>
            )}
          </Campo>
        </Secao>

        {/* ── TERMOS ── */}
        <Secao titulo="Termos e Autorizações" emoji="📋">
          {TERMOS.map(({ campo, titulo, texto }) => {
            const aceito = form[campo] as boolean
            const temErro = !!errosCampos[campo]
            return (
              <div key={campo}
                className={`rounded-card border-2 p-4 space-y-3 transition-colors ${
                  aceito ? 'border-green-400 bg-green-50'
                  : temErro ? 'border-red-400 bg-red-50'
                  : 'border-[#e8d9c4] bg-[#faf5eb]'
                }`}>
                <p className="text-sm text-gray-700 font-nunito leading-relaxed">
                  <span className="font-bold text-gray-900">{titulo}: </span>{texto}
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={aceito}
                    onChange={(e) => set(campo, e.target.checked)}
                    className="w-5 h-5 accent-roxo cursor-pointer" />
                  <span className="text-sm font-bold text-gray-700 font-nunito">Aceito e concordo.</span>
                </label>
                {erroCampo(campo)}
              </div>
            )
          })}
        </Secao>

        {/* ── BOTÃO ── */}
        <div className="pt-2">
          {erro && (
            <div className="bg-red-50 border-2 border-red-400 rounded-card p-3 mb-4 shadow-cartoon-red">
              <p className="text-red-700 font-bold font-nunito text-sm">❌ {erro}</p>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
            {loading ? '⏳ Inscrevendo...' : '🎉 Realizar Inscrição'}
          </button>
        </div>
      </form>
    </div>
  )
}
