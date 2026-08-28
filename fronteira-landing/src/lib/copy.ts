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
export type FaqItem = { id: string; question: string; answer: string }
export type PrivacySection = { heading: string; paragraphs: string[]; bullets?: string[] }

export const brand = {
  name: 'Fronteira',
  logoAlt: 'Fronteira — marca em hexágono com traço de conferência',
} as const

export const nav = {
  links: [
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Segurança', href: '#base-tecnica' },
    { label: 'Perguntas', href: '#faq' },
  ] as NavLink[],
  cta: 'Solicitar demonstração',
  skipLink: 'Pular para o conteúdo',
  ariaLabel: 'Navegação principal',
} as const

export const hero = {
  eyebrow: 'Apuração fiscal · ICMS-ST · Antecipação',
  headline: {
    before: 'O cálculo de fronteira ',
    highlight: 'facilitado',
    after: ' para você.',
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
  title: 'Ainda calcula o ICMS-ST na mão?',
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
    {
      index: '04',
      title: 'Erro humano no meio do caminho',
      body: 'Cálculo manual não tem trava: uma célula errada, uma alíquota desatualizada, um MVA trocado. Ninguém percebe até o cliente ou a SEFAZ perguntar.',
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

export const faq = {
  eyebrow: 'Perguntas frequentes',
  title: 'Antes de agendar, as dúvidas mais comuns.',
  items: [
    {
      id: 'responsavel',
      question: 'O Fronteira substitui o profissional responsável pela apuração?',
      answer:
        'Não. O Fronteira é uma ferramenta de apoio à apuração — calcula e documenta a memória de cálculo, mas a responsabilidade final pela apuração continua sendo do profissional do escritório.',
    },
    {
      id: 'homologacao',
      question: 'O cálculo é homologado pela SEFAZ?',
      answer:
        'Não. O produto é testado internamente, mas não passou por homologação fiscal formal. Por isso a memória de cálculo fica sempre visível, passo a passo — para você conferir e assumir o resultado com segurança, não para confiar cegamente nele.',
    },
    {
      id: 'volume',
      question: 'Funciona para quantas empresas?',
      answer:
        'O sistema separa regras, memória de classificação e histórico por empresa e por competência — de um punhado a centenas de empresas por escritório. Na demonstração, conversamos sobre o volume específico do seu caso.',
    },
    {
      id: 'demonstracao',
      question: 'Como funciona a demonstração?',
      answer:
        'Mostramos os três fluxos — Wizard de Fronteira, Antecipação em lote e Comparação SEFAZ — com um XML real do seu escritório, não com um exemplo genérico. Retornamos em até 1 dia útil, sem compromisso.',
    },
    {
      id: 'reforma',
      question: 'O sistema já contempla a reforma tributária (IBS/CBS)?',
      answer:
        'Sim. O Fronteira já identifica os grupos de IBS e CBS nas notas, separando o que já está na nova sistemática do que ainda segue as regras atuais.',
    },
    {
      id: 'dados',
      question: 'Meus dados e os dos meus clientes ficam seguros?',
      answer:
        'Sim — dados de apuração ficam isolados por empresa e por competência, sem cruzamento indevido. Para saber como tratamos os dados da sua solicitação de demonstração, veja a Política de Privacidade no rodapé desta página.',
    },
  ] as FaqItem[],
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
    href: '/privacidade',
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
    { label: 'Perguntas', href: '#faq' },
    { label: 'Solicitar demonstração', href: '#demonstracao' },
    { label: 'Política de Privacidade', href: '/privacidade' },
  ] as NavLink[],
  disclaimer:
    'Valores e telas exibidos nesta página são ilustrativos. O resultado de cada apuração depende da legislação vigente, dos dados da nota e da configuração de cada empresa. O Fronteira é uma ferramenta de apoio à apuração e não substitui o profissional responsável.',
  copyright: '© 2026 Fronteira',
  // TODO: número de WhatsApp e handle de Instagram são placeholders — trocar
  // pelos reais da Núcleo Digital antes de divulgar a página.
  contact: {
    label: 'Fale com a gente',
    whatsapp: { href: 'https://wa.me/5500000000000', label: 'WhatsApp' },
    instagram: { href: 'https://instagram.com/nucleodigital', label: 'Instagram' },
    email: {
      href: 'mailto:nucleodigitalmendoncagalvao@gmail.com',
      label: 'E-mail',
    },
  },
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
    origin: 'Origem',
    status: 'Status',
    followup: 'Follow-up',
    actions: 'Ações',
  },
  originUnknown: '—',
  followupPending: '—',
  resendButton: 'Reenviar',
  resendButtonSending: 'Enviando…',
  resendError: 'O provedor de e-mail recusou o envio. Tente de novo ou confira os logs da API.',
  resendSuccess: (protocol: string) => `Follow-up reenviado (${protocol}).`,
  empty: 'Nenhum lead encontrado para este filtro.',
  loading: 'Carregando…',
  loadError: 'Não foi possível carregar os leads.',
  updateError: 'Não foi possível atualizar o status. Tente novamente.',
  sessionExpired: 'Sessão expirada. Faça login novamente.',
  pagination: { previous: '← Anterior', next: 'Próxima →', pageOf: (page: number, totalPages: number) => `Página ${page} de ${totalPages}` },
} as const

export const privacyPolicy = {
  title: 'Política de Privacidade',
  updatedAt: 'Última atualização: 24 de agosto de 2026.',
  backLink: '← Voltar ao site',
  intro:
    'Esta página explica quais dados o Fronteira coleta através do formulário de solicitação de demonstração deste site, para que servem e quais direitos você tem sobre eles, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).',
  controllerNotice:
    '[RAZÃO SOCIAL A PREENCHER], inscrita no CNPJ [00.000.000/0000-00], é a controladora dos dados tratados através deste site.',
  sections: [
    {
      heading: '1. Quais dados coletamos',
      paragraphs: [
        'Coletamos apenas os dados que você mesmo informa ao preencher o formulário de solicitação de demonstração, mais alguns metadados técnicos coletados automaticamente para segurança e para entender de onde vêm os pedidos:',
      ],
      bullets: [
        'Nome, nome do escritório, e-mail e faixa de empresas atendidas — informados por você no formulário.',
        'Origem da visita (UTM, referrer e página de origem), quando presentes na URL.',
        'Endereço IP — nunca armazenado em texto puro: é transformado por hash criptográfico (SHA-256 com segredo) antes de ser gravado, exclusivamente para limitar tentativas abusivas de envio (rate-limit) e evitar duplicidade.',
      ],
    },
    {
      heading: '2. Para que usamos esses dados',
      paragraphs: [
        'Usamos os dados do formulário para: (a) responder à sua solicitação de demonstração e entrar em contato pelo time comercial; (b) enviar um e-mail de acompanhamento caso não tenhamos conseguido falar com você em alguns dias úteis; e (c) prevenir abuso do formulário (envios automatizados, spam, tentativas de sobrecarga).',
        'Não usamos os dados do formulário para nenhuma outra finalidade, não fazemos publicidade direcionada com eles e não os vendemos.',
      ],
    },
    {
      heading: '3. Base legal',
      paragraphs: [
        'O tratamento dos dados de contato (nome, escritório, e-mail, faixa de empresas) tem como base o seu consentimento, dado explicitamente ao marcar a caixa de aceite no formulário (art. 7º, I, da LGPD).',
        'O tratamento do IP com hash tem como base o legítimo interesse do Fronteira em manter a segurança do formulário e prevenir abuso (art. 7º, IX, da LGPD) — nunca é usado para identificar você.',
      ],
    },
    {
      heading: '4. Com quem compartilhamos',
      paragraphs: [
        'Usamos provedores terceiros para operar o serviço: um provedor de envio de e-mail transacional (para a confirmação automática e o e-mail de acompanhamento) e um provedor de hospedagem em nuvem (para armazenar os dados e rodar o site). Esses provedores têm acesso aos dados apenas na medida necessária para prestar esses serviços, sob obrigação contratual de confidencialidade.',
        'Não compartilhamos seus dados com terceiros para fins de marketing ou publicidade.',
      ],
    },
    {
      heading: '5. Por quanto tempo guardamos',
      paragraphs: [
        'Guardamos os dados da sua solicitação enquanto forem necessários para a finalidade de contato comercial e enquanto você não solicitar a exclusão. Hoje não temos uma rotina automática de expurgo de dados antigos — se quiser que seus dados sejam removidos antes disso, é só pedir pelo canal de contato abaixo.',
      ],
    },
    {
      heading: '6. Cookies e rastreamento',
      paragraphs: [
        'Este site não usa cookies de rastreamento nem ferramentas de analytics de terceiros. Se isso mudar no futuro, esta política será atualizada antes da mudança entrar em vigor.',
      ],
    },
    {
      heading: '7. Seus direitos',
      paragraphs: [
        'Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer momento: confirmação de que tratamos seus dados, acesso a eles, correção de dados incompletos ou desatualizados, exclusão, portabilidade, e revogação do consentimento dado no formulário.',
        'Para exercer qualquer um desses direitos, escreva para o e-mail no final desta página. Respondemos em até 15 dias.',
      ],
    },
    {
      heading: '8. Alterações nesta política',
      paragraphs: [
        'Podemos atualizar esta política eventualmente. Mudanças relevantes serão indicadas pela data no topo da página.',
      ],
    },
  ] as PrivacySection[],
  contact: {
    label: 'Dúvidas sobre esta política ou sobre seus dados:',
    email: 'nucleodigitalmendoncagalvao@gmail.com',
  },
} as const
