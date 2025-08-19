"use client";
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/firebase/callables';

export default function ExportEmployees() {
  const { toast } = useToast();
  const [mappings, setMappings] = useState("moe@blr-world.com,angelique@blr-world.com\n" +
                                    "inayat@blr-world.com,carlton@blr-world.com\n");
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      const rows = mappings
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(',').map((x) => x.trim())) as [string, string][];

      for (const [employeeEmail, managerEmail] of rows) {
        try {
          await api.setManagerForEmployeeByEmail(employeeEmail, managerEmail);
        } catch (e: any) {
          console.error('Mapping failed', employeeEmail, managerEmail, e?.message);
        }
      }

      toast({ title: 'Mappings applied' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message || 'Could not apply', variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Bulk Set Managers (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Paste CSV lines: employeeEmail,managerEmail</p>
        <Textarea rows={6} value={mappings} onChange={(e) => setMappings(e.target.value)} />
        <Button onClick={run} disabled={running}>Apply</Button>
      </CardContent>
    </Card>
  );
}