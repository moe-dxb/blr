
'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, query, where, getDocs, Timestamp, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from "@/hooks/useAuth";

interface AttendanceRecord {
    id?: string;
    clockInTime?: Timestamp;
    clockOutTime?: Timestamp;
}
interface WorkHours {
    start: string;
    end: string;
}
interface UserProfile {
    workHours?: {
        [day: string]: WorkHours;
    };
}

export function ClockInOutCard() {
    const { user } = useAuth();
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
    const [today, setToday] = useState('');
    const [currentTime, setCurrentTime] = useState('');

     useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setToday(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
            setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);

        if (user) {
            const todayStr = new Date().toISOString().split('T')[0];
            const startOfDay = new Date(todayStr);
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
            
            const q = query(
                collection(db, `users/${user.uid}/attendance`),
                where("clockInTime", ">=", startOfDay),
                where("clockInTime", "<=", endOfDay)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const latestDoc = snapshot.docs[0].data() as AttendanceRecord;
                    const id = snapshot.docs[0].id;
                    setIsClockedIn(!latestDoc.clockOutTime);
                    setCurrentRecordId(id);
                } else {
                    setIsClockedIn(false);
                    setCurrentRecordId(null);
                }
            });

            return () => {
                clearInterval(timer);
                unsubscribe();
            };
        } else {
             return () => clearInterval(timer);
        }
    }, [user]);

    const handleClockInOut = async () => {
        if (!user) return;
        
        try {
            if (isClockedIn && currentRecordId) {
                // Clock out
                const recordRef = doc(db, `users/${user.uid}/attendance`, currentRecordId);
                await setDoc(recordRef, { clockOutTime: Timestamp.now() }, { merge: true });
            } else {
                // Clock in
                await addDoc(collection(db, `users/${user.uid}/attendance`), {
                    clockInTime: Timestamp.now(),
                    clockOutTime: null
                });
            }
        } catch (error) {
            console.error("Error clocking in/out:", error);
        }
    };
    
    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Clock</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-center">
                <p className="text-xs text-muted-foreground">{today}</p>
                <p className="text-2xl font-bold font-mono">{currentTime}</p>
            </div>
            <Button className="w-full mt-4" onClick={handleClockInOut}>
              {isClockedIn ? "Clock Out" : "Clock In"}
            </Button>
          </CardContent>
        </Card>
    );
}
