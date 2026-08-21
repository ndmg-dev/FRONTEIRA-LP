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

Nenhum segredo tem default de produção — sem `.env` preenchido a API não sobe
(`DATABASE_URL` é obrigatório).

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
