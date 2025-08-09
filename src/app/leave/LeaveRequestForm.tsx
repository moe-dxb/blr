
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';

const leaveTypes = ["Annual", "Sick", "Unpaid", "Bereavement"];

export function LeaveRequestForm() {
  const { user } = useAuth();
  const [leaveType, setLeaveType] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!user || !leaveType || !dateRange?.from || !dateRange?.to) {
        toast({
            title: "Incomplete Information",
            description: "Please select a leave type and a valid date range.",
            variant: "destructive",
        });
        return;
    }

    setLoading(true);

    try {
        await addDoc(collection(db, 'leaveRequests'), {
            userId: user.uid,
            requesterName: user.displayName,
            requesterEmail: user.email,
            leaveType,
            startDate: dateRange.from,
            endDate: dateRange.to,
            reason,
            status: 'pending',
            requestedAt: serverTimestamp(),
        });

        toast({
            title: "Request Submitted",
            description: "Your leave request has been submitted for approval.",
        });

        // Reset form
        setLeaveType('');
        setDateRange(undefined);
        setReason('');

    } catch (error) {
        console.error("Error submitting leave request:", error);
        toast({
            title: "Submission Failed",
            description: "Could not submit your request. Please try again.",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">New Leave Request</CardTitle>
        <CardDescription>
          Select the type and dates for your time off.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <label>Leave Type</label>
            <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a leave type..." />
                </SelectTrigger>
                <SelectContent>
                    {leaveTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <label>Select Dates</label>
            <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border"
                numberOfMonths={1}
            />
        </div>

         <div className="space-y-2">
            <label htmlFor="reason">Reason (Optional)</label>
            <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add a brief note for your manager..."
            />
        </div>
        
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
        </Button>
      </CardContent>
    </Card>
  );
}
