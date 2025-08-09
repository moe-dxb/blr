
'use client';

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { Header } from "@/components/shared/Header";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/hooks/useAuth";


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
      <head>
        <title>BLR WORLD HUB</title>
        <meta name="description" content="BLR WORLD HUB Employee Portal" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("font-body antialiased")}>
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
