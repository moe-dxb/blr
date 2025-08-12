
'use client';

import { useMemo } from 'react';
import {
  Card,
  CardHeader
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileWarning, CheckCircle, Loader2 } from "lucide-react";
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { db } from '@/lib/firebase/firebase';
import { collection, query, orderBy, Query } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Policy {
  id: string;
  title: string;
  acknowledgements: string[];
  dueDate: string;
}

export default function PolicyAcknowledgementPage() {
    const { user } = useAuth();
    
    const policiesQuery = useMemo(() => {
        if (!db) return null;
        return query(collection(db, "policies"), orderBy("dueDate", "asc")) as Query<Policy>
    }, []);

    const { data: policies, loading, error } = useFirestoreSubscription<Policy>({ query: policiesQuery });
    
    const getStatus = (policy: Policy): { text: string; variant: BadgeProps["variant"]; icon: JSX.Element } => {
        if(user && policy.acknowledgements?.includes(user.uid)) {
            return { text: 'Completed', variant: 'default', icon: <CheckCircle className="mr-2 h-3 w-3" /> };
        }
        if (new Date(policy.dueDate) < new Date()) {
            return { text: 'Overdue', variant: 'destructive', icon: <FileWarning className="mr-2 h-3 w-3" /> };
        }
        return { text: 'Pending', variant: 'secondary', icon: <FileWarning className="mr-2 h-3 w-3" /> };
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <h1 className="text-3xl font-bold font-headline">Policy Acknowledgement</h1>
            <p className="text-muted-foreground">Please review and acknowledge the following documents.</p>
        </CardHeader>
      </Card>

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
            {loading ? <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="animate-spin"/></TableCell></TableRow> :
             error ? <TableRow><TableCell colSpan={4} className="text-center text-destructive">Failed to load policies.</TableCell></TableRow> :
             policies?.map(policy => {
                const status = getStatus(policy);
                return (
                    <TableRow key={policy.id}>
                        <TableCell className="font-medium">{policy.title}</TableCell>
                        <TableCell>{new Date(policy.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={status.variant}>{status.icon}{status.text}</Badge></TableCell>
                        <TableCell className="text-right">
                           <Button asChild>
                             <Link href={`/policies#${policy.id}`}>
                                {status.text === 'Completed' ? 'View' : 'Review & Sign'}
                             </Link>
                           </Button>
                        </TableCell>
                    </TableRow>
                )
             })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
