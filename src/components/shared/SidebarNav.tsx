'use client';

import {
  Home,
  Users,
  FileText,
  Briefcase,
  Cuboid,
  GraduationCap,
  MessageSquare,
  ChevronDown,
  Settings,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/directory', label: 'Directory', icon: Users },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/jobs', label: 'Job Board', icon: Briefcase },
  { href: '/resources', label: 'Resources', icon: Cuboid },
  { href: '/learning', label: 'Learning', icon: GraduationCap },
  { href: '/feedback', label: 'Feedback', icon: MessageSquare },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 className="text-xl font-headline font-semibold text-primary-foreground group-data-[collapsible=icon]:hidden">
            BLR WORLD HUB
          </h1>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                isActive={pathname === item.href}
                className="w-full justify-start"
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.label}
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <Separator className="my-1 bg-primary/20" />
      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center p-2 rounded-md hover:bg-primary/10 cursor-pointer w-full text-left text-primary-foreground">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src="https://placehold.co/40x40.png"
                    alt="User avatar"
                    data-ai-hint="person face"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="font-semibold text-sm">John Doe</p>
                  <p className="text-xs text-primary-foreground/70">
                    john.doe@blr.com
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
