
'use client';

import { useCallback, useState } from 'react';
import { LeaveRequestForm } from './LeaveRequestForm';
import { LeaveHistory } from './LeaveHistory';
import { Card, CardHeader } from '@/components/ui/card';

export default function LeavePage() {
  const [historyKey, setHistoryKey] = useState(() => Date.now());

  const handleSuccessfulRequest = useCallback(() => {
    setHistoryKey(Date.now());
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <h1 className="text-3xl font-bold font-headline">Leave Management</h1>
            <p className="text-muted-foreground">
            Request time off and view your leave history.
            </p>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeaveRequestForm onSuccessfulSubmit={handleSuccessfulRequest} />
        </div>
        <div className="lg:col-span-2">
          <LeaveHistory key={historyKey} />
        </div>
      </div>
    </div>
  );
}
