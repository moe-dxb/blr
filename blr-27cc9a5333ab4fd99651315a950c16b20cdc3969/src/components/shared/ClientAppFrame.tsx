'use client';

import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/shared/SidebarNav';
import { Header } from '@/components/shared/Header';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/hooks/useAuth';
import AuthGate from '@/components/shared/AuthGate';

export default function ClientAppFrame({
  children,
  bodyClassName,
}: {
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';
  const isWelcomePage = pathname === '/welcome';

  return (
    <AuthProvider>
      <div className={cn('min-h-screen', bodyClassName)}>
        <AuthGate>
          {isLoginPage || isWelcomePage ? (
            children
          ) : (
            <SidebarProvider>
              <Sidebar>
                <SidebarNav />
              </Sidebar>
              <SidebarInset>
                <Header />
                <div className="min-h-[calc(100vh-3.5rem)] p-4 lg:p-6">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          )}
        </AuthGate>
        <Toaster />
      </div>
    </AuthProvider>
  );
}