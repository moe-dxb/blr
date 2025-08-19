'use client';

import { useMemo, useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, onSnapshot, query, where, Query } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Check, X } from 'lucide-react';
import { useDirectReports } from '@/hooks/useDirectReports';
import { api } from '@/lib/firebase/callables';
import { Role, isAdmin, isManager } from '@/lib/auth/roles';

interface LeaveRequest {
  id: string;
  userId: string;
  requesterName?: string;
  leaveType: string;
  startDate: any;
  endDate: any;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function LeaveRequests() {
  const { toast } = useToast();
  const { role } = useAuth();
  const { reportIds } = useDirectReports();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    if (!db) return;
    const fdb = db!;
    setLoading(true);
    let unsub = () => {};

    const run = async () => {
      try {
        if (isAdmin(role as Role)) {
          const q = query(collection(fdb, 'leaveRequests'), where('status', '==', 'pending')) as Query<LeaveRequest>;
          unsub = onSnapshot(q, (snap) => setRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
        } else if (isManager(role as Role)) {
          if (reportIds.length === 0) {
            setRequests([]);
            return;
          }
          if (reportIds.length <= 10) {
            const q = query(
              collection(fdb, 'leaveRequests'),
              where('status', '==', 'pending'),
              where('userId', 'in', reportIds)
            ) as Query<LeaveRequest>;
            unsub = onSnapshot(q, (snap) => setRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
          } else {
            // Fallback: subscribe to all pending and filter client-side
            const q = query(collection(fdb, 'leaveRequests'), where('status', '==', 'pending')) as Query<LeaveRequest>;
            unsub = onSnapshot(q, (snap) => {
              const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
              setRequests(all.filter((r) => reportIds.includes((r as any).userId)) as any);
            });
          }
        } else {
          setRequests([]);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => unsub();
  }, [role, reportIds.join(',')]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      await api.approveLeave(id);
      toast({ title: 'Approved', description: 'Leave request approved.' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message || 'Could not approve', variant: 'destructive' });
    }
  }, [toast]);

  const handleReject = useCallback(async (id: string) => {
    try {
      await api.declineLeave(id);
      toast({ title: 'Rejected', description: 'Leave request rejected.' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message || 'Could not reject', variant: 'destructive' });
    }
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pending Leave Requests</CardTitle>
        <CardDescription>Approve or reject leave requests from your team.</CardDescription>
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
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No pending leave requests.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.requesterName || req.userId}</TableCell>
                    <TableCell>{req.leaveType}</TableCell>
                    <TableCell>
                      {req.startDate?.toDate ? req.startDate.toDate().toLocaleDateString() : req.startDate} -{' '}
                      {req.endDate?.toDate ? req.endDate.toDate().toLocaleDateString() : req.endDate}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{req.reason || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        onClick={() => handleApprove(req.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleReject(req.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}