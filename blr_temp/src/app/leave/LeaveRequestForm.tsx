'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/firebase/callables';
import { format, differenceInDays, isWeekend, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave', color: 'bg-blue-500' },
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-500' },
  { value: 'personal', label: 'Personal Leave', color: 'bg-purple-500' },
  { value: 'emergency', label: 'Emergency Leave', color: 'bg-orange-500' },
  { value: 'maternity', label: 'Maternity Leave', color: 'bg-pink-500' },
  { value: 'paternity', label: 'Paternity Leave', color: 'bg-green-500' },
];

export function LeaveRequestForm({ onSuccessfulSubmit }: { onSuccessfulSubmit?: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Calculate working days and total days
  const calculateDays = () => {
    if (!startDate || !endDate) return { totalDays: 0, workingDays: 0 };
    
    const total = differenceInDays(endDate, startDate) + 1;
    let working = 0;
    
    for (let i = 0; i < total; i++) {
      const currentDate = addDays(startDate, i);
      if (!isWeekend(currentDate)) {
        working++;
      }
    }
    
    return { totalDays: total, workingDays: working };
  };

  const { totalDays, workingDays } = calculateDays();

  const submit = async () => {
    setLoading(true);
    try {
      if (!leaveType || !startDate || !endDate) {
        throw new Error('Please fill in all required fields');
      }

      if (endDate < startDate) {
        throw new Error('End date cannot be before start date');
      }

      await api.applyLeave({ 
        leaveType, 
        startDate: startDate.toISOString().split('T')[0], 
        endDate: endDate.toISOString().split('T')[0], 
        reason 
      });
      
      toast({ 
        title: 'Leave Request Submitted', 
        description: `Your ${LEAVE_TYPES.find(t => t.value === leaveType)?.label} request has been submitted for approval.` 
      });
      
      onSuccessfulSubmit?.();
      
      // Reset form
      setLeaveType('');
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
    } catch (e: any) {
      toast({ 
        title: 'Failed to Submit', 
        description: e.message || 'An error occurred while submitting your request.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          New Leave Request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Leave Type Selection */}
        <div className="space-y-2">
          <Label>Leave Type *</Label>
          <Select value={leaveType} onValueChange={setLeaveType}>
            <SelectTrigger>
              <SelectValue placeholder="Select leave type" />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", type.color)} />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setShowStartCalendar(false);
                    // Auto-adjust end date if it's before start date
                    if (date && endDate && endDate < date) {
                      setEndDate(date);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date *</Label>
            <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setShowEndCalendar(false);
                  }}
                  disabled={(date) => date < (startDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Days Calculation */}
        {startDate && endDate && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Leave Duration</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Total Days:</span>
                <span className="font-medium ml-2">{totalDays}</span>
              </div>
              <div>
                <span className="text-blue-600">Working Days:</span>
                <span className="font-medium ml-2">{workingDays}</span>
              </div>
            </div>
            {totalDays !== workingDays && (
              <p className="text-xs text-blue-600 mt-2">
                * Weekends are excluded from working days calculation
              </p>
            )}
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <Label>Reason (Optional)</Label>
          <Textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            placeholder="Please provide a brief reason for your leave request..."
            rows={3}
          />
        </div>

        {/* Validation Warning */}
        {endDate && startDate && endDate < startDate && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">End date cannot be before start date</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={submit} 
          disabled={loading || !leaveType || !startDate || !endDate || (endDate < startDate)} 
          className="w-full"
        >
          {loading ? 'Submitting Request...' : `Submit ${workingDays > 0 ? `(${workingDays} working days)` : 'Request'}`}
        </Button>
      </CardFooter>
    </Card>
  );
}