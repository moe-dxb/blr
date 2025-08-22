// src/app/expenses/ExpenseClaimForm.tsx
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const expenseItemSchema = z.object({
  date: z.date({ required_error: "Date is required." }),
  category: z.string().min(1, "Category is required."),
  description: z.string().min(1, "Description is required.").max(500),
  amount: z.coerce.number().positive("Must be a positive number."),
});

const expenseClaimSchema = z.object({
  title: z.string().min(1, "Title is required.").max(100),
  items: z.array(expenseItemSchema).min(1, "At least one expense item is required."),
});

type ExpenseClaimFormValues = z.infer<typeof expenseClaimSchema>;

export function ExpenseClaimForm({ onSuccessfulSubmit }: { onSuccessfulSubmit?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<ExpenseClaimFormValues>({
    resolver: zodResolver(expenseClaimSchema),
    defaultValues: {
      title: '',
      items: [{ date: new Date(), category: '', description: '', amount: 0 }],
    },
  });

  const { control, handleSubmit, watch, formState: { isSubmitting } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch('items');
  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const onSubmit = async (data: ExpenseClaimFormValues) => {
    if (!user) {
      toast({ title: 'Authentication Error', variant: 'destructive' });
      return;
    }

    try {
      const functions = getFunctions();
      const createExpenseClaim = httpsCallable(functions, 'createExpenseClaim');

      await createExpenseClaim({
        userId: user.uid,
        title: data.title,
        items: data.items.map(item => ({
            ...item,
            date: format(item.date, 'yyyy-MM-dd')
        })),
        totalAmount,
      });

      toast({ title: 'Expense Claim Submitted', description: 'Your claim has been submitted for approval.' });
      form.reset();
      onSuccessfulSubmit?.();
    } catch (e: any) {
      toast({ title: 'Submission Failed', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>New Expense Claim</CardTitle></CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Title *</FormLabel>
                  <FormControl><Input {...field} placeholder="e.g., Client Trip to London" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Expense Items</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 border p-4 rounded-lg relative">
                  <div className="md:col-span-3">
                    <FormField control={control} name={`items.${index}.date`} render={({ field }) => (
                      <FormItem><Popover><PopoverTrigger asChild><FormControl>
                        <Button variant="outline" className={cn("w-full text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : "Select date"} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                    )}/>
                  </div>
                  <div className="md:col-span-2"><FormField control={control} name={`items.${index}.category`} render={({ field }) => (<FormItem><FormControl><Input {...field} placeholder="Category" /></FormControl><FormMessage /></FormItem>)}/></div>
                  <div className="md:col-span-4"><FormField control={control} name={`items.${index}.description`} render={({ field }) => (<FormItem><FormControl><Input {...field} placeholder="Description" /></FormControl><FormMessage /></FormItem>)}/></div>
                  <div className="md:col-span-2"><FormField control={control} name={`items.${index}.amount`} render={({ field }) => (<FormItem><FormControl><Input type="number" step="0.01" {...field} placeholder="Amount" /></FormControl><FormMessage /></FormItem>)}/></div>
                  <div className="md:col-span-1 flex items-center">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ date: new Date(), category: '', description: '', amount: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
            
            {/* TODO: Add receipt upload functionality here */}
            
            <div className="text-right font-bold text-lg">Total: ${totalAmount.toFixed(2)}</div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Expense Claim'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
