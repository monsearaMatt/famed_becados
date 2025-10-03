// components/LoginForm.tsx
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
      router.push('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-[#3FD0B6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100 min-h-[500px] flex flex-col justify-center"> 

      <div className="w-full max-w-lg space-y-8"> 
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-black   "> 
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-black">
            Ingresa a tu cuenta
          </p>
        </div>

        
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">

              <div>
                <label htmlFor="email" className="sr-only">
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
                  className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-corte-1 focus:border-corte-1 focus:z-10 text-sm"
                  placeholder="Correo electrónico"
                />
              </div>


              <div>
                <label htmlFor="password" className="sr-only">
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
                  className="relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-corte-1 focus:border-corte-1 focus:z-10 text-sm"
                  placeholder="Contraseña"
                />
              </div>
            </div>


            <div className="flex items-center justify-center">
            

              <div className="text-sm">
                <a href="#" className="font-medium text-corte-2 hover:text-corte-3 justify-center text-black">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>


            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-corte-1 hover:bg-corte-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-corte-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                <a href="/register" className="font-medium text-corte-1 hover:text-corte-2">
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
