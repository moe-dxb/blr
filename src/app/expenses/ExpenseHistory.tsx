// src/app/expenses/ExpenseHistory.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ExpenseClaim {
  id: string;
  title: string;
  totalAmount: number;
  status: 'submitted' | 'approved' | 'declined';
  createdAt: string; // ISO string
}

interface ExpenseHistoryProps {
  initialHistory: ExpenseClaim[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'submitted': return <Badge variant="outline">Pending</Badge>;
    case 'approved': return <Badge>Approved</Badge>;
    case 'declined': return <Badge variant="destructive">Declined</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export function ExpenseHistory({ initialHistory }: ExpenseHistoryProps) {
  if (initialHistory.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Your Past Claims</CardTitle></CardHeader>
        <CardContent className="text-center text-gray-500">
          <p>You have not submitted any expense claims.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Your Past Claims</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initialHistory.map((claim) => (
            <div key={claim.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{claim.title}</h3>
                <p className="text-sm text-gray-500">
                  Submitted on {format(new Date(claim.createdAt), 'PPP')}
                </p>
              </div>
              <div className="text-right">
                 <p className="font-bold text-lg">${claim.totalAmount.toFixed(2)}</p>
                 {getStatusBadge(claim.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
