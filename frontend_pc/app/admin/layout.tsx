'use client';

import RoleProtectedRoute from '@/components/RoleProtectedRoute';

export default function AdminLayout({
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
