'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { LocaleSwitcher } from './LocaleSwitcher';

const navConfig: Record<string, string> = {
  '/': 'Dashboard',
  '/directory': 'Directory',
  '/documents': 'Documents',
  '/jobs': 'Jobs',
  '/resources': 'Resources',
  '/learning': 'Learning',
  '/recognition': 'Recognition',
  '/wellbeing': 'Wellbeing',
  '/feedback': 'Feedback',
  '/admin': 'Admin',
  '/settings': 'Settings',
  '/leave': 'Leave',
  '/expenses': 'Expenses',
  '/timesheet': 'Timesheet',
};

export function Header() {
  const pathname = usePathname();
  const t = useTranslations('Header');
  
  // Clean up the pathname to match the navConfig keys
  const cleanPathname = pathname.replace(/^\/(en|ar)/, '') || '/';
  const pageKey = navConfig[cleanPathname] || 'Dashboard';

  const { role } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="hidden text-xl font-headline font-semibold md:block">
        {t(pageKey as any)}
      </h1>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      {role && (
        <span className="hidden sm:inline-flex items-center rounded-full border px-2 py-1 text-xs text-muted-foreground">
          {role}
        </span>
      )}
      <NotificationBell />
      <LocaleSwitcher />
    </header>
  );
}
