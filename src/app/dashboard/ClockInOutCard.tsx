
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AttendanceEvent {
    userId: string;
    type: 'clock-in' | 'clock-out';
    timestamp: Timestamp;
}

interface WorkHours {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
}

interface UserProfile {
    workHours?: WorkHours;
    timezone?: string;
}

export function ClockInOutCard() {
  const { user, profile } = useAuth();
  const [clockInState, setClockInState] = useState<{status: 'out' | 'in', time: string}>({status: 'out', time: '--:--'});
  const [isClocking, setIsClocking] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'attendance'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const lastEvent = snapshot.docs[0].data() as AttendanceEvent;
        const eventTime = lastEvent.timestamp?.toDate()?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || new Date().toLocaleTimeString();
        setClockInState({ status: lastEvent.type === 'clock-in' ? 'in' : 'out', time: eventTime });
      } else {
        setClockInState({ status: 'out', time: 'Not clocked in' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleClockInOut = async () => {
    if (!user || !profile) return;
    
    const timezone = profile.timezone || 'UTC';
    const now = new Date();
    const nowInUserTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][nowInUserTz.getDay()];

    const workHours = profile.workHours || {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '15:00' },
    };
    
    const todaysHours = workHours[dayOfWeek as keyof WorkHours];
    if (!todaysHours) {
        toast({ title: "It's your day off!", description: "You cannot clock in on a non-working day.", variant: "destructive" });
        return;
    }

    const [startHour, startMinute] = todaysHours.start.split(':').map(Number);
    const [endHour, endMinute] = todaysHours.end.split(':').map(Number);
    const startTime = new Date(nowInUserTz);
    startTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(nowInUserTz);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (nowInUserTz < startTime || nowInUserTz > endTime) {
        toast({ title: "Outside of Working Hours", description: "You can only clock in or out during your designated work hours.", variant: "destructive" });
        return;
    }

    setIsClocking(true);
    const newStatus = clockInState.status === 'out' ? 'clock-in' : 'clock-out';
    try {
        await addDoc(collection(db, "attendance"), {
            userId: user.uid,
            type: newStatus,
            timestamp: serverTimestamp()
        });
        toast({ title: `Successfully Clocked ${newStatus.includes('in') ? 'In' : 'Out'}` });
    } catch(error) {
        toast({ title: "Error", description: "Could not record your attendance.", variant: "destructive" });
    } finally {
        setIsClocking(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Clock In/Out</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-10 flex items-center"><Loader2 className="h-5 w-5 animate-spin"/></div>
        ) : (
          <>
            <div className="text-2xl font-bold">{clockInState.status === 'in' ? clockInState.time : 'Clocked Out'}</div>
            <p className="text-xs text-muted-foreground h-4">
                {clockInState.status === 'in' ? 'Clocked in at' : (clockInState.time.includes(':') ? `Last clocked out at ${clockInState.time}` : 'Ready to start your day?')}
            </p>
          </>
        )}
        <Button className="mt-4 w-full" onClick={handleClockInOut} disabled={isClocking || loading}>
            {isClocking && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {clockInState.status === 'in' ? 'Clock Out' : 'Clock In'}
        </Button>
      </CardContent>
    </Card>
  );
}
