'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/directory', label: 'Company Directory' },
  { href: '/documents', label: 'Document Repository' },
  { href: '/jobs', label: 'Internal Job Board' },
  { href: '/resources', label: 'Resource Booking' },
  { href: '/learning', label: 'Learning & Development' },
  { href: '/recognition', label: 'Peer Recognition' },
  { href: '/feedback', label: 'Feedback & Suggestions' },
];

export function Header() {
  const pathname = usePathname();
  const currentPage = navItems.find((item) => pathname.startsWith(item.href)) || {
    label: 'Dashboard',
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <h1 className="hidden text-xl font-headline font-semibold md:block">
        {currentPage.label}
      </h1>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
    </header>
  );
}
