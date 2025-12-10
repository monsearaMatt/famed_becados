'use client';

import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { SpecialtyProvider } from '@/hooks/useSpecialty';

export default function JefeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedRoute>
      <SpecialtyProvider>
        {children}
      </SpecialtyProvider>
    </RoleProtectedRoute>
  );
}
