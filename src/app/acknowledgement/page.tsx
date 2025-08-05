
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileWarning, CheckCircle, Clock } from "lucide-react";

const policies = [
  { id: 1, name: 'Employee Handbook 2025', dueDate: '2024-08-01', status: 'Pending' },
  { id: 2, name: 'Work From Home Policy Update', dueDate: '2024-07-25', status: 'Completed', completedDate: '2024-07-20' },
  { id: 3, name: 'Data Security & Privacy Guidelines', dueDate: '2024-08-15', status: 'Pending' },
  { id: 4, name: 'Code of Conduct v3.1', dueDate: '2024-07-15', status: 'Completed', completedDate: '2024-07-10' },
];

export default function PolicyAcknowledgementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Policy Acknowledgement</h1>
        <p className="text-muted-foreground">
          Please review and acknowledge the following documents.
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map(policy => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">{policy.name}</TableCell>
                <TableCell>{policy.dueDate}</TableCell>
                <TableCell>
                  <Badge variant={policy.status === 'Completed' ? 'default' : 'destructive'}>
                     {policy.status === 'Completed' ? <CheckCircle className="mr-2 h-3 w-3" /> : <FileWarning className="mr-2 h-3 w-3" />}
                    {policy.status}
                  </Badge>
                  {policy.completedDate && (
                    <p className="text-xs text-muted-foreground mt-1">on {policy.completedDate}</p>
                  )}
                </TableCell>
                <TableCell className="text-right">
                    {policy.status === 'Pending' ? (
                        <Button>Review & Sign</Button>
                    ) : (
                        <Button variant="outline" disabled>View Signed Document</Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
