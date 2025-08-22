'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format, differenceInDays, isWeekend, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave', color: 'bg-blue-500' },
  { value: 'sick', label: 'Sick Leave', color: 'bg-red-500' },
  { value: 'unpaid', label: 'Unpaid Leave', color: 'bg-purple-500' },
  { value: 'other', label: 'Other Leave', color: 'bg-orange-500' },
];

const leaveRequestSchema = z.object({
  leaveType: z.enum(['annual', 'sick', 'unpaid', 'other'], {
    required_error: "Please select a leave type.",
  }),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  endDate: z.date({
    required_error: "An end date is required.",
  }),
  reason: z.string().max(1000, "Reason must not exceed 1000 characters.").optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});

type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

export function LeaveRequestForm({ onSuccessfulSubmit }: { onSuccessfulSubmit?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      reason: '',
    }
  });

  const { watch, control, handleSubmit, formState: { isSubmitting } } = form;
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const { totalDays, workingDays } = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return { totalDays: 0, workingDays: 0 };
    const total = differenceInDays(endDate, startDate) + 1;
    let working = 0;
    for (let i = 0; i < total; i++) {
      const currentDate = addDays(startDate, i);
      if (!isWeekend(currentDate)) {
        working++;
      }
    }
    return { totalDays, workingDays };
  }, [startDate, endDate]);

  const onSubmit = async (data: LeaveRequestFormValues) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to submit a request.', variant: 'destructive' });
      return;
    }

    try {
      const functions = getFunctions();
      const createLeaveRequest = httpsCallable(functions, 'createLeaveRequest');
      
      await createLeaveRequest({
        userId: user.uid,
        type: data.leaveType,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        reason: data.reason,
      });

      toast({
        title: 'Leave Request Submitted',
        description: `Your leave request has been submitted for approval.`
      });

      form.reset();
      onSuccessfulSubmit?.();

    } catch (e: any) {
      toast({
        title: 'Failed to Submit',
        description: e.message || 'An error occurred.',
        variant: 'destructive'
      });
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
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2"><div className={cn("w-3 h-3 rounded-full", type.color)} />{type.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick start date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick end date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (startDate || new Date())} initialFocus /></PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {startDate && endDate && endDate >= startDate && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-600" /><span className="font-medium text-blue-800">Leave Duration</span></div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-blue-600">Total Days:</span><span className="font-medium ml-2">{totalDays}</span></div>
                  <div><span className="text-blue-600">Working Days:</span><span className="font-medium ml-2">{workingDays}</span></div>
                </div>
              </div>
            )}

            <FormField
              control={control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl><Textarea {...field} placeholder="Provide a brief reason for your leave..." rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting Request...' : `Submit Request`}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
