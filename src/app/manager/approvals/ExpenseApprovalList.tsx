// src/app/manager/approvals/ExpenseApprovalList.tsx
'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface ExpenseClaim {
  id: string;
  userId: string;
  title: string;
  totalAmount: number;
  status: 'submitted' | 'approved' | 'declined';
}

// The component now accepts initial data fetched from the server
export function ExpenseApprovalList({ initialClaims }: { initialClaims: ExpenseClaim[] }) {
  const { toast } = useToast();
  const [claims, setClaims] = useState<ExpenseClaim[]>(initialClaims);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (claimId: string, newStatus: 'approved' | 'declined') => {
    setUpdatingId(claimId);
    try {
      const functions = getFunctions();
      const updateStatus = httpsCallable(functions, 'updateExpenseClaimStatus');
      await updateStatus({ claimId, status: newStatus });

      toast({ title: `Claim ${newStatus}`, description: `The claim has been successfully ${newStatus}.` });
      // Remove the claim from the list for a snappy UI update
      setClaims(prev => prev.filter(c => c.id !== claimId));

    } catch (e: any) {
      toast({ title: 'Update Failed', description: e.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (claims.length === 0) return <p className="text-gray-500">No pending expense claims found.</p>;

  return (
    <div className="space-y-4">
      {claims.map(claim => (
        <Card key={claim.id}>
          <CardHeader>
            <CardTitle className="text-lg">{claim.title}</CardTitle>
            <CardDescription>From User: {claim.userId.substring(0,6)}... | Amount: ${claim.totalAmount.toFixed(2)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={claim.status === 'approved' ? 'default' : claim.status === 'declined' ? 'destructive' : 'outline'}>{claim.status}</Badge>
          </CardContent>
          {claim.status === 'submitted' && (
            <CardFooter className="flex gap-4">
              <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleUpdateStatus(claim.id, 'declined')} disabled={updatingId === claim.id}><X className="mr-2 h-4 w-4"/> Decline</Button>
              <Button size="sm" className="bg-green-600" onClick={() => handleUpdateStatus(claim.id, 'approved')} disabled={updatingId === claim.id}><Check className="mr-2 h-4 w-4"/> Approve</Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
