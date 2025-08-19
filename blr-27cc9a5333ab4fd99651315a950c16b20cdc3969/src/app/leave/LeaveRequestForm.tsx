'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/firebase/callables';

export function LeaveRequestForm({ onSuccessfulSubmit }: { onSuccessfulSubmit?: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const submit = async () => {
    setLoading(true);
    try {
      if (!leaveType || !startDate || !endDate) {
        throw new Error('Please fill in all required fields');
      }
      await api.applyLeave({ leaveType, startDate, endDate, reason });
      toast({ title: 'Leave request submitted' });
      onSuccessfulSubmit?.();
      setReason('');
    } catch (e: any) {
      toast({ title: 'Failed to submit', description: e.message || 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label>Leave Type</Label>
          <Input value={leaveType} onChange={(e) => setLeaveType(e.target.value)} placeholder="annual | sick" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional" />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </CardFooter>
    </Card>
  );
}