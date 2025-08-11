
import { LeaveRequestForm } from './LeaveRequestForm';
import { LeaveHistory } from './LeaveHistory';

// This is a React Server Component (RSC) by default, adhering to our "Server-First" principle.
// It fetches no data and simply provides the static layout for the page.
// The interactive parts of the UI are delegated to the Client Components below.

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
          {/* LeaveRequestForm is an interactive Client Component */}
          <LeaveRequestForm />
        </div>
        <div className="lg:col-span-2">
          {/* LeaveHistory is a Client Component that will listen for real-time updates */}
          <LeaveHistory />
        </div>
      </div>
    </div>
  );
}
