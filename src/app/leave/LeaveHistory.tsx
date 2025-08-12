
'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy, Timestamp, Query } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { db } from '@/lib/firebase/firebase';

// Define a precise type for our leave request documents
interface LeaveRequest {
    id: string;
    leaveType: string;
    startDate: Timestamp;
    endDate: Timestamp;
    status: 'pending' | 'approved' | 'denied';
}

// Map status to badge variants for consistent styling
const statusVariantMap: Record<LeaveRequest['status'], BadgeProps['variant']> = {
  approved: 'default',
  pending: 'secondary',
  denied: 'destructive',
};

export function LeaveHistory() {
  const { user } = useAuth();

  const requestsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(collection(db, 'leaveRequests'), where("userId", "==", user!.uid), orderBy("requestedAt", "desc")) as Query<LeaveRequest>;
  }, [user]);

  const { data: requests, loading, error } = useFirestoreSubscription<LeaveRequest>({ query: requestsQuery, enabled: !!user });

  const renderContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </TableCell>
        </TableRow>
      );
    }
    
    if (error) {
        return (
            <TableRow>
                <TableCell colSpan={4} className="text-center text-destructive">
                    Failed to load leave history.
                </TableCell>
            </TableRow>
        );
    }

    if (!requests || requests.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center text-muted-foreground">
            You have not made any leave requests.
          </TableCell>
        </TableRow>
      );
    }

    return requests.map((req) => (
      <TableRow key={req.id}>
        <TableCell className="font-medium">{req.leaveType}</TableCell>
        <TableCell>{format(req.startDate.toDate(), 'MMM dd, yyyy')}</TableCell>
        <TableCell>{format(req.endDate.toDate(), 'MMM dd, yyyy')}</TableCell>
        <TableCell className="text-right">
          <Badge variant={statusVariantMap[req.status] || 'outline'} className="capitalize">{req.status}</Badge>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">My Leave History</CardTitle>
        <CardDescription>A real-time record of your past and pending time off requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
             <TableCaption>{error ? "An error occurred." : "Your leave requests will update here automatically."}</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderContent()}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
