'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { isAdminOrManager, Role } from '@/lib/auth/roles';

const PUBLIC_ROUTES = ['/', '/welcome'];

function needsAdmin(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();

  const isPublic = useMemo(() => PUBLIC_ROUTES.includes(pathname), [pathname]);
  const adminRoute = useMemo(() => needsAdmin(pathname), [pathname]);

  useEffect(() => {
    if (loading) return;

    if (!isPublic && !user) {
      router.replace('/');
      return;
    }
    const currentRole = role as Role;
    if (adminRoute && !isAdminOrManager(currentRole)) {
      router.replace('/dashboard');
    }
  }, [loading, isPublic, user, adminRoute, role, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
      </div>
    );
  }

  if (!isPublic && !user) {
    return null; // redirecting
  }

  const currentRole = role as Role;
  if (adminRoute && !isAdminOrManager(currentRole)) {
    return null; // redirecting
  }

  return <>{children}</>;
}