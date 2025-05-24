"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import { UserRole } from "@/types/user";
import { SessionProvider } from "next-auth/react";

export default function CitizenDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ProtectedRoute requiredRole={UserRole.CITIZEN}>
        {children}
      </ProtectedRoute>
    </SessionProvider>
  );
} 