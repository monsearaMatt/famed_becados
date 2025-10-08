'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    

    try {
      console.log({ email, password });
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/Areapersonal'); // Cambiado a /Areapersonal
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-[#3FD0B6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100 min-h-[500px] flex flex-col justify-center w-full max-w-md"> 

        <div className="w-full space-y-8"> 
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-black"> 
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-sm text-black">
              Ingresa a tu cuenta
            </p>
          </div>

          
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-[#3FD0B6] text-sm"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3FD0B6] focus:border-[#3FD0B6] text-sm"
                    placeholder="Tu contraseña"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#3FD0B6] focus:ring-[#3FD0B6] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-[#3FD0B6] hover:text-[#35b8a0]">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-[#3FD0B6] hover:bg-[#35b8a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3FD0B6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <a href="/register" className="font-medium text-[#3FD0B6] hover:text-[#35b8a0]">
                    Regístrate
                  </a>
                </p>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}