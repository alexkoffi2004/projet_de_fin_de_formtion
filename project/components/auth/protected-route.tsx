"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/user';

interface ProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    // Check if user is authenticated
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Check if user has required role
    const userRole = session.user.role as UserRole;
    if (userRole !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      switch (userRole) {
        case UserRole.ADMIN:
          router.push('/admin/dashboard');
          break;
        case UserRole.AGENT:
          router.push('/agent/dashboard');
          break;
        case UserRole.CITIZEN:
          router.push('/citizen/dashboard');
          break;
        default:
          router.push('/auth/login');
      }
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [session, status, requiredRole, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
} 