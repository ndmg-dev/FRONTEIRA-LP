# Container dedicado só pra rodar o backup.sh via Coolify Scheduled Task —
# nunca serve tráfego, fica ocioso entre execuções (ver docker-compose.prod.yml).
FROM alpine:3.20

RUN apk add --no-cache postgresql16-client rclone gzip tzdata

COPY backup.sh /backup.sh
RUN chmod +x /backup.sh

CMD ["sleep", "infinity"]
