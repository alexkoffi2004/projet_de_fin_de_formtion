"use client";

import ProtectedRoute from "@/components/auth/protected-route";
import { UserRole } from "@/types/user";

export default function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={UserRole.AGENT}>
      {children}
    </ProtectedRoute>
  );
} 