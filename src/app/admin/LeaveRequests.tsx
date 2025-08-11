
'use client';

import { useMemo, useCallback } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, doc, updateDoc, Timestamp, Query } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Check, X } from 'lucide-react';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';

interface LeaveRequest {
  id: string;
  requesterName: string;
  leaveType: string;
  startDate: Timestamp;
  endDate: Timestamp;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function LeaveRequests() {
  const { user } = useAuth();
  const { toast } = useToast();

  const requestsQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, "leaveRequests"), where("status", "==", "pending")) as Query<LeaveRequest>;
  }, [user]);

  const { data: requests, loading, error } = useFirestoreSubscription<LeaveRequest>({ query: requestsQuery, enabled: !!user });

  const handleUpdateRequest = useCallback(async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const requestDoc = doc(db, 'leaveRequests', id);
      await updateDoc(requestDoc, { status: newStatus });

      toast({
        title: "Request Updated",
        description: `The leave request has been ${newStatus}.`,
      });
    } catch (err) {
      console.error(`Error updating request to ${newStatus}:`, err);
      toast({
        title: "Update Failed",
        description: "The request could not be updated. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  if (error) {
    toast({
        title: "Error fetching data",
        description: "Could not fetch leave requests.",
        variant: "destructive"
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pending Leave Requests</CardTitle>
        <CardDescription>
          Approve or reject leave requests from your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : requests?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No pending leave requests.
                    </TableCell>
                </TableRow>
              ) : requests?.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.requesterName}</TableCell>
                  <TableCell>{req.leaveType}</TableCell>
                  <TableCell>
                    {req.startDate.toDate().toLocaleDateString()} - {req.endDate.toDate().toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{req.reason || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="mr-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        onClick={() => handleUpdateRequest(req.id, 'approved')}
                    >
                      <Check className="h-4 w-4 mr-2"/>
                      Approve
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleUpdateRequest(req.id, 'rejected')}
                    >
                      <X className="h-4 w-4 mr-2"/>
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
