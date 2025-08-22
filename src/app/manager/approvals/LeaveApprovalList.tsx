// src/app/manager/approvals/LeaveApprovalList.tsx
'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

interface LeaveRequest {
  id: string;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'submitted' | 'approved' | 'declined';
  reason?: string;
}

type UpdateStatus = 'approved' | 'declined';

// The component now accepts initial data fetched from the server
export function LeaveApprovalList({ initialRequests }: { initialRequests: LeaveRequest[] }) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateRequest = async (requestId: string, newStatus: UpdateStatus) => {
    setUpdatingId(requestId);
    try {
      const functions = getFunctions();
      const updateStatus = httpsCallable(functions, 'updateLeaveRequestStatus');
      await updateStatus({ requestId, status: newStatus });

      toast({
        title: `Request ${newStatus}`,
        description: `The leave request has been successfully ${newStatus}.`,
      });
      
      // Instead of re-fetching, we can just remove the item from the list for a faster UI update
      setRequests(prev => prev.filter(r => r.id !== requestId));

    } catch (e: any) {
      toast({ title: 'Update Failed', description: e.message, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (requests.length === 0) {
    return <p className="text-gray-500">No pending leave requests found.</p>;
  }

  return (
    <div className="space-y-4">
      {requests.map(req => (
        <Card key={req.id}>
          <CardHeader>
            <CardTitle className="text-lg">Request from User: {req.userId.substring(0, 6)}...</CardTitle>
            <CardDescription>{req.startDate} to {req.endDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p><span className="font-semibold">Type:</span> {req.type}</p>
                {req.reason && <p><span className="font-semibold">Reason:</span> {req.reason}</p>}
              </div>
              <Badge variant={req.status === 'approved' ? 'default' : req.status === 'declined' ? 'destructive' : 'outline'}>
                {req.status}
              </Badge>
            </div>
          </CardContent>
          {req.status === 'submitted' && (
            <CardFooter className="flex gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" disabled={updatingId === req.id}>
                    <X className="mr-2 h-4 w-4"/> Decline
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleUpdateRequest(req.id, 'declined')}>Confirm Decline</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={updatingId === req.id} onClick={() => handleUpdateRequest(req.id, 'approved')}>
                {updatingId === req.id ? 'Updating...' : <><Check className="mr-2 h-4 w-4"/> Approve</>}
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
