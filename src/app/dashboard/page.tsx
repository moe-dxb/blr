
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, limit, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ArrowRight, Calendar, User, Users, Megaphone, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Announcement {
    id: string;
    title: string;
    date: string;
    content: string;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    hint?: string;
}

interface AttendanceEvent {
    userId: string;
    type: 'clock-in' | 'clock-out';
    timestamp: any;
}

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState({
      announcements: true,
      team: true,
      attendance: true,
  });
  const [clockInState, setClockInState] = useState<{status: 'out' | 'in', time: string}>({status: 'out', time: '--:--'});
  const [isClocking, setIsClocking] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user) return; // Don't fetch data if user is not logged in

    // --- Real-time listener for Announcements ---
    const announcementsCollection = collection(db, "announcements");
    const qAnnounce = query(announcementsCollection, orderBy("date", "desc"), limit(4));
    const unsubscribeAnnouncements = onSnapshot(qAnnounce, (snapshot) => {
        const announcementList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(announcementList);
        setLoading(prev => ({...prev, announcements: false}));
    }, (error) => {
        console.error("Error fetching announcements:", error);
        setLoading(prev => ({...prev, announcements: false}));
    });

    // --- Real-time listener for Team Members (only for Managers/Admins) ---
    let unsubscribeTeam = () => {};
    if (role === 'Admin' || role === 'Manager') {
        const usersCollection = collection(db, "users");
        const qTeam = query(usersCollection, where("manager", "==", user.displayName));
        unsubscribeTeam = onSnapshot(qTeam, (snapshot) => {
            const teamList = snapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    name: data.name,
                    role: data.department,
                    avatar: `https://placehold.co/40x40.png`,
                    hint: 'person face'
                };
            });
            setTeamMembers(teamList);
            setLoading(prev => ({...prev, team: false}));
        }, (error) => {
            console.error("Error fetching team members:", error);
            setLoading(prev => ({...prev, team: false}));
        });
    } else {
        setLoading(prev => ({...prev, team: false}));
    }

    // --- Real-time listener for Attendance ---
    const attendanceCollection = collection(db, 'attendance');
    const qAttendance = query(attendanceCollection, where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(1));
    const unsubscribeAttendance = onSnapshot(qAttendance, (snapshot) => {
        if (!snapshot.empty) {
            const lastEvent = snapshot.docs[0].data() as AttendanceEvent;
            const eventTime = lastEvent.timestamp?.toDate()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || new Date().toLocaleTimeString();
            setClockInState({ status: lastEvent.type === 'clock-in' ? 'in' : 'out', time: eventTime });
        } else {
             setClockInState({ status: 'out', time: 'Not clocked in' });
        }
        setLoading(prev => ({...prev, attendance: false}));
    }, (error) => {
        console.error("Error fetching attendance:", error);
        setLoading(prev => ({...prev, attendance: false}));
    });


    // Cleanup subscriptions on unmount
    return () => {
        unsubscribeAnnouncements();
        unsubscribeTeam();
        unsubscribeAttendance();
    };
  }, [user, role]);

  const handleClockInOut = async () => {
    if (!user) return;
    setIsClocking(true);
    const newStatus = clockInState.status === 'in' ? 'clock-out' : 'clock-in';
    try {
        await addDoc(collection(db, "attendance"), {
            userId: user.uid,
            type: newStatus,
            timestamp: serverTimestamp()
        });
        toast({
            title: `Successfully Clocked ${newStatus.includes('in') ? 'In' : 'Out'}`,
            description: `Your attendance has been recorded at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`,
        });
    } catch(error) {
        console.error("Error clocking in/out:", error);
        toast({
            title: "Error",
            description: "Could not record your attendance. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsClocking(false);
    }
  };
  
  const anyLoading = Object.values(loading).some(v => v);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Welcome Back, {user?.displayName}!</h1>
        <p className="text-muted-foreground">Here's your dashboard overview for today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clock In/Out</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.attendance ? (
                <div className="h-10 flex items-center"><Loader2 className="h-5 w-5 animate-spin"/></div>
            ) : (
                <>
                    <div className="text-2xl font-bold">{clockInState.status === 'in' ? clockInState.time : 'Clocked Out'}</div>
                    <p className="text-xs text-muted-foreground h-4">
                        {clockInState.status === 'in' ? 'Clocked in at' : (clockInState.time.includes(':') ? `Last clocked out at ${clockInState.time}` : 'Ready to start your day?')}
                    </p>
                </>
            )}
            <Button className="mt-4 w-full" onClick={handleClockInOut} disabled={isClocking || loading.attendance}>
                {isClocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {clockInState.status === 'in' ? 'Clock Out' : 'Clock In'}
            </Button>
          </CardContent>
        </Card>
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
             <Button variant="outline" className="mt-4 w-full" onClick={() => router.push('/directory')}>Open Directory</Button>
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
          <CardContent>
            {loading.announcements ? (
              <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
                <div className="space-y-4">
                {announcements.length > 0 ? announcements.map((announcement) => (
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
                )) : (
                    <p className="text-sm text-muted-foreground text-center">No announcements right now.</p>
                )}
                </div>
            )}
          </CardContent>
        </Card>

        {(role === 'Admin' || role === 'Manager') && (
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Team</CardTitle>
                <CardDescription>Your direct reporting team.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {loading.team ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    teamMembers.length > 0 ? teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src={member.avatar} data-ai-hint={member.hint} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium leading-none">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => router.push('/directory')}>
                        <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center">Your team will appear here.</p>
                    )
                )}
            </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
