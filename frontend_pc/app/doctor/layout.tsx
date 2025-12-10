'use client';

import RoleProtectedRoute from '@/components/RoleProtectedRoute';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProtectedRoute>
      {children}
    </RoleProtectedRoute>
  );
}
