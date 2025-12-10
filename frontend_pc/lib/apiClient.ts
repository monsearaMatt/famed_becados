// API client con interceptor para manejar tokens expirados

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface FetchOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

/**
 * Cliente de API que maneja automáticamente la expiración de tokens.
 * Cuando recibe un 401, dispara la redirección al login con notificación.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuthRedirect, ...fetchOptions } = options;
  
  // Agregar token si existe
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Manejar token expirado
  if (response.status === 401 && !skipAuthRedirect) {
    const data = await response.json().catch(() => ({}));
    
    // Verificar si es específicamente por token expirado/inválido
    const isTokenError = 
      data.message?.toLowerCase().includes('token') ||
      data.message?.toLowerCase().includes('expirado') ||
      data.message?.toLowerCase().includes('expired') ||
      data.message?.toLowerCase().includes('jwt') ||
      data.message?.toLowerCase().includes('autenticación');

    if (isTokenError && typeof window !== 'undefined') {
      // Llamar al manejador global de token expirado
      const handler = (window as any).__handleTokenExpired;
      if (handler) {
        handler();
      } else {
        // Fallback: limpiar y redirigir manualmente
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    throw new Error(data.message || 'No autorizado');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}`);
  }

  return response.json();
}

/**
 * Métodos de conveniencia para las operaciones HTTP comunes
 */
export const apiClient = {
  get: <T = any>(endpoint: string, options?: FetchOptions) => 
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  put: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  patch: <T = any>(endpoint: string, body?: any, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  delete: <T = any>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
