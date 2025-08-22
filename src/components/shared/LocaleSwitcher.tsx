// src/components/shared/LocaleSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    router.replace(`/${newLocale}${pathname}`);
  };

  return (
    <Button variant="ghost" size="icon" onClick={switchLocale} title="Switch language">
      <Globe className="h-5 w-5" />
      <span className="sr-only">Switch language</span>
    </Button>
  );
}
