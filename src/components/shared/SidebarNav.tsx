
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
  Sparkles,
  Shield,
  Lightbulb,
  Award,
  FileSignature,
  CircleDollarSign,
  Heart,
  Book,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
import { getAuth } from 'firebase/auth';

const navConfig = {
    mainNav: [
      { href: '/dashboard', label: 'Dashboard', icon: Home },
      { href: '/directory', label: 'Directory', icon: Users },
      { href: '/skills', label: 'Skills Directory', icon: Lightbulb },
      { href: '/community', label: 'Community', icon: Award },
      { href: '/documents', label: 'Documents', icon: FileText },
      { href: '/policies', label: 'Policy Hub', icon: FileSignature },
      { href: '/jobs', label: 'Job Board', icon: Briefcase },
      { href: '/learning', label: 'Learning', icon: GraduationCap },
      { href: '/resources', label: 'Resources', icon: Cuboid },
      { href: '/expenses', label: 'Expenses', icon: CircleDollarSign },
      { href: '/recognition', label: 'Recognition', icon: Sparkles },
      { href: '/wellbeing', label: 'Wellbeing', icon: Heart },
      { href: '/feedback', label: 'Feedback', icon: MessageSquare },
    ],
    adminNav: [
        { href: '/admin', label: 'Admin', icon: Shield, roles: ['Admin', 'Manager'] },
    ]
}

export function SidebarNav() {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const handleLogout = async () => {
    await getAuth().signOut();
  };

  const renderNavItems = (items: typeof navConfig.mainNav) => {
    return items.map((item) => (
        <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className="w-full justify-start"
            tooltip={item.label}
            >
            <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                {item.label}
                </span>
            </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    ));
  }

  const filteredAdminNav = navConfig.adminNav.filter(item => item.roles.includes(role || ''));

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground">
            <Book className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-headline font-semibold text-primary-foreground group-data-[collapsible=icon]:hidden">
            BLR WORLD HUB
          </h1>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {renderNavItems(navConfig.mainNav)}
        {filteredAdminNav.length > 0 && (
            <>
                <Separator className="my-2" />
                {renderNavItems(filteredAdminNav)}
            </>
        )}
      </SidebarMenu>
      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center p-2 rounded-md hover:bg-primary/10 cursor-pointer w-full text-left text-primary-foreground">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.photoURL || "https://placehold.co/40x40.png"}
                    alt="User avatar"
                  />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="font-semibold text-sm">{user?.displayName}</p>
                  <p className="text-xs text-primary-foreground/70">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel>My Account ({role})</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
