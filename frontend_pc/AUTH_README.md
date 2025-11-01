# Sistema de Autenticación - Frontend

## 🚀 Configuración

El sistema de autenticación ya está implementado y conectado al backend que corre en `http://localhost:3000/api`.

## 📝 Cómo usar

### 1. Login

Para iniciar sesión, ve a `/Login` y usa las credenciales:

```json
{
  "email": "EmailDelUsuarioEn@LaBaseDe.datos",
  "password": "PasswordDelUsuario"
}
```

El sistema automáticamente:
- Enviará las credenciales al backend
- Guardará el token JWT en localStorage
- Guardará los datos del usuario en localStorage
- Redirigirá al área personal

### 2. Proteger rutas

Para proteger cualquier ruta, envuelve el contenido con el componente `ProtectedRoute`:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MiPaginaProtegida() {
  return (
    <ProtectedRoute>
      {/* Tu contenido aquí */}
    </ProtectedRoute>
  );
}
```

### 3. Usar el hook useAuth

En cualquier componente puedes acceder a la información del usuario:

```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function MiComponente() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  
  if (!isAuthenticated) return <div>No autenticado</div>;

  return (
    <div>
      <h1>Hola, {user?.nombre}!</h1>
      <p>Email: {user?.email}</p>
      <p>Rol: {user?.rol}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### 4. Llamar a endpoints protegidos

Para llamar a endpoints que requieren autenticación:

```tsx
import { authService } from '@/lib/auth';

async function fetchProtectedData() {
  const token = authService.getToken();
  
  const response = await fetch('http://localhost:3000/api/protected-endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
}
```

## 🔧 Funciones disponibles

### authService

```typescript
// Login
const data = await authService.login(email, password);

// Registro
const data = await authService.register({
  email,
  nombre,
  apellido,
  rut,
  password
});

// Verificar token
const data = await authService.verifyToken(token);

// Guardar autenticación
authService.saveAuth(data);

// Obtener token
const token = authService.getToken();

// Obtener usuario
const user = authService.getUser();

// Limpiar autenticación
authService.clearAuth();

// Verificar si está autenticado
const isAuth = authService.isAuthenticated();
```

### useAuth hook

```typescript
const {
  user,           // Usuario actual o null
  isLoading,      // true mientras verifica el token
  isAuthenticated, // true si hay usuario autenticado
  logout,         // Función para cerrar sesión
  checkAuth,      // Función para re-verificar autenticación
} = useAuth();
```

## 📂 Estructura de archivos

```
frontend_pc/
├── lib/
│   └── auth.ts              # Servicio de autenticación
├── hooks/
│   └── useAuth.ts           # Hook para usar autenticación
├── components/
│   └── ProtectedRoute.tsx   # Componente para proteger rutas
└── app/
    ├── Login/
    │   └── page.tsx         # Página de login (actualizada)
    └── Logout/
        └── page.tsx         # Página de perfil/logout (actualizada)
```

## 🔒 Flujo de autenticación

1. Usuario ingresa credenciales en `/Login`
2. Se envía POST a `http://localhost:3000/api/auth/login`
3. Backend retorna `{ user, token }`
4. Token y usuario se guardan en localStorage
5. Usuario es redirigido al área personal
6. En cada navegación, `useAuth` verifica el token automáticamente
7. Si el token expira o es inválido, se limpia y redirige a login

## ⚠️ Importante

- El token JWT incluye `iat` (issued at) que cambia en cada generación, esto es normal
- Los tokens expiran después de 6 horas (21600 segundos)
- El sistema verifica automáticamente el token al cargar cada página protegida
- Si el token expira, el usuario es redirigido automáticamente al login
