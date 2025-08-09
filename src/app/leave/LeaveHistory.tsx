
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

interface LeaveRequest {
    id: string;
    leaveType: string;
    startDate: Timestamp;
    endDate: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
}

export function LeaveHistory() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const requestsCollection = collection(db, "leaveRequests");
    const q = query(
        requestsCollection, 
        where("userId", "==", user.uid),
        orderBy("requestedAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeaveRequest));
      setRequests(requestList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leave history:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);
  
  const getStatusVariant = (status: LeaveRequest['status']) => {
    switch (status) {
        case 'approved': return 'default';
        case 'pending': return 'secondary';
        case 'rejected': return 'destructive';
        default: return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">My Leave History</CardTitle>
        <CardDescription>
          A record of your past and pending time off requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        You have not made any leave requests.
                    </TableCell>
                </TableRow>
              ) : requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.leaveType}</TableCell>
                  <TableCell>{req.startDate.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>{req.endDate.toDate().toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                      <Badge variant={getStatusVariant(req.status)}>{req.status}</Badge>
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
