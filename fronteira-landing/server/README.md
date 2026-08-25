# Fronteira — backend de demonstração

API FastAPI que recebe as solicitações de demonstração do formulário da
landing (`POST /demo-requests`), persiste em PostgreSQL e dispara e-mail de
notificação ao time + auto-resposta ao lead. Ver
`../spec-landing-fronteira-backend.md` (§B) para a especificação completa.

## Rodando local (Docker)

```bash
cp .env.example .env      # preencha os valores reais
docker compose up -d db
docker compose run --rm api alembic upgrade head
docker compose up -d api
curl http://localhost:8000/health
```

A API sobe em `http://localhost:8000`; o front consome via `VITE_API_BASE`
(ver `.env.example` na raiz do projeto React).

## Migrações

```bash
docker compose run --rm api alembic upgrade head      # aplicar
docker compose run --rm api alembic downgrade -1       # reverter a última
docker compose run --rm api alembic revision -m "..."  # nova migração manual
```

## Testes

```bash
docker compose up -d db
docker compose run --rm api pytest
```

Os testes criam sozinhos um banco isolado (`fronteira_test`) na mesma
instância Postgres do `docker-compose.yml` — não usam o banco de
desenvolvimento e não tocam a rede (o `EmailSender` é substituído por um fake
via `app.dependency_overrides`).

## Variáveis de ambiente (§B.7)

| Env | Uso |
|---|---|
| `DATABASE_URL` | string de conexão Postgres (`postgresql+psycopg://...`) |
| `RESEND_API_KEY` | chave da API do Resend — vazio = e-mail vira no-op local |
| `EMAIL_FROM` | remetente das mensagens |
| `TEAM_INBOX` | destino da notificação interna |
| `IP_HASH_PEPPER` | segredo do hash de IP (nunca reaproveitar entre ambientes) |
| `ALLOWED_ORIGINS` | origens liberadas no CORS, separadas por vírgula |
| `RATE_LIMIT_PER_HOUR` | limite de submissões por `ip_hash` numa janela de 1h |
| `INTERNAL_API_TOKEN` | token exigido no header `X-Internal-Token` pelas rotas internas (`/internal/*`); vazio = rota sempre retorna 401 |
| `FOLLOWUP_BUSINESS_DAYS` | dias úteis após a criação do lead para disparar o follow-up (default `2`) |
| `ADMIN_USERNAME` | usuário do painel administrativo (`/admin/*`); vazio = login sempre retorna 401 |
| `ADMIN_PASSWORD_HASH` | hash bcrypt da senha do painel — gerar com `python -c "import bcrypt; print(bcrypt.hashpw(b'sua-senha', bcrypt.gensalt()).decode())"` (nunca gravar a senha em texto puro). Se o editor de env vars da plataforma de deploy corromper o `$` do hash (visto no Coolify — hash chegava truncado no container), cadastre em base64 em vez do valor bruto: `python -c "import base64; print(base64.b64encode(b'HASH_AQUI').decode())"` — `app/config.py` detecta e decodifica automaticamente |
| `ADMIN_JWT_SECRET` | segredo de assinatura do token de sessão do painel — gerar com `openssl rand -hex 32` |

Nenhum segredo tem default de produção — sem `.env` preenchido a API não sobe
(`DATABASE_URL` é obrigatório).

## Follow-up automático de leads

`POST /internal/send-followups` (header `X-Internal-Token: <INTERNAL_API_TOKEN>`)
varre `demo_requests` por leads com `status = "novo"` (ninguém do time mudou o
status), criados há pelo menos `FOLLOWUP_BUSINESS_DAYS` dias úteis, que ainda
não têm `followup_sent_at` preenchido — envia `lead_followup` (ver
`app/services/email/templates.py`) e marca `followup_sent_at`, o que torna a
chamada idempotente (rodar de novo no mesmo lead não reenvia).

Não há scheduler dentro do processo da API — o disparo é por um **cron
externo** (ex.: Scheduled Task do Coolify) chamando esse endpoint
periodicamente. Ver `../DEPLOY.md` para a configuração em produção.

Atualizar o `status` do lead (ex.: para `"contatado"`) interrompe o follow-up
automático para aquele lead. Isso agora tem uma rota própria — ver seção
abaixo — em vez de exigir acesso direto ao banco.

## Painel administrativo (`/admin/*`)

Login único (usuário/senha fixos via env, sem tabela de usuários — ver
`ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH` acima), sessão em JWT (`ADMIN_JWT_SECRET`,
expira em 12h). Rotas:

- `POST /admin/login` — `{username, password}` → `{token}`. Rate-limitado a
  10 tentativas/hora por `ip_hash` (mesmo limitador de `app/services/antispam.py`).
- `GET /admin/leads?status_filter=&page=` — lista paginada (50/página),
  requer `Authorization: Bearer <token>`.
- `PATCH /admin/leads/{id}/status` — `{status}` (`novo`/`contatado`/`fechado`/
  `perdido`), requer o mesmo header.
- `POST /admin/leads/{id}/resend-followup` — dispara manualmente o mesmo
  e-mail de `lead_followup` usado pelo cron (`/internal/send-followups`),
  sem checar status nem os dias úteis mínimos — é uma decisão explícita do
  time, então ignora as regras automáticas. Marca `followup_sent_at`.

O frontend consome essas rotas em `src/pages/Admin/` (rota `/admin` na SPA,
sem router — roteamento manual em `src/main.tsx` por `pathname`, code-split
via `React.lazy`). Token de sessão fica em `sessionStorage`, nunca em
`localStorage`. O Dashboard mostra origem (UTM/referrer), data do último
follow-up e um botão de reenvio manual por lead.

## Deliverability de e-mail (operação, fora do código)

Antes de apontar `EMAIL_FROM` para um domínio de produção, configure no DNS
desse domínio:

- **SPF** — autoriza o Resend a enviar em nome do domínio.
- **DKIM** — assina as mensagens; chave gerada no painel do Resend.
- **DMARC** — política de alinhamento SPF/DKIM (`p=quarantine` ou `p=reject`).

Sem os três, provedores de e-mail (Gmail, Outlook) tendem a marcar as
mensagens como spam ou rejeitá-las — isso não é resolvido por código, é
configuração de DNS do domínio remetente.

## Decisões em aberto herdadas do spec (§B.9)

1. Rate-limit em memória (1 instância). Escalar horizontalmente → trocar
   `app/services/antispam.py` por um limitador com Redis.
2. E-mail via `BackgroundTasks`, sem retry. Garantia de entrega → fila
   (`arq`/Celery).
3. Provedor de e-mail default: Resend. Trocar = nova implementação de
   `EmailSender` em `app/services/email/`.
4. Deploy: container Docker com `uvicorn` (este repo já provê `Dockerfile` +
   `docker-compose.yml`); orquestração de produção não definida aqui.
