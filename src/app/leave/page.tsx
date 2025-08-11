
'use client';

import { useState } from 'react';
import { LeaveRequestForm } from './LeaveRequestForm';
import { LeaveHistory } from './LeaveHistory';

export default function LeavePage() {
  // By lifting the state up to this parent component, we can create a communication channel
  // between the form and the history list. When the form is successfully submitted,
  // we can trigger a re-fetch or a state update in the history component.
  const [historyKey, setHistoryKey] = useState(Date.now());

  const handleSuccessfulRequest = () => {
    // Updating the key will cause React to re-mount the LeaveHistory component,
    // which in turn will trigger its internal useEffect to re-fetch the latest data.
    // This is a simple yet effective way to ensure the list is up-to-date after a new submission.
    setHistoryKey(Date.now());
  };

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
          <LeaveRequestForm onSuccessfulSubmit={handleSuccessfulRequest} />
        </div>
        <div className="lg:col-span-2">
          {/* We pass the 'key' prop here to imperatively control the component's lifecycle. */}
          <LeaveHistory key={historyKey} />
        </div>
      </div>
    </div>
  );
}
