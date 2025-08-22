// src/app/admin/audit-log/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// This is a placeholder component.
// TODO: Fetch real audit log data from Firestore.
// TODO: Implement filters for actor, action, and date range.

const MOCK_AUDIT_LOGS = [
  { id: '1', ts: new Date().toISOString(), actor: 'admin@company.com', action: 'user.create', target: 'users/xyz123' },
  { id: '2', ts: new Date().toISOString(), actor: 'manager@company.com', action: 'leave.approve', target: 'leaveRequests/abc456' },
  { id: '3', ts: new Date().toISOString(), actor: 'employee@company.com', action: 'expense.create', target: 'expenseClaims/def789' },
];

export default function AuditLogPage() {
  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Document</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_AUDIT_LOGS.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.ts).toLocaleString()}</TableCell>
                  <TableCell>{log.actor}</TableCell>
                  <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{log.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
