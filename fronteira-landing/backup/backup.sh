#!/bin/sh
# Dump diário do Postgres (§DEPLOY.md 3.3): grava local em /backups
# (volume fronteira_db_backups) e, se BACKUP_REMOTE estiver configurado,
# copia pra fora do servidor via rclone. Chamado pelo Coolify Scheduled
# Task, container `backup`.
set -eu
set -o pipefail  # sem isso, `pg_dump | gzip` "funciona" mesmo se o pg_dump falhar

TS=$(date -u +%Y%m%dT%H%M%SZ)
FILE="/backups/fronteira_${TS}.sql.gz"

mkdir -p /backups
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h db -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$FILE"
echo "dump local ok: $FILE ($(du -h "$FILE" | cut -f1))"

# Retenção local — os últimos 14 dias bastam; o histórico mais longo, se
# quiser, fica por conta do remoto (versionamento do bucket, por exemplo).
find /backups -name 'fronteira_*.sql.gz' -mtime +14 -delete

if [ -n "${BACKUP_REMOTE:-}" ]; then
  # --config /dev/null: força o rclone a usar só as env vars
  # RCLONE_CONFIG_<REMOTE>_* (ver DEPLOY.md 3.3), sem procurar arquivo de
  # config — assim não precisa persistir credencial em disco.
  rclone copy "$FILE" "$BACKUP_REMOTE" --config /dev/null
  echo "copiado para $BACKUP_REMOTE"
else
  echo "BACKUP_REMOTE não configurado — backup só local por enquanto (ver DEPLOY.md 3.3)."
fi
