// src/app/admin/ExpenseExport.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { Upload } from 'lucide-react'; // CORRECTED: Using a known, valid icon

const exportSchema = z.object({
  spreadsheetId: z.string().min(10, 'Please enter a valid Google Sheet ID.'),
});

type ExportFormValues = z.infer<typeof exportSchema>;

export function ExpenseExport() {
  const { toast } = useToast();
  const form = useForm<ExportFormValues>({
    resolver: zodResolver(exportSchema),
  });

  const { formState: { isSubmitting }, handleSubmit } = form;

  const onSubmit = async (data: ExportFormValues) => {
    try {
      const functions = getFunctions();
      const exportExpenses = httpsCallable(functions, 'exportExpensesToSheets');
      const result = await exportExpenses({ spreadsheetId: data.spreadsheetId, range: 'Expenses!A1' });
      
      toast({
        title: 'Export Successful',
        description: `Successfully exported ${((result.data as any).count)} expense claims.`,
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Upload /> Export Expense Claims</CardTitle>
        <CardDescription>
          Enter the ID of a Google Sheet to export all expense claims. Ensure the service account has editor access to the sheet.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="spreadsheetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Sheet ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., 1_AbcDeFgHiJkLmNoPqRsTuVwXyZ" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Exporting...' : 'Export to Google Sheets'}
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}
