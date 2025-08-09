
'use client';

import { LeaveRequestForm } from './LeaveRequestForm';
import { LeaveHistory } from './LeaveHistory';

export default function LeavePage() {
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leave Management</h1>
        <p className="text-muted-foreground">
          Request time off and view your leave history.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <LeaveRequestForm />
        </div>
        <div className="lg:col-span-2">
            <LeaveHistory />
        </div>
      </div>
    </div>
  );
}
