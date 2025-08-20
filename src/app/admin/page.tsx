'use client';

import {
  Users,
  Car,
  CalendarDays,
  Clock,
  ShieldCheck,
  FileText,
  ReceiptIcon,
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
import { BookingRequests } from './BookingRequests';
import { LeaveRequests } from './LeaveRequests';
import { AttendanceReport } from './AttendanceReport';
import { LeaveBalanceManagement } from './LeaveBalanceManagement';
import AnnouncementsAdmin from './AnnouncementsAdmin';
import SchedulesAdmin from './Schedules';
import AdminSettings from './AdminSettings';
import ExportEmployees from './ExportEmployees';
import PolicyEditor from './PolicyEditor';
import ExpenseClaimsAdmin from './ExpenseClaims';

const AdminPage = () => {
  const { role } = useAuth();

  const tabs = [
    { value: 'user-management', label: 'User Management', icon: Users, component: UserManagement, roles: ['Admin'] },
    { value: 'leave-balances', label: 'Leave Balances', icon: ShieldCheck, component: LeaveBalanceManagement, roles: ['Admin'] },
    { value: 'vehicle-requests', label: 'Vehicle Requests', icon: Car, component: BookingRequests, roles: ['Admin', 'Manager'] },
    { value: 'leave-requests', label: 'Leave Requests', icon: CalendarDays, component: LeaveRequests, roles: ['Admin', 'Manager'] },
    { value: 'expense-claims', label: 'Expense Claims', icon: ReceiptIcon, component: ExpenseClaimsAdmin, roles: ['Admin', 'Manager'] },
    { value: 'attendance-report', label: 'Attendance', icon: Clock, component: AttendanceReport, roles: ['Admin', 'Manager'] },
    { value: 'announcements', label: 'Announcements', icon: CalendarDays, component: AnnouncementsAdmin, roles: ['Admin'] },
    { value: 'policy-editor', label: 'Policies', icon: FileText, component: PolicyEditor, roles: ['Admin'] },
    { value: 'schedules', label: 'Schedules', icon: Clock, component: SchedulesAdmin, roles: ['Admin', 'Manager'] },
    { value: 'settings', label: 'Settings', icon: ShieldCheck, component: AdminSettings, roles: ['Admin'] },
    { value: 'export', label: 'Export', icon: ShieldCheck, component: ExportEmployees, roles: ['Admin'] },
  ] as const;

  const availableTabs = tabs.filter((tab) => (role ? tab.roles.includes(role as any) : false));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Admin & Manager</CardTitle>
          <CardDescription>Role-gated admin utilities. Managers see only team-scoped tools.</CardDescription>
        </CardHeader>
      </Card>
      <Tabs defaultValue={availableTabs[0]?.value} className="w-full">
        <TabsList className="flex w-full flex-wrap gap-2">
          {availableTabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {availableTabs.map(({ value, component: Component }) => (
          <TabsContent key={value} value={value}>
            <Component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminPage;