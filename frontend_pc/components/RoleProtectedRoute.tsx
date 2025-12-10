'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Define role-based route access
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/admin': ['admin', 'admin_readonly'],
  '/jefe': ['jefe_especialidad'],
  '/doctor': ['doctor'],
  '/becado': ['becado'],
};

// Home routes per role
const HOME_ROUTES: Record<string, string> = {
  'admin': '/admin/dashboard',
  'admin_readonly': '/admin/dashboard',
  'jefe_especialidad': '/jefe/areapersonal',
  'doctor': '/doctor/dashboard',
  'becado': '/becado/dashboard'
};

// Public routes (no auth needed)
const PUBLIC_ROUTES = ['/login', '/'];

interface RoleProtectedRouteProps {
  children: React.ReactNode;
}

export default function RoleProtectedRoute({ children }: RoleProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Still loading, wait
    if (isLoading) return;

    // Public routes, allow access
    if (PUBLIC_ROUTES.includes(pathname)) {
      setIsAuthorized(true);
      return;
    }

    // Not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      setIsAuthorized(false);
      return;
    }

    // Check role-based access
    const userRole = user?.rol;
    if (!userRole) {
      router.push('/login');
      setIsAuthorized(false);
      return;
    }

    // Find which base route this path belongs to
    let hasAccess = true;
    for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathname.startsWith(routePrefix)) {
        if (!allowedRoles.includes(userRole)) {
          // User doesn't have access to this route, redirect to their home
          console.warn(`User with role ${userRole} tried to access ${pathname}. Redirecting to home.`);
          const homeRoute = HOME_ROUTES[userRole] || '/login';
          router.push(homeRoute);
          hasAccess = false;
        }
        break;
      }
    }

    setIsAuthorized(hasAccess);
  }, [isAuthenticated, isLoading, user, pathname, router]);

  // Loading state
  if (isLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3FD0B6] to-[#2A9D8F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// Export utilities for use in other components
export { HOME_ROUTES, ROUTE_PERMISSIONS };
