
"use client";

import { useMemo, useCallback } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, doc, updateDoc, Query } from 'firebase/firestore';
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

interface BookingRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  vehicleId: string;
  date: {
    toDate: () => Date;
  };
  timeSlot: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function BookingRequests() {
  const { toast } = useToast();
  
  const requestsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "vehicleBookings"), where("status", "==", "pending")) as Query<BookingRequest>;
  }, []);

  const { data: requests, loading, error } = useFirestoreSubscription<BookingRequest>({ query: requestsQuery });

  const handleUpdateRequest = useCallback(async (id: string, newStatus: 'approved' | 'rejected') => {
    if (!db) return;
    try {
      const requestDoc = doc(db, 'vehicleBookings', id);
      await updateDoc(requestDoc, { status: newStatus });

      toast({
        title: "Request Updated",
        description: `The booking request has been ${newStatus}.`,
      });
    } catch (error) {
      console.error(`Error updating request to ${newStatus}:`, error);
      toast({
        title: "Update Failed",
        description: "The request could not be updated. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  if (error) {
    toast({
        title: "Error",
        description: "Could not fetch pending booking requests.",
        variant: "destructive",
    });
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pending Vehicle Requests</CardTitle>
        <CardDescription>
          Review and approve or reject requests for company vehicles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" data-testid="loader" />
                  </TableCell>
                </TableRow>
              ) : requests?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        There are no pending requests.
                    </TableCell>
                </TableRow>
              ) : requests?.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div className="font-medium">{req.requesterName}</div>
                    <div className="text-sm text-muted-foreground">{req.requesterEmail}</div>
                  </TableCell>
                  <TableCell>{req.date.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>{req.timeSlot}</TableCell>
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
