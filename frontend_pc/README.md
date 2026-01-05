# FAMED Frontend

Aplicación web para administración del sistema de becados médicos.

## Requisitos

- Node.js 20+
- Backend corriendo (ver `/AppBack/README.md`)

## Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

La aplicación estará disponible en **http://localhost:3000**

## Configuración

Crear archivo `.env.local`:

```env
# URL del backend (API Gateway)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Para producción, cambiar la URL al servidor donde esté desplegado el backend:
```env
NEXT_PUBLIC_API_URL=http://TU_IP_O_DOMINIO:8080
```

## Estructura de Páginas

```
app/
├── Login/           # Inicio de sesión
├── admin/           # Panel de administrador
│   ├── dashboard/   # Dashboard principal
│   ├── users/       # Gestión de usuarios
│   ├── specialties/ # Gestión de especialidades
│   ├── verificacion/# Verificación de actividades
│   └── exportar/    # Exportación de datos
├── jefe/            # Panel de jefe de especialidad
│   ├── areapersonal/# Área personal
│   ├── rubricas/    # Gestión de rúbricas
│   ├── cortes/      # Gestión de cohortes
│   └── verificacion/# Verificación de actividades
├── doctor/          # Panel de doctor (vista web)
└── Perfil/          # Perfil de usuario
```

## Roles y Acceso

| Rol | Acceso Web | Funcionalidades |
|-----|------------|-----------------|
| `admin` | ✅ | Control total |
| `admin_readonly` | ✅ | Solo lectura + exportación |
| `jefe_especialidad` | ✅ | Gestión de su especialidad |
| `doctor` | ❌ | Solo app móvil |
| `becado` | ❌ | Solo app móvil |

## Autenticación

El sistema usa JWT almacenado en localStorage. Para proteger rutas:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MiPagina() {
  return (
    <ProtectedRoute>
      {/* Contenido protegido */}
    </ProtectedRoute>
  );
}
```

Para restringir por rol:

```tsx
import RoleProtectedRoute from '@/components/RoleProtectedRoute';

export default function SoloAdmin() {
  return (
    <RoleProtectedRoute allowedRoles={['admin']}>
      {/* Solo admin */}
    </RoleProtectedRoute>
  );
}
```

## Docker

### Despliegue con Docker Compose (Recomendado)

```bash
# Primera vez o después de cambios en el código
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Rebuild sin caché

Si los cambios no se reflejan correctamente, fuerza un rebuild completo:

```bash
docker-compose build --no-cache
docker-compose up -d
```

### ¿Cuándo usar `--no-cache`?

Docker utiliza un sistema de capas para optimizar builds. Cuando ejecutas `docker-compose build`, Docker reutiliza capas cacheadas si detecta que los archivos no han cambiado. Sin embargo, hay casos donde el caché puede causar problemas:

| Situación | ¿Usar `--no-cache`? |
|-----------|---------------------|
| Actualizaste `package.json` | ✅ Sí |
| Cambiaste variables de entorno de build (`NEXT_PUBLIC_*`) | ✅ Sí |
| Modificaste el Dockerfile | ✅ Sí |
| Solo cambiaste código fuente | ❌ No necesario |

> **Nota:** El flag `--build` reconstruye la imagen si detecta cambios, pero puede usar capas cacheadas. El flag `--no-cache` ignora todo el caché y reconstruye desde cero.

### Build manual (alternativa)

```bash
docker build -t famed-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8080 famed-frontend
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm start` | Iniciar en producción |
| `npm run lint` | Verificar código |
