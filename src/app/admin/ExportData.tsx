// src/app/admin/ExportData.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { Upload, Users } from 'lucide-react'; // CORRECTED: Replaced 'Sheet' with 'Upload'

const exportSchema = z.object({
  spreadsheetId: z.string().min(10, 'Please enter a valid Google Sheet ID.'),
});

type ExportFormValues = z.infer<typeof exportSchema>;

function ExportForm({ exportType, onExport }: { exportType: 'Employees' | 'Expenses', onExport: (id: string) => Promise<any> }) {
  const { toast } = useToast();
  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportSchema),
  });

  const { formState: { isSubmitting }, handleSubmit } = form;

  const onSubmit = async (data: ExportFormValues) => {
    try {
      const result = await onExport(data.spreadsheetId);
      toast({
        title: 'Export Successful',
        description: `Successfully exported ${result.count} ${exportType.toLowerCase()}.`,
      });
      form.reset({ spreadsheetId: '' });
    } catch (e: any) {
      toast({
        title: 'Export Failed',
        description: e.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="spreadsheetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Sheet ID</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter Google Sheet ID..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="mt-4">
          {isSubmitting ? 'Exporting...' : `Export ${exportType}`}
        </Button>
      </form>
    </Form>
  );
}

export function ExportData() {
  const functions = getFunctions();
  const exportEmployees = httpsCallable(functions, 'exportEmployeesToSheets');
  const exportExpenses = httpsCallable(functions, 'exportExpensesToSheets');

  const handleEmployeeExport = async (spreadsheetId: string) => {
    const result = await exportEmployees({ spreadsheetId, range: 'Employees!A1' });
    return (result.data as any);
  };

  const handleExpenseExport = async (spreadsheetId: string) => {
    const result = await exportExpenses({ spreadsheetId, range: 'Expenses!A1' });
    return (result.data as any);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users /> Export Employees</CardTitle>
          <CardDescription>Export a list of all users to a Google Sheet.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportForm exportType="Employees" onExport={handleEmployeeExport} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload /> Export Expenses</CardTitle>
          <CardDescription>Export all expense claims to a Google Sheet.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportForm exportType="Expenses" onExport={handleExpenseExport} />
        </CardContent>
      </Card>
    </div>
  );
}
