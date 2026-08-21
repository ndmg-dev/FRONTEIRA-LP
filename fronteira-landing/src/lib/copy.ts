/**
 * TODA a copy pt-BR da landing (§8 do spec). Nenhum texto de conteúdo deve ser
 * escrito direto no JSX — editar texto acontece aqui, sem tocar em layout.
 */

export type NavLink = { label: string; href: string }
export type MiniStat = { value: string; label: string }
export type ProblemItem = { index: string; title: string; body: string }
export type FlowItem = { id: string; name: string; summary: string; bullets: string[] }
export type DiffItem = { tag: string; body: string }
export type TechItem = { title: string; body: string }
export type CalcStep = { label: string; detail: string; value: string; negative?: boolean }
export type VolumeOption = { value: 'ate-10' | '11-50' | '51-200' | 'mais-de-200'; label: string }

export const brand = {
  name: 'Fronteira',
  logoAlt: 'Fronteira — marca em hexágono com traço de conferência',
} as const

export const nav = {
  links: [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Segurança', href: '#base-tecnica' },
  ] as NavLink[],
  cta: 'Solicitar demonstração',
  skipLink: 'Pular para o conteúdo',
  ariaLabel: 'Navegação principal',
} as const

export const hero = {
  eyebrow: 'Apuração fiscal · ICMS-ST · Antecipação',
  headline: {
    before: 'O cálculo de fronteira que o seu cliente ',
    highlight: 'consegue auditar',
    after: '.',
  },
  lead: 'Suba o XML da NF-e e receba o ICMS-ST de fronteira e a antecipação já calculados — com a memória de cálculo aberta, passo a passo, e conferência contra o extrato da SEFAZ. Feito para escritórios que apuram dezenas de empresas por competência.',
  ctaPrimary: 'Solicitar demonstração →',
  ctaGhost: 'Ver como funciona',
  stats: [
    { value: '3 fluxos', label: 'Fronteira · Lote · SEFAZ' },
    { value: 'Por empresa', label: 'Regras e memória isoladas' },
    { value: 'IBS / CBS', label: 'Já identifica nas notas' },
  ] as MiniStat[],
} as const

export const calcMemory = {
  title: 'Memória de cálculo · ICMS-ST',
  badge: 'Exemplo ilustrativo',
  docLabel: 'NF-e 000.114.502',
  ncmLabel: 'NCM 3924.90.00',
  steps: [
    { label: 'Base do produto', detail: 'valor da mercadoria', value: 'R$ 1.000,00' },
    { label: 'Base ST com MVA', detail: '1.000,00 × (1 + 40%)', value: 'R$ 1.400,00' },
    { label: 'ICMS destino', detail: '1.400,00 × 18%', value: 'R$ 252,00' },
    { label: 'Crédito de origem', detail: '1.000,00 × 12%', value: '− R$ 120,00', negative: true },
    { label: 'Fórmula aplicada', detail: 'ICMS_dest − crédito_origem', value: '252,00 − 120,00' },
  ] as CalcStep[],
  result: { label: 'ICMS-ST a recolher', value: 'R$ 132,00' },
} as const

export const problem = {
  eyebrow: 'O problema',
  title: 'A fronteira ainda é resolvida na planilha — e a planilha não se defende.',
  sub: 'Cada nota vira uma linha copiada à mão, cada MVA vira uma busca no regulamento, e quando a SEFAZ questiona, ninguém reconstrói de onde saiu o número.',
  items: [
    {
      index: '01',
      title: 'Retrabalho por competência',
      body: 'Toda apuração recomeça do zero: digitação de nota, classificação de NCM, cálculo manual. Multiplique por todas as empresas do escritório.',
    },
    {
      index: '02',
      title: 'Cálculo que ninguém reconstrói',
      body: 'A fórmula mora na cabeça de uma pessoa e numa célula escondida. Sem memória de cálculo, revisar ou justificar um valor vira arqueologia.',
    },
    {
      index: '03',
      title: 'Divergência com a SEFAZ no fim do mês',
      body: 'O confronto entre o que foi apurado e o extrato oficial acontece tarde, no susto, comparando duas planilhas linha a linha.',
    },
  ] as ProblemItem[],
} as const

export const howItWorks = {
  eyebrow: 'Como funciona',
  title: 'Três fluxos que cobrem a apuração de ponta a ponta.',
  sub: 'Do XML ao número recolhido, com a mesma lógica fiscal aplicada de forma consistente para todas as empresas que você atende.',
  flows: [
    {
      id: 'wizard',
      name: 'Wizard de Fronteira',
      summary:
        'Sobe o XML, confere, classifica e calcula — uma nota por vez, com o resultado detalhado.',
      bullets: [
        'Upload → contexto → conferência → resultado',
        'Memória de cálculo passo a passo por item',
        'Exceções fiscais aplicadas na conferência',
        'Exportação em XLSX e PDF',
      ],
    },
    {
      id: 'lote',
      name: 'Antecipação em lote',
      summary:
        'Vários XMLs de uma vez. O sistema classifica pela memória da empresa e calcula tudo junto.',
      bullets: [
        'Classificação automática por NCM + descrição',
        'A memória “aprende” a cada classificação manual',
        'Só calcula quando tudo está classificado',
        'Resultado do lote exportável',
      ],
    },
    {
      id: 'sefaz',
      name: 'Comparação SEFAZ',
      summary:
        'Sobe o extrato oficial e o sistema cruza com as notas apuradas, apontando as divergências.',
      bullets: [
        'Leitura do extrato .xls da SEFAZ',
        'Cruzamento por empresa e competência',
        'Observações sobre cada divergência',
        'Relatório de confronto exportável',
      ],
    },
  ] as FlowItem[],
} as const

export const differentiators = {
  eyebrow: 'Por que o Fronteira',
  title: 'Construído para quem responde por muitas empresas.',
  feature: {
    tag: 'Auditável',
    title: 'Todo número mostra de onde veio',
    body: 'Cada item traz entradas, parâmetros, fórmula e passos do cálculo — a memória fica registrada junto ao resultado. Quando o cliente ou o fisco pergunta “por que R$ 132,00?”, a resposta está na tela, não na memória de alguém.',
    chips: ['entradas', 'parâmetros', 'fórmula', 'passos', 'resultado'],
    chipHighlight: 'fórmula',
  },
  items: [
    {
      tag: 'Multi-empresa',
      body: 'Tudo é por empresa e por competência: regras de NCM/MVA, memória de classificação e histórico de apuração ficam isolados. O que vale para uma empresa não vaza para outra.',
    },
    {
      tag: 'IBS / CBS',
      body: 'O sistema já identifica os grupos de IBS e CBS nas notas e separa o que tem do que não tem — um pé dentro da transição da reforma tributária desde agora.',
    },
    {
      tag: 'Histórico',
      body: 'Consulta por empresa + competência lê direto das notas já apuradas. Reabre qualquer apuração passada em modo leitura e reexporta XLSX ou PDF sem recalcular.',
    },
  ] as DiffItem[],
} as const

export const techBase = {
  eyebrow: 'Base técnica',
  title: 'Uma arquitetura pensada para dado fiscal.',
  sub: 'A lógica de tributação é isolada do resto do sistema e coberta por testes automatizados — a parte crítica não é reescrita a cada tela nova.',
  items: [
    {
      title: 'Papéis de acesso',
      body: 'Administrador, coordenador e operador — cada um vê e faz o que lhe cabe.',
    },
    {
      title: 'Dados por empresa',
      body: 'Notas, regras e apurações separadas por empresa e competência, sem cruzamento indevido.',
    },
    {
      title: 'Motor fiscal isolado',
      body: 'Os calculadores de tributação são um núcleo próprio, coberto por testes unitários.',
    },
    {
      title: 'Exportações prontas',
      body: 'XLSX e PDF em cada fluxo — do item avulso à apuração completa da competência.',
    },
  ] as TechItem[],
} as const

export const demoCta = {
  eyebrow: 'Demonstração',
  title: 'Veja o Fronteira rodando com uma nota sua.',
  sub: 'Agende uma demonstração e mostramos os três fluxos com um caso real do seu escritório — do XML ao confronto com a SEFAZ.',
  bullets: [
    'Apuração de uma competência real, ponta a ponta',
    'Memória de cálculo aberta, item por item',
    'Conversa sobre volume de empresas e implantação.',
  ],
  note: 'Retornamos em até 1 dia útil. Sem compromisso.',
} as const

export const demoForm = {
  legend: 'Solicitar demonstração',
  submit: 'Solicitar demonstração',
  submitting: 'Enviando…',
  fields: {
    name: { label: 'Nome', placeholder: 'Seu nome' },
    office: { label: 'Escritório', placeholder: 'Nome do escritório' },
    email: { label: 'E-mail', placeholder: 'voce@escritorio.com.br' },
    volume: { label: 'Quantas empresas você apura?' },
  },
  volumeOptions: [
    { value: 'ate-10', label: 'Até 10' },
    { value: '11-50', label: '11–50' },
    { value: '51-200', label: '51–200' },
    { value: 'mais-de-200', label: 'Mais de 200' },
  ] as VolumeOption[],
  errors: {
    name: 'Informe seu nome.',
    office: 'Informe o nome do escritório.',
    email: 'Informe um e-mail válido.',
    volume: 'Selecione uma faixa.',
    consent: 'É necessário aceitar para prosseguir.',
    rateLimit: 'Muitas solicitações em pouco tempo. Aguarde alguns minutos e tente de novo.',
    submit: 'Não foi possível enviar agora. Tente novamente em instantes.',
  },
  // Eco por faixa de volume (§A.6) — uma frase curta que troca com fade ao
  // selecionar a pill.
  echo: {
    'ate-10': 'Comece simples: a apuração de poucas empresas fica pronta em minutos.',
    '11-50': 'Na faixa de dezenas de empresas, a memória de cálculo evita retrabalho a cada competência.',
    '51-200':
      'Com dezenas a centenas de empresas, a classificação automática por NCM passa a valer o escritório inteiro.',
    'mais-de-200': 'A apuração em lote é o caso que mais te devolve tempo.',
  } as Record<VolumeOption['value'], string>,
  consent: {
    label: 'Li e aceito a',
    linkLabel: 'Política de Privacidade',
    // TODO: apontar para a URL real quando a página de privacidade existir.
    href: '#',
    suffix: 'e autorizo o contato do time Fronteira sobre esta solicitação.',
  },
  confirmation: {
    title: 'Solicitação registrada',
    protocolLabel: 'Protocolo',
    fieldsLabels: {
      office: 'Escritório',
      email: 'E-mail',
      volume: 'Faixa de empresas',
    },
    note: 'Enviamos uma cópia deste protocolo para o seu e-mail. O time retorna em até 1 dia útil.',
    again: 'Enviar outra solicitação',
  },
} as const

export const footer = {
  tagline:
    'Apuração de fronteira, antecipação e confronto SEFAZ · para escritórios de contabilidade.',
  linksLabel: 'Links do rodapé',
  links: [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Segurança', href: '#base-tecnica' },
    { label: 'Solicitar demonstração', href: '#demonstracao' },
  ] as NavLink[],
  disclaimer:
    'Valores e telas exibidos nesta página são ilustrativos. O resultado de cada apuração depende da legislação vigente, dos dados da nota e da configuração de cada empresa. O Fronteira é uma ferramenta de apoio à apuração e não substitui o profissional responsável.',
  copyright: '© 2026 Fronteira',
} as const

export const adminLink = {
  ariaLabel: 'Acesso administrativo',
} as const

export const adminLoginCopy = {
  title: 'Painel administrativo',
  subtitle: 'Acesso restrito ao time Fronteira.',
  usernameLabel: 'Usuário',
  passwordLabel: 'Senha',
  submit: 'Entrar',
  submitting: 'Entrando…',
  backToSite: '← Voltar ao site',
  genericError: 'Não foi possível entrar. Tente novamente.',
} as const

export const adminDashboardCopy = {
  title: 'Leads',
  logout: 'Sair',
  statusFilterLabel: 'Filtrar por status',
  statusFilterAll: 'Todos',
  statusLabels: {
    novo: 'Novo',
    contatado: 'Contatado',
    fechado: 'Fechado',
    perdido: 'Perdido',
  } as Record<'novo' | 'contatado' | 'fechado' | 'perdido', string>,
  columns: {
    createdAt: 'Data',
    name: 'Nome',
    office: 'Escritório',
    email: 'E-mail',
    volume: 'Faixa',
    protocol: 'Protocolo',
    status: 'Status',
  },
  empty: 'Nenhum lead encontrado para este filtro.',
  loading: 'Carregando…',
  loadError: 'Não foi possível carregar os leads.',
  updateError: 'Não foi possível atualizar o status. Tente novamente.',
  sessionExpired: 'Sessão expirada. Faça login novamente.',
  pagination: { previous: '← Anterior', next: 'Próxima →', pageOf: (page: number, totalPages: number) => `Página ${page} de ${totalPages}` },
} as const
