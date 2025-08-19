import './globals.css';
import { PT_Sans, Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';
import ClientAppFrame from '@/components/shared/ClientAppFrame';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClass = cn('font-body antialiased', ptSans.variable, spaceGrotesk.variable);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={bodyClass}>
        <ClientAppFrame bodyClassName={bodyClass}>{children}</ClientAppFrame>
      </body>
    </html>
  );
}