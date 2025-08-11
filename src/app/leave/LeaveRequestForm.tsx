
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { db } from '@/lib/firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";


// Define the validation schema using Zod
const formSchema = z.object({
  leaveType: z.string({ required_error: "Leave type is required." }),
  dateRange: z.object({
    from: z.date({ required_error: "Start date is required." }),
    to: z.date({ required_error: "End date is required." }),
  }),
  reason: z.string().optional(),
}).refine(data => data.dateRange.from <= data.dateRange.to, {
    message: "End date cannot be before start date.",
    path: ["dateRange"],
});

const leaveTypes = ["Annual", "Sick", "Unpaid", "Bereavement", "Maternity", "Paternity"];

interface LeaveRequestFormProps {
  onSuccessfulSubmit: () => void;
}

export function LeaveRequestForm({ onSuccessfulSubmit }: LeaveRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveType: "",
      reason: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to submit a request.", variant: "destructive" });
        return;
    }

    try {
        await addDoc(collection(db, 'leaveRequests'), {
            userId: user.uid,
            requesterName: user.displayName,
            requesterEmail: user.email,
            leaveType: values.leaveType,
            startDate: values.dateRange.from,
            endDate: values.dateRange.to,
            reason: values.reason,
            status: 'pending',
            requestedAt: serverTimestamp(),
        });

        toast({
            title: "Request Submitted",
            description: "Your leave request has been sent for approval.",
        });
        form.reset();
        onSuccessfulSubmit();

    } catch (error) {
        console.error("Error submitting leave request:", error);
        toast({ title: "Submission Failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">New Leave Request</CardTitle>
        <CardDescription>Select the type and dates for your time off.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="leaveType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a leave type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Dates</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !field.value?.from && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>{format(field.value.from, "LLL dd, y")} - {format(field.value.to, "LLL dd, y")}</>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value}
                        onSelect={field.onChange}
                        numberOfMonths={1}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a brief note for your manager..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
