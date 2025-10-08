FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Builder que construye una aplicación específica
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm i -g pnpm
# ARG para recibir el nombre de la app a construir
ARG APP_NAME
RUN pnpm run build ${APP_NAME}

# Etapa final
FROM node:20-alpine
WORKDIR /usr/src/app
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist