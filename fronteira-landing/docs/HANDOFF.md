# Handoff — Landing Fronteira

> Documento de continuidade. Escrito ao final de uma sessão longa (build da
> landing do zero → backend → deploy em produção) pra quem retomar o projeto
> numa conversa nova não precisar reconstruir o contexto do zero. Complementa,
> não substitui, os outros docs do repo (lista no fim).

**Status em 2026-08-21:** em produção, funcionando ponta a ponta —
`https://icmsfronteira.nucleodigital.cloud` (landing) e
`https://api.icmsfronteira.nucleodigital.cloud` (API), formulário de
demonstração enviando e-mail de verdade.

---

## 1. O que é o projeto

**Fronteira** é um sistema fiscal (não um ERP genérico) especializado em
cálculo de ICMS-ST de fronteira e antecipação tributária a partir de XMLs de
NF-e, com confronto contra o extrato da SEFAZ. Este repositório **não é o
produto** — é a **landing page de vendas** dele. Job único da página: levar um
escritório de contabilidade a solicitar uma demonstração.

Comprador-alvo: escritórios de contabilidade / BPO fiscal que apuram muitas
empresas por competência.

Restrição de copy que percorre o projeto inteiro: o produto é portado e
testado, mas **sem homologação fiscal**. Nunca dizer "homologado", "aprovado
para produção", "100% preciso" ou prometer resultado fiscal específico. Isso
está espalhado pelas specs e pela implementação (`copy.ts`, disclaimer no
rodapé) — qualquer texto novo precisa respeitar essa regra.

## 2. Linha do tempo da sessão (3 etapas)

### Etapa 1 — Landing SPA (React + Vite + framer-motion)

Fonte de verdade: `spec-landing-fronteira.md`. Build do zero: scaffold Vite,
tokens de design (`src/styles/tokens.css`), toda a copy pt-BR
(`src/lib/copy.ts`), sistema de motion (`src/lib/motion.ts`), e uma seção por
componente (Nav, Hero+CalcMemory, Problem, HowItWorks, Differentiators,
TechBase, DemoCTA, Footer). Checklist do spec batido 100%: responsivo a
360px, `:focus-visible`, skip-link, `prefers-reduced-motion`, Lighthouse
100/100/100/100.

Depois do build inicial, três rodadas de refinamento visual pedidas pelo
usuário, todas aplicadas:
- **"Como funciona"** virou accordion de item único (era 3 cards estáticos) —
  `HowItWorks.tsx` + `FlowCard.tsx`, primeiro item aberto por padrão.
- **Nav** virou um menu-"pílula" flutuante (era barra full-bleed) — fundo
  translúcido leve no topo, mais opaco ao rolar.
- **Hover dos links da nav** ganhou sublinhado dourado animado + o texto
  assume peso 600 num pseudo-elemento sobreposto (CSS puro, não framer-motion).

Detalhe técnico que vale saber se for mexer em motion: a app roda inteira
dentro de `<LazyMotion features={domAnimation}>` (bundle enxuto). Esse
feature-set **não inclui** layout animations (`layoutId`/`layout`) nem a prop
`whileInView`. Onde precisaríamos de `whileInView`, existe um hook próprio —
`useRevealInView()` em `lib/motion.ts` — que usa `useInView` do framer-motion
e alimenta `animate` manualmente. Onde um layoutId serviria (indicador das
pills de volume, por exemplo), a solução foi transform manual — ver §3.

Ver `PROJECT-STATUS.md` pra tabela completa de todo export de `copy.ts`, toda
decisão de arquitetura, e o inventário de arquivos — não duplicado aqui.

### Etapa 2 — Backend (FastAPI + PostgreSQL) + formulário vivo

Fonte de verdade: `spec-landing-fronteira-backend.md`. Formulário deixou de
ser um stub e passou a falar com um backend de verdade.

**Frontend** (`src/lib/demo.ts`, `src/components/DemoCTA/*`):
- Volume trocou de `<select>` pra **pills segmentadas** (`role="radiogroup"`)
  com indicador dourado que desliza — como `domAnimation` não tem layout
  animation, o indicador é um `m.div` com `x: index * 100%` calculado à mão
  (`pillIndicatorX` em `lib/motion.ts`), não `layoutId`.
- Validação **no blur** (não a cada tecla), check dourado em spring nos
  campos válidos, shake leve nos inválidos (desligado sob reduced-motion).
- Botão do form é uma máquina de estados ocioso→enviando→enviado
  (`SubmitButton.tsx`): encolhe pra um alvo circular (largura medida via ref,
  não `layout`), pulso dourado em CSS puro, check desenhado por `pathLength`.
- Confirmação de sucesso é um "protocolo" com o mesmo DNA visual do
  `CalcMemory` do hero (`ProtocolConfirmation.tsx`) — mostra o protocolo que
  **vem do backend**, nunca gerado no client.
- `collectMetadata()` lê `utm_*`, referrer e path; honeypot + `renderedAt`
  (timestamp de quando o form montou) vão junto no payload pro backend
  cruzar contra spam.
- Checkbox de consentimento (LGPD) obrigatório — link da Política de
  Privacidade ainda é `href="#"` (TODO deliberado, página não existe).

**Backend** (`server/`, Python 3.12 — não o 3.14 do host Windows, que não
tinha wheels prontas pra `psycopg`, por isso tudo roda em container):
- FastAPI + SQLAlchemy 2 + Alembic + PostgreSQL + Resend (via `httpx`).
- `POST /demo-requests` segue uma ordem estrita: validação (pydantic, com um
  exception handler custom que reformata erro em `{campo: mensagem}` pt-BR)
  → honeypot → timing (rejeita se `renderedAt` for < 2s ou > 6h atrás) →
  rate-limit por `ip_hash` (nunca IP cru — sha256 com pepper) → dedupe por
  e-mail numa janela de 10min → persiste → agenda e-mail via
  `BackgroundTasks` (depois do commit) → `201 {protocol}`.
- Protocolo: `FRT-<ano>-<6 chars>`, alfabeto Crockford (sem I/L/O/U),
  aleatório (não sequencial, pra não vazar volume de leads).
- `EmailSender` é uma interface (`Protocol` do Python) — implementação
  default é Resend; trocar de provedor é só escrever outra classe.
- 16 testes automatizados (pytest), banco de teste isolado que se
  autoprovisiona (`tests/conftest.py` cria o database `fronteira_test` se não
  existir). Rodar com `docker compose run api pytest` dentro de `server/`.

Ver `server/README.md` pra como rodar localmente e a tabela de env vars.

### Etapa 3 — Deploy em produção (Coolify numa VPS)

Decisão do usuário: **um único resource Docker Compose** no Coolify
(`fronteira-landing/docker-compose.prod.yml`), orquestrando `db` + `api` +
`web` juntos — não o Postgres nativo do Coolify nem resources separados (que
era minha recomendação inicial; o usuário preferiu manter tudo declarativo
num compose versionado, tradeoff aceito: sem backup automático de 1 clique).

Domínios (Hostinger, zona DNS de `nucleodigital.cloud`):
- `icmsfronteira.nucleodigital.cloud` → frontend
- `api.icmsfronteira.nucleodigital.cloud` → API

E-mail via Resend, domínio `icmsfronteira.nucleodigital.cloud` **verificado**
(SPF+DKIM configurados na Hostinger).

Repositório: `https://github.com/ndmg-dev/FRONTEIRA-LP` (branch `main`).
Atenção: o **repo git é a pasta `FRONTEIRA_LP` inteira** (um nível acima de
`fronteira-landing/`), não só o projeto React — por isso todo path do Coolify
usa Base Directory `/fronteira-landing`.

Dois bugs reais apareceram no primeiro deploy e foram corrigidos (documentado
com mais detalhe, incluindo como diagnosticar de novo se acontecer algo
parecido, em `DEPLOY.md` §4 — Troubleshooting):

1. **Conflito de porta.** O compose publicava `8000`/`80` direto no host
   (`ports:`), mas o proxy do Coolify (Traefik) já ocupa essas portas. Fix:
   trocado pra `expose:` (commit `e00a62b`).
2. **Healthcheck do frontend sempre falhando.** `wget http://localhost/`
   dentro do container Alpine podia resolver `localhost` pra `::1` (IPv6)
   antes de `127.0.0.1`, onde o nginx não escuta — container ficava marcado
   `unhealthy` e o Traefik parava de rotear ("no available server" no
   navegador, mesmo com o container rodando limpo nos logs). Fix: `wget`
   aponta pra `127.0.0.1` explícito (commit `bee204c`). **Lição geral pro
   projeto:** nunca usar `localhost` em `HEALTHCHECK` dentro de container.

Outros dois "quase-bugs" que eram só operação (sem código envolvido):
- Editar o campo de domínio no Coolify pra `http://` (achando que testaria
  "sem HTTPS") na verdade desliga o provisionamento de certificado pra aquele
  domínio — teste de HTTP puro deve ser feito na barra de endereço do
  navegador, não editando esse campo.
- Variável de ambiente só passa a valer depois de um **Redeploy** — editar e
  salvar sozinho não reinicia o container. Isso mascarou por um tempo o
  `TEAM_INBOX` vazio (e-mail não chegava, sem erro visível).

## 3. Decisões de arquitetura que valem lembrar

- **Zero hex fora de `src/styles/tokens.css`** — regra dura desde a Etapa 1,
  mantida em todo componente novo.
- **Toda copy em `src/lib/copy.ts`, todo motion em `src/lib/motion.ts`** —
  nunca hardcoded em JSX nem transição solta num componente.
- **`domAnimation`, não `domMax`** — decisão consciente de bundle size.
  Qualquer necessidade de layout animation daqui pra frente deve resolver por
  transform manual (como as pills) ou hook próprio (como `useRevealInView`),
  não trocar pra `domMax` sem repensar.
- **`VITE_API_BASE` é build-time, não runtime.** Vite grava esse valor no JS
  na hora do `vite build` — mudar a URL da API sempre exige rebuild do
  front, nunca só restart. Isso é comum esquecer.
- **Backend síncrono (SQLAlchemy sync + FastAPI sync routes), sem ORM async**
  — decisão deliberada do spec pelo volume esperado; não é uma limitação
  técnica, é escolha de simplicidade.

## 4. Pendências conhecidas (nada bloqueante)

- **Backup do Postgres** — sem rotina automática hoje (tradeoff de não usar
  o Postgres nativo do Coolify). Considerar `pg_dump` agendado antes de ter
  volume relevante de leads reais.
- **Política de Privacidade** — `copy.ts → demoForm.consent.href` aponta pra
  `#`. Trocar quando a página existir.
- **Lighthouse em produção** — só foi rodado contra `localhost` durante o
  desenvolvimento; vale rodar de novo contra a URL pública.
- Mudança não commitada em `server/app/deps.py` (uma linha em branco,
  provavelmente auto-format do editor) — inofensiva, mas ainda não tem
  commit. Decidir se commita ou descarta antes da próxima sessão.

## 5. Onde cavar mais fundo

| Arquivo | O que tem |
|---|---|
| `spec-landing-fronteira.md` | Spec original da landing (tokens, copy, motion, hero-assinatura) |
| `spec-landing-fronteira-backend.md` | Spec do backend + formulário vivo |
| `PROJECT-STATUS.md` | Inventário completo do frontend: árvore de arquivos, tabela de todo export de `copy.ts`, decisões fora do spec |
| `server/README.md` | Como rodar o backend localmente, tabela de env vars, nota de SPF/DKIM/DMARC |
| `DEPLOY.md` | Guia de deploy no Coolify + troubleshooting detalhado dos dois bugs de produção |

## 6. Segredos — nunca aqui

Nenhum valor real (chave do Resend, senha do Postgres, `IP_HASH_PEPPER`,
etc.) está neste arquivo nem em nenhum outro do repo — todos vivem só nas
variáveis de ambiente do Coolify. Se precisar deles numa sessão nova, peça
pro usuário conferir direto no painel do Coolify (aba Environment Variables
do resource) ou no cofre de senhas onde ele guardou.
