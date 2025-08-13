'use client';
import { useState } from 'react';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { app } from '@/lib/firebase/firebase';

export default function ExportEmployees() {
  const { toast } = useToast();
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [range, setRange] = useState('Employees!A1');

  const run = async () => {
    if (!app) {
      toast({ title: 'Not ready', description: 'App not initialized', variant: 'destructive' });
      return;
    }
    try {
      const fn = httpsCallable(getFunctions(app), 'exportEmployeesToSheets');
      const res: any = await fn({ spreadsheetId, range });
      toast({ title: 'Export completed', description: `${res.data.count} rows` });
    } catch (e: any) {
      toast({ title: 'Export failed', description: e.message || 'Check secrets and access', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Export Employees to Google Sheets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Spreadsheet ID" value={spreadsheetId} onChange={e => setSpreadsheetId(e.target.value)} />
        <Input placeholder="Range (e.g., Employees!A1)" value={range} onChange={e => setRange(e.target.value)} />
        <Button onClick={run} disabled={!spreadsheetId}>Export</Button>
      </CardContent>
    </Card>
  );
}