// src/app/leave/page.tsx
import { Card, CardHeader } from '@/components/ui/card';
import { LeaveRequestForm } from './LeaveRequestForm';
import { LeaveHistory } from './LeaveHistory';
import { getUserLeaveHistory } from '@/lib/firebase/get-leave-data';

export default async function LeavePage() {
  // Fetch data on the server
  const leaveHistory = await getUserLeaveHistory();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <p className="text-gray-500">Request time off and view your leave history.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* LeaveRequestForm remains a client component for interactivity */}
          <LeaveRequestForm />
        </div>
        <div className="lg:col-span-2">
          {/* Pass the server-fetched data to the history component */}
          <LeaveHistory initialHistory={leaveHistory} />
        </div>
      </div>
    </div>
  );
}
