#!/bin/sh
# Ponto de entrada do container (prod via Coolify e dev via docker-compose).
#
# Sem argumentos (caminho de produção, Coolify roda o Dockerfile "puro"):
# aplica as migrações e sobe o uvicorn de produção. Com argumentos (dev:
# docker-compose passa `command: [...--reload]`; ou `docker compose run api
# pytest`/`alembic ...`): executa exatamente o comando passado, sem aplicar
# migração automaticamente — preserva o fluxo manual já usado em dev/teste.
set -e

if [ "$#" -eq 0 ]; then
  alembic upgrade head
  exec uvicorn app.main:app --host 0.0.0.0 --port 8000
fi

exec "$@"
