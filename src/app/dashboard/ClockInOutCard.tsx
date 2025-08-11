
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc, query, where, Timestamp, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { useAuth } from "@/hooks/useAuth";

interface AttendanceRecord {
    id?: string;
    clockInTime?: Timestamp;
    clockOutTime?: Timestamp;
}

export function ClockInOutCard() {
    const { user } = useAuth();
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);

        if (user) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            
            const q = query(
                collection(db, `users/${user.uid}/attendance`),
                where("clockInTime", ">=", startOfDay)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const latestDoc = snapshot.docs[0];
                    const latestData = latestDoc.data() as AttendanceRecord;
                    setIsClockedIn(!latestData.clockOutTime);
                    setCurrentRecordId(latestDoc.id);
                } else {
                    setIsClockedIn(false);
                    setCurrentRecordId(null);
                }
            });

            return () => {
                clearInterval(timer);
                unsubscribe();
            };
        }
        return () => clearInterval(timer);
    }, [user]);

    const handleClockInOut = async () => {
        if (!user) return;
        
        try {
            if (isClockedIn && currentRecordId) {
                const recordRef = doc(db, `users/${user.uid}/attendance`, currentRecordId);
                await setDoc(recordRef, { clockOutTime: Timestamp.now() }, { merge: true });
            } else {
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
                <p className="text-xs text-muted-foreground">{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-2xl font-bold font-mono">{date.toLocaleTimeString('en-US')}</p>
            </div>
            <Button className="w-full mt-4" onClick={handleClockInOut}>
              {isClockedIn ? "Clock Out" : "Clock In"}
            </Button>
          </CardContent>
        </Card>
    );
}
