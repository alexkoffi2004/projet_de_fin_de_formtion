"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import { UserRole } from "@/types/user";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      {children}
    </ProtectedRoute>
  );
} 