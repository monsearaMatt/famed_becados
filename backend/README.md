<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# Ficha Académica FAMED — Backend (Monorepo)

Este repositorio contiene el backend para la plataforma de Seguimiento Académico de Especialidades Médicas (FAMED). El sistema está diseñado bajo una arquitectura de microservicios para garantizar escalabilidad, modularidad y separación de responsabilidades.

**Estado:** rama `feature/auth-microservice` (trabajo en progreso). Este README es una guía para desarrollar y arrancar el entorno local de desarrollo.

## Índice

- Descripción
- Arquitectura
- Microservicios
- Stack tecnológico
- Prerrequisitos
- Instalación rápida
- Variables de entorno
- Ejecución (local / Docker)
- Tests
- Estructura del proyecto
- Buenas prácticas y notas
- Posibles mejoras
- Licencia

## Descripción

El objetivo de este proyecto es proporcionar una plataforma que centralice y simplifique el seguimiento académico de los médicos becados de la Facultad de Medicina. La solución ofrece una "Ficha Académica Digital" accesible, segura y fácil de usar para becados y supervisores.

## Arquitectura

Proyecto organizado como un monorepo con múltiples aplicaciones NestJS (una por microservicio). La comunicación entre microservicios utiliza RPC a través de NATS. Cada servicio puede tener su propia base de datos según el tipo de datos y las necesidades:

- `api-gateway`: punto de entrada HTTP y WebSockets, enruta a microservicios.
- `auth-service`: gestión de usuarios, autenticación y roles (PostgreSQL).
- `fichas-service`: lógica principal de fichas académicas (MongoDB).
- `files-service`: almacenamiento y acceso a archivos (MinIO / S3).

## Microservicios y responsabilidades

Servicio | Responsabilidad | Base de Datos
--- | --- | ---
`api-gateway` | Enrutamiento HTTP/WS hacia microservicios | -
`auth-service` | Registro, login, perfiles, roles, JWT | PostgreSQL (TypeORM)
`fichas-service` | Procedimientos, evaluaciones, secciones y reglas de negocio | MongoDB (Mongoose)
`files-service` | Subida/descarga y gestión de archivos (evidencias) | MinIO (S3)

## Stack Tecnológico

- Framework: NestJS (TypeScript)
- Gestor de paquetes: PNPM
- Contenerización: Docker & Docker Compose
- Mensajería/RPC: NATS
- Real-time: WebSockets (Socket.IO)
- Autenticación: JWT y bcrypt
- Validación: `class-validator` / `class-transformer`
- ORMs/ODM: TypeORM (Postgres), Mongoose (MongoDB)

## Prerrequisitos

Instala estas herramientas:

- Node.js v18+ (recomendado)
- PNPM
- Docker y Docker Compose

## Instalación rápida

1. Clona el repositorio y entra en la carpeta `backend`:

```bash
git clone <URL_DEL_REPOSITORIO>
cd famed_becados/backend
```

2. Instala dependencias (monorepo):

```bash
pnpm install
```

3. Copia los ejemplos de variables de entorno a cada servicio que vayas a ejecutar y complétalos:

```bash
# Auth service
cp apps/auth-service/.env.example apps/auth-service/.env

# API Gateway (si aplica)
cp apps/api-gateway/.env.example apps/api-gateway/.env || true

# Fichas service (si existe)
cp apps/fichas-service/.env.example apps/fichas-service/.env || true

# Files service (si existe)
cp apps/files-service/.env.example apps/files-service/.env || true
```

Edita los `.env` generados con las credenciales y secretos adecuados.

## Variables de entorno (ejemplo)

Ejemplo mínimo para `auth-service`:

```dotenv
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_NAME=auth_db

# JWT
JWT_SECRET=UN_SECRETO_MUY_LARGO_Y_SEGURO_DE_AL_MENOS_32_CARACTERES
JWT_EXPIRATION=3600s

# NATS
NATS_URL=nats://localhost:4222
```

Cada servicio puede requerir variables adicionales (MinIO, Mongo, etc.). Consulta los `*.module.ts` y `ConfigModule` de cada app para ver todas las variables necesarias.

## Ejecución

Levanta la infraestructura necesaria (Postgres, MongoDB, NATS, MinIO) con Docker Compose:

```bash
docker compose up -d
```

Inicia los microservicios en modo desarrollo (una terminal por servicio):

```bash
# API Gateway
pnpm --filter api-gateway dev || pnpm --filter @famed/api-gateway dev || nest start api-gateway --watch

# Auth Service
pnpm --filter auth-service dev || pnpm --filter @famed/auth-service dev || nest start auth-service --watch
```

Nota: Ajusta los nombres de paquete (`--filter`) según los scripts y alias definidos en `package.json` del monorepo.

Ejecución en producción

Construye y ejecuta las apps dentro de contenedores o usa `pnpm build` y despliega el código compilado. La estrategia exacta depende del entorno de despliegue.

## Tests

Cada app puede tener pruebas unitarias y e2e bajo su carpeta `test/`. Ejecuta los scripts de test definidos en `package.json` o usa herramientas como `pnpm -w run test` para ejecutar en todo el monorepo (si está configurado).

Ejemplo (si existe script):

```bash
pnpm --filter auth-service test
```

## Estructura del proyecto

Carpeta principal `apps/` con subcarpetas por servicio:

- `apps/api-gateway/`
- `apps/auth-service/`
- `apps/fichas-service/`
- `apps/files-service/`

Otros archivos en la raíz `backend/`:

- `pnpm-lock.yaml`, `package.json` — dependencias y scripts
- `tsconfig.json`, `tsconfig.build.json` — configuración TypeScript
- `docker-compose.yml` — orquestación de infra externa

## Buenas prácticas y notas

- Centraliza DTOs y tipos en `libs/` si los microservicios comparten contratos.
- Usa `ConfigModule` para validación de variables de entorno y `class-validator` para DTOs.
- Mantén archivos `.env` fuera del control de versiones. Usa `.env.example` para documentar variables necesarias.
- Añade logs estructurados y métricas si el proyecto escalara a producción.

## Posibles mejoras / siguientes pasos

- Añadir ejemplos de `.env.example` faltantes en cada `apps/*`.
- Crear scripts en `package.json` para arrancar grupos de servicios (`dev:all`).
- Documentar contratos RPC (mensajes NATS) y ejemplos de uso.

## Licencia

Indica aquí la licencia del proyecto (por ejemplo: MIT). Si no se define, coordina con el equipo para escoger una.

---

Si quieres que agregue ejemplos de endpoints, snippets de Docker o documentación detallada por servicio (auth, fichas, files), dímelo y lo completo.
