# Deploy no Coolify

Status: **em produção.** Este documento descreve o setup real que está rodando
— não um plano teórico. Se precisar recriar do zero (nova VPS, novo ambiente),
siga na ordem; se só precisar entender/depurar o que já existe, vá direto pro
§4 (Troubleshooting).

## Arquitetura

Um único **resource Docker Compose** no Coolify, a partir de
`fronteira-landing/docker-compose.prod.yml`, orquestrando 3 serviços juntos:
`db` (Postgres), `api` (FastAPI) e `web` (Nginx servindo a SPA). Não usamos o
Postgres nativo do Coolify — o banco vive dentro do próprio compose, num
volume nomeado (`fronteira_db_data`).

> **Tradeoff assumido:** sem backup automático de um clique (o que o Postgres
> nativo do Coolify teria). Como o banco guarda dado real de lead com
> consentimento LGPD, vale montar uma rotina própria de `pg_dump` — ainda não
> feito, ver §5.

| Serviço | Domínio | Repositório |
|---|---|---|
| `web` | `https://icmsfronteira.nucleodigital.cloud` | raiz do repo |
| `api` | `https://api.icmsfronteira.nucleodigital.cloud` | `server/` |
| `db` | (sem domínio, só interno) | — |

## 1. Configuração do resource no Coolify

- **+ New Resource → Docker Compose**, repo `ndmg-dev/FRONTEIRA-LP`, branch `main`.
- **Base Directory:** `/fronteira-landing` (o compose de produção fica dentro
  dessa pasta, não na raiz do repo — a raiz do repo ainda tem um `index.html`
  antigo da v1 estática, que não tem nada a ver com o app atual).
- **Docker Compose Location:** `/docker-compose.prod.yml` (relativo ao Base
  Directory acima).
- O Coolify detecta os 3 serviços automaticamente e mostra campos de
  **Domains for api** / **Domains for web** — preenche com as URLs da tabela
  acima, sempre com `https://` (ver gotcha no §4).

## 2. Variáveis de ambiente

Aba **Environment Variables** do resource, todas de uma vez (uma por linha):

```
POSTGRES_USER=fronteira
POSTGRES_PASSWORD=<gerar com: openssl rand -base64 24>
POSTGRES_DB=fronteira
RESEND_API_KEY=<chave da conta Resend — Resend → API Keys>
EMAIL_FROM=Fronteira <contato@icmsfronteira.nucleodigital.cloud>
TEAM_INBOX=<e-mail real que recebe notificação de cada lead>
IP_HASH_PEPPER=<gerar com: openssl rand -hex 32>
ALLOWED_ORIGINS=https://icmsfronteira.nucleodigital.cloud
RATE_LIMIT_PER_HOUR=20
VITE_API_BASE=https://api.icmsfronteira.nucleodigital.cloud
INTERNAL_API_TOKEN=<gerar com: openssl rand -hex 32>
FOLLOWUP_BUSINESS_DAYS=2
ADMIN_USERNAME=<usuário do painel /admin>
ADMIN_PASSWORD_HASH=<hash bcrypt — ver server/README.md § Painel administrativo>
ADMIN_JWT_SECRET=<gerar com: openssl rand -hex 32>
```

**`VITE_API_BASE` é build arg, não env var comum:** o Vite grava esse valor
dentro do JS na hora do `vite build`, não lê em runtime. Se precisar trocar a
URL da API, é redeploy (rebuild) do `web`, não só restart. O Coolify, em modo
Docker Compose, usa o mesmo bloco de Environment Variables pra alimentar tanto
`environment:` quanto `build.args:` do compose — não tem aba separada aqui.

**Toda edição de env var exige redeploy pra valer** — o processo já rodando
não relê o ambiente sozinho. Depois de salvar qualquer mudança nessa aba,
clique em **Redeploy** antes de testar.

### 2.1 Domínio verificado no Resend

Domínio verificado: `icmsfronteira.nucleodigital.cloud` (Resend → Domains).
Registros DNS (SPF/DKIM) adicionados na Hostinger, na zona de
`nucleodigital.cloud`. Status **Verified** — confirmar de vez em quando que
continua assim (Resend pode marcar como inválido se algum registro for
removido acidentalmente).

## 3. Migração de banco

Automática. `server/entrypoint.sh` roda `alembic upgrade head` antes de subir
o `uvicorn` sempre que o container `api` inicia **sem** comando sobrescrito —
que é como o Coolify chama a imagem em produção. Nada manual aqui.

## 3.1 Follow-up automático de leads (cron)

`POST /internal/send-followups` reenvia um e-mail de follow-up a todo lead
com `status = "novo"` criado há `FOLLOWUP_BUSINESS_DAYS` dias úteis ou mais
que ainda não recebeu follow-up (ver `server/README.md § Follow-up automático
de leads`). Não roda sozinho — precisa de um agendador batendo nesse endpoint
periodicamente.

No Coolify: **Scheduled Tasks** do resource → nova tarefa rodando dentro do
container `api`. A imagem (`python:3.12-slim`) não tem `curl`; use `python`
(já disponível, mesmo padrão do `HEALTHCHECK` do `Dockerfile`):

```
python -c "
import os, urllib.request
req = urllib.request.Request(
    'http://localhost:8000/internal/send-followups',
    method='POST',
    headers={'X-Internal-Token': os.environ['INTERNAL_API_TOKEN']},
)
urllib.request.urlopen(req, timeout=10)
"
```

Frequência sugerida: uma vez por dia útil, de manhã. O endpoint é idempotente
(marca `followup_sent_at` no lead) — rodar mais de uma vez no mesmo dia não
duplica envio.

## 3.2 Painel administrativo

`https://icmsfronteira.nucleodigital.cloud/admin` — ícone de cadeado discreto
no canto superior direito da landing também leva lá. Login com
`ADMIN_USERNAME`/senha (hash em `ADMIN_PASSWORD_HASH`, gerar conforme
`server/README.md`); lista os leads e permite mudar status
(novo/contatado/fechado/perdido). Ver `server/README.md § Painel
administrativo` para detalhe das rotas.

## 4. Troubleshooting — problemas reais já resolvidos

### "Bind for 0.0.0.0:8000/80 failed: port is already allocated"

O compose original publicava as portas dos serviços direto no host
(`ports: ["8000:8000"]`, `ports: ["80:80"]`). O proxy do Coolify (Traefik) já
ocupa 80/443 no host e roteia pelos domínios via rede interna do Docker — não
se deve publicar porta nenhuma pra fora. **Fix:** trocado `ports:` por
`expose:` no `docker-compose.prod.yml` (commit `e00a62b`).

### "no available server" no navegador (com domínio certo, HTTPS quebrado)

Sintoma: container rodando limpo nos logs, mas o proxy não roteava — e o
certificado TLS nunca foi emitido pro domínio `web`, só pro `api`.

Causa raiz: o `HEALTHCHECK` do `Dockerfile` do frontend usava
`wget http://localhost/`. Dentro do container, `localhost` podia resolver
para `::1` (IPv6) antes de `127.0.0.1`, e o nginx só escuta em `0.0.0.0:80`
(IPv4) — o `wget` do Alpine não cai pro IPv4 sozinho quando isso acontece.
Resultado: o healthcheck falhava **sempre**, o Docker marcava o container
como `unhealthy`, e o Traefik se recusa a rotear (e, no caso, também não
completou a emissão do certificado) pra um backend sem healthcheck OK.
**Fix:** trocado `http://localhost/` por `http://127.0.0.1/` no
`HEALTHCHECK` (commit `bee204c`). Confirmado localmente: `docker inspect
--format='{{.State.Health.Status}}'` foi de sempre-falhando pra `healthy`.

**Lição pra qualquer HEALTHCHECK futuro neste projeto:** nunca usar
`localhost` dentro de um container Alpine/Docker — sempre `127.0.0.1`
explícito (ou `::1` se o serviço realmente escutar em IPv6).

### E-mail não chega, mas o formulário confirma normalmente

Isso é esperado por design (§B.6 do spec de backend — falha de e-mail nunca
derruba a request), então o sintoma sozinho não diz muito. Diagnóstico, nessa
ordem:

1. **Resend → Logs.** Se aparecer "No logs yet" mesmo depois de testar o
   formulário, a chamada pra API do Resend **nem foi tentada** — geralmente
   `RESEND_API_KEY` vazia no ambiente do container (variável não setada no
   Coolify, ou setada só *depois* do container já estar rodando, sem
   redeploy — ver o aviso do §2). Se aparecer um log com erro (4xx/5xx), o
   problema é no valor de algum campo (e-mail de destino vazio/inválido,
   remetente de domínio não verificado, etc.) — o corpo do erro do Resend
   costuma dizer exatamente qual.
2. Conferir a aba Environment Variables do Coolify pra ver se `TEAM_INBOX`
   está preenchido (já aconteceu de ficar em branco sem querer).
3. Depois de qualquer correção de env var: **Save → Redeploy**, só então
   testar de novo.

### Editei o campo de domínio no Coolify e piorou

Os campos "Domains for api"/"Domains for web" devem sempre começar com
`https://`. Se você digitar `http://` ali (mesmo que só pra "testar sem
HTTPS"), o Coolify para de provisionar TLS/certificado pra aquele domínio —
teste alternativo de HTTP deve ser feito **na barra de endereço do
navegador**, nunca editando esse campo. Se isso acontecer, reverte pra
`https://`, Save, Redeploy.

## 5. Pendências conhecidas

- **Backup do Postgres:** nenhuma rotina automática hoje (ver tradeoff no
  topo). Considerar um cron simples de `pg_dump` pro volume ou pra storage
  externo antes de ter volume relevante de leads reais.
- **Política de Privacidade:** o link do checkbox de consentimento
  (`copy.ts → demoForm.consent.href`) ainda aponta pra `#`. Trocar quando a
  página existir.
- **Lighthouse em produção:** rodado só contra `localhost` durante o
  desenvolvimento — vale rodar de novo contra a URL pública (fontes/CORS
  mudam levemente os números).

## Desenvolvimento local não muda

`server/docker-compose.yml` continua sendo o jeito de rodar tudo localmente
(Postgres + API com `--reload`, migração manual via
`docker compose run api alembic upgrade head`, testes via
`docker compose run api pytest`) — nada disso foi alterado. O
`docker-compose.prod.yml` é só pro Coolify; o `entrypoint.sh` só ativa o
caminho automático de migração+start quando roda **sem** comando sobrescrito,
que é como o compose de dev já não roda (passa `--reload` explicitamente) e
como o Coolify em produção roda por padrão.
