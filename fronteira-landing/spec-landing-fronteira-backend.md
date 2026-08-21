# Spec de build — Etapa 2: backend + formulário vivo (Landing Fronteira)

Especificação para o **Claude Code** implementar a camada de contato real da
landing **Fronteira**: refinar o formulário para "respirar" e conectá-lo a um
backend **FastAPI + PostgreSQL** com notificação por e-mail.

**Fontes de verdade complementares (ler antes):**
`PROJECT-STATUS.md` (estado atual da SPA) e `spec-landing-fronteira.md` (spec
original). Onde este documento divergir de um palpite, este vence. Onde ele for
silente, `PROJECT-STATUS.md` manda.

> **Ponto de partida herdado:** o front já isola o envio em
> `src/lib/demo.ts → submitDemoRequest(payload)`. Essa é a costura por onde o
> backend entra. A UI de erro/sucesso já existe; esta etapa a torna *usada de
> verdade*.

---

## 0. Decisões já travadas (não reabrir)

1. **Backend:** micro-serviço **FastAPI** próprio (mesmo stack do produto).
2. **E-mail:** notificar o time **e** enviar auto-resposta ao lead (com protocolo).
3. **UX do formulário:** refinar a **view única** — pills segmentadas, validação
   viva e confirmação-protocolo. **Sem** multi-step.

---

## PARTE A — Frontend: o formulário que respira

Tudo abaixo respeita a arquitetura atual: copy em `src/lib/copy.ts`, motion em
`src/lib/motion.ts`, `LazyMotion features={domAnimation}`, tokens em
`tokens.css`, e o padrão de a11y já existente (`aria-invalid`,
`aria-describedby`, foco na confirmação). Todo motion condicionado a
`useReducedMotion()`.

### A.1 Evolução do contrato (`src/lib/demo.ts`)

O envio deixa de ser stub e passa a falar com o backend. O retorno cresce para
carregar o **protocolo**:

```ts
export type DemoRequestPayload = {
  name: string
  office: string
  email: string
  volume: 'ate-10' | '11-50' | '51-200' | 'mais-de-200'
  consent: boolean                 // A.5 (LGPD)
  // metadados coletados no client (A.6):
  utm?: Record<string, string>     // source/medium/campaign/term/content
  referrer?: string
  landingPath?: string
  // anti-spam (A.6):
  hp?: string                      // honeypot — deve chegar vazio
  renderedAt: number               // epoch ms de quando o form montou
}

export type DemoRequestResult = { protocol: string }

export async function submitDemoRequest(
  payload: DemoRequestPayload,
): Promise<DemoRequestResult> {
  const res = await fetch(`${import.meta.env.VITE_API_BASE}/demo-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (res.status === 422) throw new FieldValidationError(await res.json())
  if (res.status === 429) throw new RateLimitError()
  if (!res.ok) throw new SubmitError()
  return res.json() as Promise<DemoRequestResult>
}
```

`DemoForm.tsx` passa a consumir `result.protocol`. O branch `catch` — hoje
inalcançável — **agora importa**: mapear `FieldValidationError` para as mensagens
por campo (§5.1 do status), `RateLimitError` para um aviso amigável
(`demoForm.errors.rateLimit`) e o resto para o genérico `demoForm.errors.submit`
já existente. `VITE_API_BASE` vem de env (nunca hardcode).

### A.2 Volume como pills segmentadas (não `<select>`)

Trocar o `<select id="demo-volume">` por um grupo de 4 pills
(`role="radiogroup"`, cada pill um `role="radio"` navegável por seta,
`aria-checked`). Um indicador dourado desliza sob a opção ativa.

**Restrição técnica (importante):** `LazyMotion features={domAnimation}` **não**
inclui layout animations — `layoutId`/`layout` **não funcionam** aqui, e trocar
para `domMax` incharia o bundle que vocês escolheram enxuto. Então o indicador
desliza por **transform manual**: as 4 pills têm largura igual; o indicador é um
`m.div` com `width: 25%` e `transform: translateX(index * 100%)`, animado por
transição de `x` (spring suave). Zero dependência de layout feature.

### A.3 Validação que assenta

Validar **no blur** (não a cada tecla). Campo válido ganha um check dourado que
entra com spring (`resultPop` reaproveitável); campo inválido só marca o erro
após o blur ou no submit. Erro balança de leve (keyframes `x: [0,-4,4,-2,0]`),
**desligado** sob reduced-motion. Manter `aria-invalid`/`aria-describedby`.

### A.4 Botão como máquina de estados

`ocioso → enviando → enviado`. No submit: o label some, o botão encolhe para um
alvo circular com um pulso dourado enquanto o `fetch` está em voo; ao resolver,
um check SVG se desenha (`pathLength: 0 → 1` — animável em `domAnimation`) antes
de revelar a confirmação. Em erro, volta a `ocioso` e mostra a mensagem. Novo
variant em `motion.ts`: `submitButtonMachine` (aceita `reduced`).

### A.5 Confirmação-protocolo (o movimento-assinatura)

Trocar o card genérico de sucesso por um **protocolo** com o mesmo DNA visual da
`CalcMemory`: cabeçalho "Solicitação registrada", um **número de protocolo** em
destaque dourado, data/hora, e os dados ecoados em **IBM Plex Mono**
(escritório, e-mail, faixa de volume). Mantém `role="status"` e o foco
programático (`confirmationRef`) já existentes. O protocolo exibido é o
`result.protocol` **vindo do backend** — não gerar no client. Botão "Enviar
outra solicitação" permanece.

Copy nova em `copy.ts → demoForm.confirmation`: `title`, `protocolLabel`,
`fieldsLabels`, `note` (ex.: *"Enviamos uma cópia deste protocolo para o seu
e-mail. O time retorna em até 1 dia útil."*).

### A.6 Eco responsivo + coleta de metadados

- **Eco:** ao selecionar uma faixa de volume, uma linha viva aparece
  (`AnimatePresence`) com uma frase por faixa (`copy.ts → demoForm.echo`), ex.
  "mais-de-200" → *"A apuração em lote é o caso que mais te devolve tempo."*
  Texto curto, um por faixa, trocando com fade.
- **Metadados:** helper `collectMetadata()` em `src/lib/demo.ts` lê `utm_*` de
  `location.search`, `document.referrer`, `location.pathname`, e o `renderedAt`
  capturado no mount do form. Anexados ao payload no submit. Nada sensível além
  do que o usuário forneceu.

### A.7 Consentimento (LGPD) — novo campo obrigatório

Checkbox `demo-consent` (obrigatório) acima do botão, com texto curto +
link para a **Política de Privacidade** (`copy.ts → demoForm.consent`;
`href` como TODO se a política ainda não existir). Sem consentimento, o submit
é bloqueado no client (mensagem própria) e rejeitado no server. Enviar
`consent: true` no payload.

---

## PARTE B — Backend: micro-serviço FastAPI

### B.1 Estrutura (`server/`)

```
server/
├── app/
│   ├── main.py            # FastAPI, CORS, healthcheck, include router
│   ├── config.py          # pydantic-settings (env)
│   ├── db.py              # engine + SessionLocal (SQLAlchemy 2.x)
│   ├── models.py          # DemoRequest (ORM)
│   ├── schemas.py         # DemoRequestIn / DemoRequestOut (Pydantic v2)
│   ├── routes/demo.py     # POST /demo-requests, GET /health
│   ├── services/
│   │   ├── protocol.py    # geração do protocolo
│   │   ├── antispam.py    # honeypot, timing, rate-limit, ip_hash
│   │   └── email/
│   │       ├── base.py    # EmailSender (Protocol)
│   │       ├── resend.py  # implementação default
│   │       └── templates.py  # corpos pt-BR (time + lead)
│   └── deps.py            # get_db, get_settings, get_email_sender
├── alembic/               # migração inicial cria demo_requests
├── tests/                 # pytest: validação, honeypot, dedupe, rate-limit
├── pyproject.toml
└── .env.example
```

Stack: **FastAPI + SQLAlchemy 2.x + Alembic + PostgreSQL + pydantic-settings +
httpx** (para a API do provedor de e-mail). Sem ORM async obrigatório; síncrono
com `SessionLocal` basta neste volume.

### B.2 Modelo de dados — tabela `demo_requests`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `protocol` | `text` unique | público, ex. `FRT-2026-7QK3RA` (B.4) |
| `name` | `text` not null | |
| `office` | `text` not null | |
| `email` | `citext` not null | índice; usado no dedupe |
| `volume` | `text` not null | um dos 4 `value` |
| `utm` | `jsonb` null | source/medium/campaign/term/content |
| `referrer` | `text` null | |
| `landing_path` | `text` null | |
| `user_agent` | `text` null | do header |
| `ip_hash` | `text` null | **hash**, nunca IP cru (B.5) |
| `consent` | `boolean` not null | deve ser `true` |
| `consent_at` | `timestamptz` not null | |
| `status` | `text` not null default `'novo'` | `novo`→`contatado`→`qualificado`→`descartado` |
| `created_at` | `timestamptz` not null default now | |
| `updated_at` | `timestamptz` not null | |

Índices: `email`, `created_at` (dedupe/janela), unique em `protocol`.

### B.3 Endpoint `POST /demo-requests`

Ordem de processamento:

1. **Validação** (mirror das regras do client, §5.1 do status): campos
   obrigatórios, regex de e-mail, `volume` ∈ opções, `consent === true`. Falha
   → **422** com `{ field: message }` por campo (o client mapeia).
2. **Honeypot:** se `hp` não-vazio → tratar como spam: responder **200** com um
   protocolo *descartável* (não persistir, não enviar e-mail). Bot não distingue.
3. **Timing:** `now - renderedAt < 2000ms` (ou `> 6h`) → mesmo tratamento de
   spam do passo 2.
4. **Rate-limit** por `ip_hash`: acima de `RATE_LIMIT_PER_HOUR` → **429**.
5. **Idempotência:** se já existe registro com o mesmo `email` nos últimos
   ~10 min → **não** inserir de novo; retornar o `protocol` existente (**200**).
   Protege contra duplo-clique e reenvio.
6. **Persistir:** gerar `protocol`, gravar linha (com `user_agent`, `ip_hash`,
   `consent_at = now`).
7. **E-mail (assíncrono):** agendar via `BackgroundTasks` **após o commit** as
   duas mensagens (B.6). Nunca bloquear a resposta HTTP no e-mail.
8. **Responder 201** `{ "protocol": "FRT-2026-7QK3RA" }`.

`GET /health` → `{status:"ok"}` para probe de deploy.

### B.4 Geração de protocolo (`services/protocol.py`)

Formato `FRT-<ano>-<6 chars base32 Crockford>` (sem I/L/O/U para evitar
ambiguidade). **Aleatório**, não sequencial — um contador vazaria o volume de
leads e permitiria enumeração. Colisão é improvável; ainda assim, tratar o
`UniqueViolation` regerando uma vez.

### B.5 Anti-spam & privacidade (`services/antispam.py`)

- **`ip_hash`** = `sha256(ip + IP_HASH_PEPPER)` (pepper server-side em env).
  Guardar só o hash — habilita rate-limit e dedupe sem armazenar IP cru (LGPD).
- **Rate-limit:** contagem por `ip_hash` numa janela deslizante. In-memory
  (dict/`cachetools`) já resolve para 1 instância; se for escalar horizontal,
  trocar por Redis (decisão em aberto — B.9).
- **Honeypot + timing:** conforme B.3. Sem captcha por ora (custa a UX);
  reservar como upgrade se houver abuso.

### B.6 E-mail (`services/email/`)

Interface `EmailSender` (Protocol) com `send(to, subject, html, reply_to=None)`.
Implementação default **Resend** via `httpx` (`RESEND_API_KEY`). Trocar de
provedor = nova implementação; nada mais muda.

Duas mensagens, disparadas no `BackgroundTasks`:

- **Notificação ao time** → `TEAM_INBOX`. Assunto: `Nova demo · {office} ·
  {volume}`. Corpo: dados do lead + protocolo + UTM/referrer, e `reply_to` =
  e-mail do lead (o time responde direto). Texto pt-BR.
- **Auto-resposta ao lead** → e-mail do lead. Assunto: `Recebemos sua
  solicitação — {protocol}`. Corpo pt-BR: confirma o protocolo, diz que o time
  retorna em até 1 dia útil, tom sóbrio (público fiscal). `from` = `EMAIL_FROM`.

Falha de e-mail **não** derruba a requisição (o lead já está no Postgres, fonte
da verdade): logar e seguir. `BackgroundTasks` não tem retry — se quiserem
garantia de entrega, subir para fila (`arq`/Celery). **Decisão em aberto (B.9).**
Deliverability: configurar **SPF, DKIM e DMARC** no domínio remetente
(fora do código — nota de operação).

### B.7 Config & segurança (`config.py`, env)

| Env | Uso |
|---|---|
| `DATABASE_URL` | Postgres |
| `RESEND_API_KEY` | provedor de e-mail |
| `EMAIL_FROM` | remetente das mensagens |
| `TEAM_INBOX` | destino da notificação interna |
| `IP_HASH_PEPPER` | segredo do hash de IP |
| `ALLOWED_ORIGINS` | CORS — só a(s) origem(ns) da landing |
| `RATE_LIMIT_PER_HOUR` | inteiro |

`CORSMiddleware` restrito a `ALLOWED_ORIGINS` (nada de `*`). Segredos só no
servidor; o client conhece apenas `VITE_API_BASE`. Validar/normalizar todo input
no server, independentemente do client.

### B.8 Testes (`tests/`, pytest)

Cobrir: validação 422 por campo; `consent=false` rejeitado; honeypot preenchido
não persiste nem envia; timing curto barrado; dedupe por e-mail na janela;
rate-limit 429; protocolo único e no formato; e-mails agendados (com sender
fake/mock, sem rede). Banco de teste isolado.

### B.9 Decisões em aberto (defaults assumidos)

1. **Rate-limit store:** in-memory (default, 1 instância) × Redis (multi-instância).
2. **Confiabilidade de e-mail:** `BackgroundTasks` (default) × fila com retry.
3. **Provedor:** Resend (default) × Postmark.
4. **Onde roda o server:** container próprio junto ao produto × serviço separado.
   Não definido aqui; assumir container Docker com `uvicorn`.
5. **Política de Privacidade:** `href` do consentimento é TODO se a página ainda
   não existir.

---

## Critério de pronto (checklist)

**Frontend**
- [ ] `submitDemoRequest` fala com `POST /demo-requests`, retorna `{protocol}`,
      lê `VITE_API_BASE` de env; erros 422/429/rede mapeados na UI.
- [ ] Volume em pills (`radiogroup`) com indicador deslizante por transform
      (sem `layout`/`domMax`); navegável por teclado.
- [ ] Validação no blur, check dourado ao validar, shake em erro (off sob
      reduced-motion), `aria-invalid`/`aria-describedby` mantidos.
- [ ] Botão com máquina de estados ocioso→enviando→enviado (check por pathLength).
- [ ] Confirmação-protocolo no estilo `CalcMemory`, exibindo o protocolo do
      backend, com foco programático mantido.
- [ ] Eco por faixa de volume; `collectMetadata()` anexa UTM/referrer/path/renderedAt.
- [ ] Checkbox de consentimento obrigatório + nota/link de privacidade.
- [ ] Toda copy nova em `copy.ts`; todo motion novo em `motion.ts`; zero hex fora
      de `tokens.css`.

**Backend**
- [ ] FastAPI com `POST /demo-requests` e `GET /health`, CORS restrito.
- [ ] Migração Alembic cria `demo_requests` (B.2).
- [ ] Fluxo B.3 completo: validação, honeypot, timing, rate-limit, dedupe,
      persistência, e-mail assíncrono, 201 `{protocol}`.
- [ ] `ip_hash` (nunca IP cru); `consent`/`consent_at` gravados.
- [ ] Protocolo aleatório único no formato `FRT-AAAA-XXXXXX`.
- [ ] Notificação ao time (com `reply_to` do lead) + auto-resposta ao lead, ambas
      pt-BR, via `EmailSender` desacoplado; falha de e-mail não derruba a request.
- [ ] Segredos só em env; `.env.example` preenchido; nota de SPF/DKIM/DMARC.
- [ ] Testes de B.8 passando.