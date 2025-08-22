
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useAuth } from "@/hooks/useAuth"; // Assuming useAuth provides real-time user data
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function ClockInOutCard() {
    const { user, loading: userLoading } = useAuth();
    const { toast } = useToast();
    const [date, setDate] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // The user's clock-in status is now derived directly from the user object.
    // This assumes the useAuth hook provides a real-time user profile,
    // including the custom 'attendanceStatus' field.
    const isClockedIn = user?.attendanceStatus === 'clockedIn';

    // Real-time clock effect
    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockInOut = async () => {
        if (!user) {
            toast({ title: "Not Authenticated", variant: "destructive" });
            return;
        }
        
        setIsSubmitting(true);
        const functionName = isClockedIn ? 'clockOutV2' : 'clockInV2';
        const successMessage = isClockedIn ? "Successfully clocked out. Have a great day!" : "Successfully clocked in for today.";

        try {
            const functions = getFunctions();
            const clockFunction = httpsCallable(functions, functionName);
            await clockFunction();
            
            toast({
                title: isClockedIn ? "Clocked Out" : "Clocked In",
                description: successMessage,
            });
        } catch (error: any) {
            console.error(`${functionName} error:`, error);
            toast({
                title: "Action Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Clock</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-3xl font-bold font-mono">{date.toLocaleTimeString()}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Status:</span>
                    {userLoading ? (
                         <Badge variant="outline">Loading...</Badge>
                    ) : (
                         <Badge variant={isClockedIn ? "default" : "outline"} className={isClockedIn ? "bg-green-500" : ""}>
                            {isClockedIn ? "Clocked In" : "Clocked Out"}
                        </Badge>
                    )}
                </div>

                <Button 
                    className="w-full" 
                    onClick={handleClockInOut}
                    disabled={isSubmitting || userLoading}
                    variant={isClockedIn ? "destructive" : "default"}
                >
                    {isSubmitting ? "Processing..." : (isClockedIn ? "Clock Out" : "Clock In")}
                </Button>
            </CardContent>
        </Card>
    );
}
