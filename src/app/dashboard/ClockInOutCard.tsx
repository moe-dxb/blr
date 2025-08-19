
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { db, functions } from "@/lib/firebase/firebase";
import { collection, query, where, Timestamp, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
    id?: string;
    clockInTime?: Timestamp;
    clockOutTime?: Timestamp;
    flagged?: boolean;
    reason?: string;
    tz?: string;
}

export function ClockInOutCard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [todayStats, setTodayStats] = useState<{hours: number; status: string}>({hours: 0, status: 'Not started'});

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Listen to attendance records
    useEffect(() => {
        if (!user || !db) return;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const q = query(
            collection(db, `users/${user.uid}/attendance`),
            where("clockInTime", ">=", startOfDay),
            orderBy("clockInTime", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const latestDoc = snapshot.docs[0];
                const docData = latestDoc.data();
                const latestData = { id: latestDoc.id, ...docData } as AttendanceRecord;
                setCurrentRecord(latestData);
                setIsClockedIn(!latestData.clockOutTime);
                
                // Calculate hours worked today
                if (latestData.clockInTime) {
                    const clockIn = latestData.clockInTime.toDate();
                    const clockOut = latestData.clockOutTime?.toDate() || new Date();
                    const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
                    
                    setTodayStats({
                        hours: Math.round(hoursWorked * 100) / 100,
                        status: latestData.clockOutTime ? 'Completed' : 'In Progress'
                    });
                }
            } else {
                setIsClockedIn(false);
                setCurrentRecord(null);
                setTodayStats({hours: 0, status: 'Not started'});
            }
        });

        return unsubscribe;
    }, [user]);

    const handleClockIn = async () => {
        if (!user || !functions) return;
        
        setLoading(true);
        try {
            const clockInFn = httpsCallable(functions, 'clockIn');
            const result = await clockInFn();
            const data = result.data as any;
            
            if (data.flagged) {
                toast({
                    title: "Clocked In (Flagged)",
                    description: "You've clocked in outside the normal schedule window. This will be reviewed by your manager.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Clocked In",
                    description: "Successfully clocked in for today.",
                });
            }
        } catch (error: any) {
            console.error("Clock in error:", error);
            toast({
                title: "Clock In Failed",
                description: error.message || "Unable to clock in. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!user || !functions) return;
        
        setLoading(true);
        try {
            const clockOutFn = httpsCallable(functions, 'clockOut');
            await clockOutFn();
            
            toast({
                title: "Clocked Out",
                description: "Successfully clocked out. Have a great day!",
            });
        } catch (error: any) {
            console.error("Clock out error:", error);
            toast({
                title: "Clock Out Failed", 
                description: error.message || "Unable to clock out. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Clock</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Time Display */}
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        {date.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                    <p className="text-3xl font-bold font-mono">{date.toLocaleTimeString('en-US')}</p>
                </div>

                {/* Today's Status */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Today's Status:</span>
                    <div className="flex items-center gap-2">
                        {isClockedIn ? (
                            <Badge variant="default" className="bg-green-500">
                                <Clock className="h-3 w-3 mr-1" />
                                Working
                            </Badge>
                        ) : (
                            <Badge variant="outline">
                                <MapPin className="h-3 w-3 mr-1" />
                                {todayStats.status}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Hours Worked */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hours Today:</span>
                    <span className="font-medium">{todayStats.hours}h</span>
                </div>

                {/* Flagged Warning */}
                {currentRecord?.flagged && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md border border-orange-200">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <div className="text-sm">
                            <p className="font-medium text-orange-800">Attendance Flagged</p>
                            <p className="text-orange-600">{currentRecord.reason}</p>
                        </div>
                    </div>
                )}

                {/* Clock In/Out Times */}
                {currentRecord && (
                    <div className="space-y-2 text-sm">
                        {currentRecord.clockInTime && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Clocked In:
                                </span>
                                <span className="font-medium">
                                    {currentRecord.clockInTime.toDate().toLocaleTimeString('en-US')}
                                </span>
                            </div>
                        )}
                        {currentRecord.clockOutTime && (
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Clocked Out:
                                </span>
                                <span className="font-medium">
                                    {currentRecord.clockOutTime.toDate().toLocaleTimeString('en-US')}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <Button 
                    className="w-full" 
                    onClick={isClockedIn ? handleClockOut : handleClockIn}
                    disabled={loading}
                    variant={isClockedIn ? "destructive" : "default"}
                >
                    {loading ? (
                        "Processing..."
                    ) : (
                        isClockedIn ? "Clock Out" : "Clock In"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
