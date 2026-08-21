# Build multi-stage: compila a SPA e serve o estático via Nginx.
#
# IMPORTANTE: `VITE_API_BASE` é inlinada pelo Vite EM BUILD TIME, não em
# runtime — variáveis de ambiente comuns setadas só no container em produção
# NÃO têm efeito num app já buildado. No Coolify, configure `VITE_API_BASE`
# como *build argument* deste app (não apenas como env var de runtime).

FROM node:20-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 127.0.0.1, não "localhost": dentro do container o nginx só escuta em
# 0.0.0.0:80 (IPv4); "localhost" pode resolver primeiro para ::1 (IPv6) via
# /etc/hosts, e o wget do Alpine não cai pra IPv4 sozinho — o healthcheck
# falhava sempre, o container ficava "unhealthy" e o proxy parava de rotear
# pra ele ("no available server").
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1
