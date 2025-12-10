'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Determinar a dónde redirigir según el estado de autenticación y rol
    const token = authService.getToken();
    const user = authService.getUser();
    
    let redirectPath = '/login';
    
    if (token && user) {
      // Usuario autenticado - redirigir según rol
      const role = user.rol || (user as any).role;
      
      switch (role) {
        case 'admin':
        case 'admin_readonly':
          redirectPath = '/admin/dashboard';
          break;
        case 'jefe_especialidad':
          redirectPath = '/jefe/dashboard';
          break;
        case 'doctor':
          redirectPath = '/doctor/dashboard';
          break;
        case 'becado':
          redirectPath = '/becado/dashboard';
          break;
        default:
          redirectPath = '/login';
      }
    }

    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push(redirectPath);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [router]);

  const user = authService.getUser();
  const isAuthenticated = !!authService.getToken() && !!user;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-gray-300 mb-2">404</div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Página no encontrada
          </h1>
          <p className="text-gray-600">
            La página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg 
              className="w-8 h-8 text-blue-600 animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <p className="text-gray-500">
            Serás redirigido {isAuthenticated ? 'al dashboard' : 'al login'} en{' '}
            <span className="font-bold text-blue-600">{countdown}</span> segundos...
          </p>
        </div>

        <button
          onClick={() => {
            const user = authService.getUser();
            const token = authService.getToken();
            
            if (token && user) {
              const role = user.rol || (user as any).role;
              switch (role) {
                case 'admin':
                case 'admin_readonly':
                  router.push('/admin/dashboard');
                  break;
                case 'jefe_especialidad':
                  router.push('/jefe/dashboard');
                  break;
                case 'doctor':
                  router.push('/doctor/dashboard');
                  break;
                case 'becado':
                  router.push('/becado/dashboard');
                  break;
                default:
                  router.push('/login');
              }
            } else {
              router.push('/login');
            }
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Ir ahora
        </button>
      </div>
    </div>
  );
}
