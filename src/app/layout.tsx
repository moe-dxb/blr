
'use client';

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { Header } from "@/components/shared/Header";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/hooks/useAuth";
import { PT_Sans, Space_Grotesk } from 'next/font/google';

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
  const pathname = usePathname();
  const isLoginPage = pathname === "/";
  const isWelcomePage = pathname === "/welcome";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-body antialiased", ptSans.variable, spaceGrotesk.variable)}>
        <AuthProvider>
            {isLoginPage || isWelcomePage ? (
            children
            ) : (
            <SidebarProvider>
                <Sidebar>
                <SidebarNav />
                </Sidebar>
                <SidebarInset>
                <Header />
                <div className="min-h-[calc(100vh-3.5rem)] p-4 lg:p-6">
                    {children}
                </div>
                </SidebarInset>
            </SidebarProvider>
            )}
            <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
