
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
import { getAuth } from "firebase-admin/auth";
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getAnnouncements() {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"), limit(4));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getTeamMembers(userName: string) {
    const q = query(collection(db, "users"), where("manager", "==", userName));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  let user;
  try {
    const decodedClaims = await getAuth().verifySessionCookie(sessionCookie?.value || '', true);
    user = {
      displayName: decodedClaims.name,
      email: decodedClaims.email,
      role: decodedClaims.role,
    };
  } catch(error) {
    redirect('/');
  }

  const announcements = await getAnnouncements();
  const teamMembers = (user.role === 'Admin' || user.role === 'Manager') ? await getTeamMembers(user.displayName) : [];

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
            <div className="text-2xl font-bold">12 Days</div>
            <p className="text-xs text-muted-foreground">Annual leave remaining</p>
            <Button variant="outline" className="mt-4 w-full">Request Leave</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">75% Complete</div>
             <p className="text-xs text-muted-foreground">Keep your profile updated</p>
             <Button variant="outline" className="mt-4 w-full">View Profile</Button>
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
             <Button variant="outline" className="mt-4 w-full">Open Directory</Button>
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
            {announcements.map((announcement: any) => (
                <div key={announcement.id} className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                    <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between">
                    <p className="font-semibold">{announcement.title}</p>
                    <p className="text-sm text-muted-foreground">{new Date(announcement.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
                </div>
            ))}
          </CardContent>
        </Card>

        {(user.role === 'Admin' || user.role === 'Manager') && (
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Team</CardTitle>
                <CardDescription>Your direct reporting team.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {teamMembers.map((member: any) => (
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
                    <Button variant="ghost" size="icon">
                    <ArrowRight className="h-4 w-4" />
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
