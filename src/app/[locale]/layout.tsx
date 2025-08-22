// src/app/[locale]/layout.tsx
import '../globals.css';
import { PT_Sans, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import ClientAppFrame from '@/components/shared/ClientAppFrame';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-grotesk',
});

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const bodyClass = cn('font-body antialiased', ptSans.variable, spaceGrotesk.variable);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={bodyClass}>
        <NextIntlClientProvider messages={messages}>
          <ClientAppFrame bodyClassName={bodyClass}>{children}</ClientAppFrame>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
