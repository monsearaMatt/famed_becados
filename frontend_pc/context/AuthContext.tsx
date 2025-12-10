'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, LoginResponse } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (rut: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  handleTokenExpired: () => void;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'error' | 'success' | 'warning';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Toast component interno
function Toast({ show, message, type, onClose }: ToastState & { onClose: () => void }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md`}>
        <div className="flex-shrink-0">
          {type === 'error' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {type === 'warning' && (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-75">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'error' });
  const router = useRouter();

  const showToast = useCallback((message: string, type: ToastState['type'] = 'error') => {
    setToast({ show: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const handleTokenExpired = useCallback(() => {
    authService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    showToast('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.', 'warning');
    router.push('/login');
  }, [router, showToast]);

  const checkAuth = useCallback(async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const data = await authService.verifyToken(token);
      authService.saveAuth(data);
      setUser(data.user || null);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      // Si el token es inválido/expirado, limpiar pero no mostrar toast aquí
      // ya que puede ser la primera carga sin token válido
      authService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (rut: string, password: string) => {
    const data = await authService.login(rut, password);
    authService.saveAuth(data);
    setUser(data.user || null);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    authService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Exponer handleTokenExpired globalmente para el interceptor de fetch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__handleTokenExpired = handleTokenExpired;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__handleTokenExpired;
      }
    };
  }, [handleTokenExpired]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      checkAuth,
      handleTokenExpired
    }}>
      {children}
      <Toast {...toast} onClose={hideToast} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
