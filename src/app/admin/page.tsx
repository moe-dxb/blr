'use client';

import {
  Users,
  CalendarDays,
  Clock,
  ShieldCheck,
  FileText,
  Upload,
  Shuffle, // CORRECTED: Replaced 'Replace' with the valid 'Shuffle' icon
  Megaphone,
  BookOpen
} from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

import { UserManagement } from './UserManagement';
import { LeaveRequests } from './LeaveRequests';
import { AttendanceReport } from './AttendanceReport';
import { LeaveBalanceManagement } from './LeaveBalanceManagement';
import AnnouncementsAdmin from './AnnouncementsAdmin';
import SchedulesAdmin from './Schedules';
import AdminSettings from './AdminSettings';
import { BulkAssignManagers } from './BulkAssignManagers';
import { ExportData } from './ExportData';
import PolicyEditor from './PolicyEditor';
import ExpenseClaimsAdmin from './ExpenseClaims';

const AdminPage = () => {
  const { role } = useAuth();

  const tabs = [
    { value: 'user-management', label: 'Users', icon: Users, component: UserManagement, roles: ['Admin'] },
    { value: 'leave-balances', label: 'Leave Balances', icon: ShieldCheck, component: LeaveBalanceManagement, roles: ['Admin'] },
    { value: 'leave-requests', label: 'Leave Requests', icon: CalendarDays, component: LeaveRequests, roles: ['Admin', 'Manager'] },
    { value: 'expense-claims', label: 'Expenses', icon: FileText, component: ExpenseClaimsAdmin, roles: ['Admin', 'Manager'] },
    { value: 'attendance', label: 'Attendance', icon: Clock, component: AttendanceReport, roles: ['Admin', 'Manager'] },
    { value: 'announcements', label: 'Announcements', icon: Megaphone, component: AnnouncementsAdmin, roles: ['Admin'] },
    { value: 'policies', label: 'Policies', icon: BookOpen, component: PolicyEditor, roles: ['Admin'] },
    { value: 'schedules', label: 'Schedules', icon: Clock, component: SchedulesAdmin, roles: ['Admin', 'Manager'] },
    { value: 'bulk-assign', label: 'Bulk Assign', icon: Shuffle, component: BulkAssignManagers, roles: ['Admin'] },
    { value: 'export', label: 'Export', icon: Upload, component: ExportData, roles: ['Admin'] },
    { value: 'settings', label: 'Settings', icon: ShieldCheck, component: AdminSettings, roles: ['Admin'] },
  ] as const;

  const availableTabs = tabs.filter((tab) => (role ? tab.roles.includes(role as any) : false));

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Admin Dashboard</CardTitle>
          <CardDescription>
            Manage users, review requests, and configure the portal.
          </CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue={availableTabs[0]?.value} className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-start">
          {availableTabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex-shrink-0">
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {availableTabs.map(({ value, component: Component }) => (
          <TabsContent key={value} value={value} className="mt-4">
            <Component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminPage;
