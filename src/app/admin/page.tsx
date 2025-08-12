
'use client';

import {
    Users,
    Car,
    CalendarDays,
    Clock,
    ShieldCheck
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
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

const AdminPage = () => {
    const { role } = useAuth();
    const isAdmin = role === 'Admin';

    const tabs = [
        { value: "user-management", label: "User Management", icon: Users, component: UserManagement, adminOnly: false },
        { value: "leave-balances", label: "Leave Balances", icon: ShieldCheck, component: LeaveBalanceManagement, adminOnly: true },
        { value: "vehicle-requests", label: "Vehicle Requests", icon: Car, component: BookingRequests, adminOnly: false },
        { value: "leave-requests", label: "Leave Requests", icon: CalendarDays, component: LeaveRequests, adminOnly: false },
        { value: "attendance-report", label: "Attendance", icon: Clock, component: AttendanceReport, adminOnly: false },
    ];

    const availableTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Admin Dashboard</CardTitle>
                    <CardDescription>
                        Manage users and moderate content across the portal.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Tabs defaultValue="user-management" className="w-full">
                <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
                    {availableTabs.map(({ value, label, icon: Icon }) => (
                        <TabsTrigger key={value} value={value}>
                            <Icon className="h-4 w-4 mr-2" />
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
}

export default AdminPage;
