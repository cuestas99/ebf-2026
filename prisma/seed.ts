import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function turmaParaIdade(idade: number): string {
  if (idade <= 4) return 'BEBES'
  if (idade <= 6) return 'JARDIM'
  if (idade <= 9) return 'JUNIORES'
  return 'PRE_ADOLESCENTES'
}

const nomes = [
  'Ana Beatriz Santos', 'João Pedro Lima', 'Maria Eduarda Costa', 'Lucas Gabriel Souza', 'Sofia Ferreira',
  'Miguel Alves Pereira', 'Isabela Rodrigues', 'Arthur Oliveira', 'Valentina Martins', 'Enzo Silva',
  'Laura Araújo', 'Bernardo Gomes', 'Manuela Ribeiro', 'Heitor Carvalho', 'Lívia Barbosa',
  'Davi Nascimento', 'Lorena Vieira', 'Gabriel Costa', 'Cecília Almeida', 'Matheus Sousa',
  'Alice Lima', 'Samuel Cavalcanti', 'Helena Cunha', 'Murilo Melo', 'Giovanna Teixeira',
  'Rafael Rocha', 'Rebeca Mendes', 'Felipe Freitas', 'Letícia Cardoso', 'Rodrigo Lopes',
  'Camila Correia', 'Daniel Moreira', 'Natália Medeiros', 'Thiago Castro', 'Bianca Nunes',
  'Leonardo Ramos', 'Mariana Azevedo', 'Victor Batista', 'Fernanda Campos', 'André Dias',
  'Julia Pinto', 'Gustavo Moura', 'Amanda Pacheco', 'Paulo Siqueira', 'Caroline Monteiro',
  'Bruno Bezerra', 'Vanessa Tavares', 'Diego Figueiredo', 'Priscila Brito', 'Fábio Macedo',
  'Renata Guimarães', 'Marcos Andrade', 'Patrícia Miranda', 'Eduardo Ferraz', 'Cristina Cavalcante',
  'Roberto Borges', 'Luciana Duarte', 'Alexandre Leite', 'Tatiana Magalhães', 'Ricardo Barros',
  'Simone Coelho', 'Marcelo Pires', 'Adriana Queiroz', 'Flávio Amaral', 'Rosana Paiva',
  'Sérgio Neves', 'Juliana Valente', 'Antônio Braga', 'Cláudia Esteves', 'Fernando Assunção',
  'Elaine Rangel', 'Régis Fonseca', 'Solange Machado', 'Celso Vasconcelos', 'Vera Cordeiro',
  'Décio Lago', 'Lúcia Torres', 'Jéssica Maia', 'Leandro Abreu', 'Suely Lobo',
  'Claudinho Rezende', 'Tereza Xavier', 'Wellington Serrano', 'Angélica Rios', 'Ronaldo Meireles',
  'Denise Prudente', 'Gilberto Nogueira', 'Sandra Viana', 'Humberto Branco', 'Elisa Galdino',
  'Fabiano Leal', 'Roseli Becker', 'Clayton Drummond', 'Nathalia Santos', 'Oberdan Costa',
  'Camilo Lima', 'Yasmin Oliveira', 'Kauã Ferreira', 'Lorrayne Pereira', 'Thales Souza',
]

const pais = ['José', 'Carlos', 'Paulo', 'Roberto', 'Antônio', 'Fernando', 'Marcos', 'Rafael', 'Lucas', 'Bruno']
const maes = ['Maria', 'Ana', 'Fernanda', 'Juliana', 'Patrícia', 'Sandra', 'Luciana', 'Renata', 'Tatiana', 'Camila']
const sobrenomes = ['Santos', 'Silva', 'Oliveira', 'Souza', 'Ferreira', 'Lima', 'Costa', 'Almeida', 'Gomes', 'Ribeiro']
const ruas = ['Rua das Flores', 'Av. Brasil', 'Rua São João', 'Rua 7 de Setembro', 'Av. da Saudade', 'Rua Presidente Vargas']
const bairros = ['Centro', 'Jardim América', 'Vila Nova', 'Bela Vista', 'Santo Antônio', 'São José']
const igrejas = ['IPB Silva Jardim', 'Igreja Batista Central', 'Assembleia de Deus', 'Igreja Metodista', 'IEAD']
const comosoubeOpcoes = [
  'Sou membro da IPB Silva Jardim',
  'Um amigo(a) me convidou',
  'Vi a faixa no portão da igreja',
  'Recebi um convite na rua',
]
const restricoes = ['Amendoim', 'Lactose', 'Glúten', 'Frutos do mar', 'Corante artificial']

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function idadeParaData(idade: number): Date {
  const hoje = new Date()
  const ano = hoje.getFullYear() - idade
  const mes = Math.floor(Math.random() * 12)
  const dia = Math.floor(Math.random() * 28) + 1
  return new Date(ano, mes, dia)
}

async function main() {
  console.log('🌱 Iniciando seed...')

  await prisma.checkIn.deleteMany()
  await prisma.crianca.deleteMany()

  // Distribuição de idades: 10 por faixa aproximadamente
  const idades = [
    ...Array(20).fill(0).map(() => 2 + Math.floor(Math.random() * 3)),    // 2-4 (Bebês)
    ...Array(20).fill(0).map(() => 5 + Math.floor(Math.random() * 2)),    // 5-6 (Jardim)
    ...Array(30).fill(0).map(() => 7 + Math.floor(Math.random() * 3)),    // 7-9 (Juniores)
    ...Array(30).fill(0).map(() => 10 + Math.floor(Math.random() * 3)),   // 10-12 (Pré)
  ]

  const criancas = []
  for (let i = 0; i < 100; i++) {
    const idade = idades[i]
    const temRestricao = Math.random() < 0.12
    const pertenceIgreja = Math.random() < 0.6
    const pai = `${rand(pais)} ${rand(sobrenomes)}`
    const mae = `${rand(maes)} ${rand(sobrenomes)}`

    const crianca = await prisma.crianca.create({
      data: {
        nome: nomes[i],
        idade,
        dataNascimento: idadeParaData(idade),
        turma: turmaParaIdade(idade),
        rua: rand(ruas),
        numero: String(Math.floor(Math.random() * 900) + 100),
        complemento: Math.random() < 0.3 ? `Casa ${Math.floor(Math.random() * 5) + 1}` : null,
        bairro: rand(bairros),
        cidade: 'Silva Jardim',
        nomePai: pai,
        nomeMae: mae,
        whatsapp: `(22) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        outroContato: `${rand(pais)} - (22) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        comoSoube: Math.random() < 0.8 ? rand(comosoubeOpcoes) : null,
        pertenceIgreja,
        qualIgreja: pertenceIgreja ? rand(igrejas) : null,
        restricaoAlimentar: temRestricao,
        qualRestricao: temRestricao ? rand(restricoes) : null,
        aceitouTermo1: true,
        aceitouTermo2: true,
        aceitouTermo3: true,
      }
    })
    criancas.push(crianca)
  }

  // Simular check-ins parciais (dias 1-3 com presença variada)
  for (const crianca of criancas) {
    const diasPresentes = Math.floor(Math.random() * 4)
    for (let dia = 1; dia <= diasPresentes; dia++) {
      await prisma.checkIn.create({
        data: { criancaId: crianca.id, dia }
      }).catch(() => {})
    }
  }

  console.log(`✅ Seed concluído: ${criancas.length} crianças cadastradas`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
