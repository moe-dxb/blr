// src/app/manager/approvals/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveApprovalList } from "./LeaveApprovalList";
import { ExpenseApprovalList } from "./ExpenseApprovalList";
import { getApprovalData } from "@/lib/firebase/get-approval-data";

// This is now a React Server Component
export default async function ApprovalsPage() {
  // Data is fetched on the server before the page is rendered
  const { leaveRequests, expenseClaims } = await getApprovalData();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Approvals Dashboard</h1>
      <Tabs defaultValue="leave">
        <TabsList className="mb-4">
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          <TabsTrigger value="expenses">Expense Claims</TabsTrigger>
        </TabsList>
        <TabsContent value="leave">
          <Card>
            <CardHeader><CardTitle>Pending Leave Requests</CardTitle></CardHeader>
            <CardContent>
              {/* The fetched data is passed as a prop */}
              <LeaveApprovalList initialRequests={leaveRequests as any} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses">
          <Card>
            <CardHeader><CardTitle>Pending Expense Claims</CardTitle></CardHeader>
            <CardContent>
              {/* The fetched data is passed as a prop */}
              <ExpenseApprovalList initialClaims={expenseClaims as any} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
