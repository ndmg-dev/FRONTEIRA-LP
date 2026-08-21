# Deploy no Coolify

Este repo é um monorepo: a landing (Vite/React) na raiz e a API (FastAPI) em
`server/`. No Coolify, cada pedaço vira um **resource** separado — é o jeito
mais simples de configurar e o que permite redeploy/rollback independentes.

Você vai criar **3 resources**:

1. **PostgreSQL** — banco gerenciado nativo do Coolify.
2. **fronteira-api** — aplicação Docker a partir de `server/Dockerfile`.
3. **fronteira-web** — aplicação Docker a partir de `Dockerfile` (raiz).

Domínios já criados na VPS (DNS apontando pro Coolify):

| Resource | Domínio |
|---|---|
| `fronteira-web` | `https://icmsfronteira.nucleodigital.cloud` |
| `fronteira-api` | `https://api.icmsfronteira.nucleodigital.cloud` |

---

## 1. Banco de dados

Coolify → **+ New Resource → Database → PostgreSQL** (16.x). Deixe o Coolify
gerar usuário/senha. Depois de criado, copie a **connection string interna**
(algo como `postgres://user:pass@<nome-do-serviço>:5432/postgres`) — é ela que
vai virar `DATABASE_URL` da API, só trocando o prefixo:

```
postgresql+psycopg://<user>:<pass>@<host-interno>:5432/<db>
```

(`postgresql+psycopg://`, não `postgres://` — é o driver que o SQLAlchemy usa
aqui.)

## 2. API (`fronteira-api`)

Coolify → **+ New Resource → Application → Dockerfile** apontando pro mesmo
repositório Git.

- **Base Directory:** `server` (crítico — é o que isola o build context da
  API do resto do monorepo; sem isso o Coolify tenta buildar a partir da raiz
  e não acha o `Dockerfile` certo).
- **Port:** `8000`.
- **Health check path:** `/health`.
- **Domínio:** `api.icmsfronteira.nucleodigital.cloud` (Coolify assina TLS via
  Let's Encrypt automaticamente).

**Variáveis de ambiente** (Coolify → aba Environment Variables desse
resource — runtime, não precisam de build arg):

| Variável | Valor |
|---|---|
| `DATABASE_URL` | a connection string do passo 1, já com `postgresql+psycopg://` |
| `RESEND_API_KEY` | chave da conta Resend (Resend → API Keys) |
| `EMAIL_FROM` | ver §2.1 abaixo — depende do domínio verificado no Resend |
| `TEAM_INBOX` | e-mail que recebe as notificações internas |
| `IP_HASH_PEPPER` | segredo aleatório novo — gere com `openssl rand -hex 32`, **nunca** reaproveite o de dev |
| `ALLOWED_ORIGINS` | `https://icmsfronteira.nucleodigital.cloud` |
| `RATE_LIMIT_PER_HOUR` | `20` (ajuste se precisar) |

### 2.1 Verificar o domínio no Resend

No painel do Resend → **Domains → Add Domain**. Recomendo verificar
`icmsfronteira.nucleodigital.cloud` mesmo (não precisa de outro subdomínio só
pra e-mail). O Resend vai gerar registros DNS específicos da sua conta —
adicione todos na zona DNS onde `nucleodigital.cloud` está gerenciado:

- **TXT** (SPF) — geralmente em `icmsfronteira.nucleodigital.cloud` ou
  `send.icmsfronteira.nucleodigital.cloud`, dependendo de como o Resend gerar.
- **CNAME** (DKIM) — 1 a 3 registros, prefixo tipo `resend._domainkey.*`.
- **TXT** (DMARC) — em `_dmarc.icmsfronteira.nucleodigital.cloud`, algo como
  `v=DMARC1; p=quarantine; rua=mailto:seu-email@...`.

Esses valores são únicos da sua conta — copie exatamente o que o Resend
mostrar na tela de verificação do domínio, não os invente. Depois de
propagar (minutos a poucas horas), o Resend marca o domínio como
**Verified** — só então `EMAIL_FROM` pode usar esse domínio.

Com o domínio verificado, `EMAIL_FROM` fica algo como:

```
Fronteira <contato@icmsfronteira.nucleodigital.cloud>
```

(ajuste a parte antes do `@` como preferir — `contato@`, `demo@`, etc.; o que
importa é o domínio bater com o que foi verificado no Resend.)

**Migração:** já é automática. O `entrypoint.sh` roda `alembic upgrade head`
antes de subir o `uvicorn` sempre que o container inicia sem override de
comando — que é exatamente como o Coolify chama a imagem. Nada a fazer manual
aqui além de garantir que `DATABASE_URL` está certo antes do primeiro deploy.

## 3. Frontend (`fronteira-web`)

Coolify → **+ New Resource → Application → Dockerfile**, mesmo repositório.

- **Base Directory:** `.` (raiz do repo).
- **Port:** `80`.
- **Domínio:** `icmsfronteira.nucleodigital.cloud`.

**Build argument** (não é env var runtime — no Coolify isso fica numa aba
separada, geralmente "Build Variables" ou dentro do bloco de build):

| Build arg | Valor |
|---|---|
| `VITE_API_BASE` | `https://api.icmsfronteira.nucleodigital.cloud` |

> **Isso é o detalhe que mais gente erra:** o Vite grava `VITE_API_BASE`
> dentro do JS já na hora do `vite build` — não existe leitura em runtime.
> Configurar isso como variável de ambiente comum do container **não tem
> nenhum efeito**; o bundle já foi gerado sem ela. Tem que ser build arg.
>
> Consequência prática: **toda vez que a URL da API mudar, o front precisa
> ser rebuildado** (redeploy no Coolify), não só reiniciado.

Confira que `ALLOWED_ORIGINS` da API bate exatamente com essa URL (sem barra
final, protocolo `https://` incluso) — CORS é estrito por design (§B.7 do
spec de backend); já deixei o valor certo na tabela acima.

## 4. Ordem recomendada do primeiro deploy

1. Sobe o Postgres, copia a connection string.
2. No Resend, adiciona o domínio `icmsfronteira.nucleodigital.cloud` e
   configura os registros DNS que ele pedir (SPF/DKIM/DMARC — §2.1). Pode
   levar de minutos a horas pra propagar; não bloqueia os próximos passos,
   só o envio de e-mail de verdade.
3. Sobe `fronteira-api` com as variáveis da tabela do passo 2 — confere
   `GET https://api.icmsfronteira.nucleodigital.cloud/health`.
4. Sobe `fronteira-web` com `VITE_API_BASE` = `https://api.icmsfronteira.nucleodigital.cloud`.
5. Testa o formulário ponta a ponta em `https://icmsfronteira.nucleodigital.cloud`.
6. Quando o Resend marcar o domínio como **Verified**, testa de novo e
   confere se a notificação interna e a auto-resposta chegaram de verdade
   (não só o `201`/protocolo na tela — isso já funciona mesmo sem o domínio
   verificado, o Resend só rejeita o envio real).

## 5. Antes de anunciar a URL pra alguém de verdade

- Confirmar que o domínio está **Verified** no Resend (painel mostra o status)
  — sem isso o e-mail cai em spam ou é rejeitado pelos grandes provedores.
- Trocar o `href="#"` do checkbox de consentimento (`copy.ts →
  demoForm.consent.href`) pela URL real da Política de Privacidade, quando
  ela existir.
- Rodar o Lighthouse contra a URL de produção (fontes/CORS mudam levemente
  os números medidos em localhost).

## Desenvolvimento local não muda

`server/docker-compose.yml` continua sendo o jeito de rodar tudo localmente
(Postgres + API com `--reload`, migração manual via
`docker compose run api alembic upgrade head`, testes via
`docker compose run api pytest`) — nada disso foi alterado. O `entrypoint.sh`
só ativa o caminho automático de migração+start quando roda **sem** comando
sobrescrito, que é como o `docker-compose.yml` de dev já não roda (ele passa
`--reload` explicitamente) e como o Coolify em produção roda por padrão.
