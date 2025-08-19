"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Users, Megaphone, ArrowRight } from "lucide-react";
import { ClockInOutCard } from './ClockInOutCard';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { app } from '@/lib/firebase/firebase';

// Define interfaces for our dashboard data to ensure type safety
interface Announcement {
    id: string;
    title: string;
    content: string;
    date: any; // Firestore timestamps can be complex, 'any' is a temporary safe bet
}

interface TeamMember {
    id: string;
    name: string;
    department: string;
}

interface DashboardData {
    announcements: Announcement[];
    teamMembers: TeamMember[];
    leaveBalance: number;
    profileCompletion: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && app) {
      const getDashboardData = httpsCallable<unknown, DashboardData>(getFunctions(app), 'getDashboardData');
      getDashboardData()
        .then(result => {
          setData(result.data as DashboardData);
        })
        .catch(err => {
            console.error("Error fetching dashboard data:", err);
            setError("Could not load dashboard. Please try again later.");
        })
        .finally(() => {
            setLoading(false);
        });
    } else if (!user) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-64">
            <p className="text-destructive">{error}</p>
        </div>
    );
  }

  if (!user || !data) {
    return null; // Or some other placeholder for a non-logged-in state
  }

  const { announcements, teamMembers, leaveBalance, profileCompletion } = data;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Welcome Back, {user.displayName}!</h1>
        <p className="text-muted-foreground">Here&apos;s your dashboard overview for today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ClockInOutCard />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveBalance} Days</div>
            <p className="text-xs text-muted-foreground">Annual leave remaining</p>
            <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/leave">Request Leave</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">{profileCompletion}% Complete</div>
             <p className="text-xs text-muted-foreground">Keep your profile updated</p>
             <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/settings">View Profile</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Directory</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">150+ Employees</div>
             <p className="text-xs text-muted-foreground">Connect with your colleagues</p>
             <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/directory">Open Directory</Link>
             </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5"/>
                <CardTitle className="font-headline">HR Announcements</CardTitle>
              </div>
            <CardDescription>Latest updates from the HR department.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between">
                    <p className="font-semibold">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground">{new Date(announcement.date._seconds * 1000).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
                </div>
            ))}
          </CardContent>
        </Card>

        {teamMembers && teamMembers.length > 0 && (
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Team</CardTitle>
                <CardDescription>Your direct reporting team.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.department}</p>
                    </div>
                    </div>
                    <Button asChild variant="ghost" size="icon">
                        <Link href={`/directory/user/${member.id}`}>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                ))}
            </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

// A skeleton loader to provide a better user experience while data is loading.
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
            </div>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-64 md:col-span-2" />
                <Skeleton className="h-64" />
            </div>
        </div>
    )
}