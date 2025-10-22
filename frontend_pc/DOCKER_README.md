# 🐳 Frontend PC - Docker Setup

## Configuración de Docker

El frontend está configurado para correr en Docker usando Next.js en modo standalone.

## 📦 Estructura

```
frontend_pc/
├── Dockerfile           # Multi-stage build optimizado para Next.js
├── .dockerignore       # Archivos ignorados en el build
├── next.config.ts      # Configuración con output: 'standalone'
└── lib/
    └── auth.ts         # Configurado para usar variables de entorno
```

## 🚀 Levantar todo el stack

Desde la raíz del proyecto:

```bash
docker-compose up -d --build
```

Esto levantará:
- ✅ **frontend-pc** en `http://localhost:3001`
- ✅ **api-gateway** en `http://localhost:3000`
- ✅ **auth-service**
- ✅ **users-service**
- ✅ **postgres-db** en puerto 5432
- ✅ **mongo-db** en puerto 27017
- ✅ **nats** en puerto 4222

## 🔧 Variables de entorno

Crea un archivo `.env.local` (no se commitea):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📝 Comandos útiles

```bash
# Levantar todos los servicios
docker-compose up -d --build

# Ver logs del frontend
docker-compose logs -f frontend-pc

# Rebuild solo el frontend
docker-compose up -d --build frontend-pc

# Detener todo
docker-compose down

# Detener y limpiar volúmenes
docker-compose down -v

# Entrar al contenedor del frontend
docker exec -it frontend_pc sh
```

## 🌐 Acceso a los servicios

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend PC | http://localhost:3001 | Aplicación Next.js |
| API Gateway | http://localhost:3000 | Backend NestJS |
| API Login | http://localhost:3000/api/auth/login | Endpoint de login |
| PostgreSQL | localhost:5432 | Base de datos |
| MongoDB | localhost:27017 | Base de datos NoSQL |
| NATS | localhost:4222 | Message broker |

## 🔍 Troubleshooting

### El frontend no conecta al backend

Asegúrate de que:
1. El api-gateway esté corriendo: `docker-compose ps`
2. El puerto 3000 esté disponible
3. La variable `NEXT_PUBLIC_API_URL` apunte a `http://localhost:3000/api`

### Error "Cannot find module"

Rebuild limpio:
```bash
docker-compose down
docker-compose up -d --build
```

### El frontend no carga

Verifica logs:
```bash
docker-compose logs frontend-pc
```

### Cambios en el código no se reflejan

Rebuild el servicio:
```bash
docker-compose up -d --build frontend-pc
```

## 📁 Dockerfile explicado

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
# Instala solo dependencias de producción

# Stage 2: Builder  
FROM node:20-alpine AS builder
# Copia node_modules y hace el build de Next.js

# Stage 3: Runner
FROM node:20-alpine AS runner
# Imagen final optimizada con solo lo necesario
# Corre en modo standalone (servidor Node.js optimizado)
```

## 🔐 Notas de seguridad

- El frontend corre con usuario no-root (`nextjs:nodejs`)
- Solo expone el puerto 3001
- No incluye archivos de desarrollo en la imagen final
- Telemetría de Next.js deshabilitada

## 🎯 Próximos pasos

1. Configura variables de entorno en `.env.local`
2. Levanta el stack: `docker-compose up -d --build`
3. Accede a http://localhost:3001
4. Inicia sesión con las credenciales del README principal
