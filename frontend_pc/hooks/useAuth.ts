'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verificar token con el backend
      const data = await authService.verifyToken(token);
      
      // Actualizar token y usuario
      authService.saveAuth(data);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      authService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/Login');
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    checkAuth,
  };
}
