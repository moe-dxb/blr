'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDirectReports } from '@/hooks/useDirectReports';
import {
  collection,
  onSnapshot,
  query,
  where,
  Query,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, ExternalLink } from 'lucide-react';
import { Role, isAdmin, isManager } from '@/lib/auth/roles';

interface ExpenseClaim {
  id: string;
  userId: string;
  userName?: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  receipt?: string; // signed URL
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt?: any;
  decidedAt?: any;
  decidedBy?: string;
}

export default function ExpenseClaimsAdmin() {
  const { role, user } = useAuth();
  const { reportIds } = useDirectReports();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);

  useEffect(() => {
    if (!db) return;
    const fdb = db!;
    setLoading(true);
    let unsub = () => {};

    const run = async () => {
      try {
        if (isAdmin(role as Role)) {
          const q = query(collection(fdb, 'expenseClaims'), where('status', '==', 'Pending')) as Query<ExpenseClaim>;
          unsub = onSnapshot(q, (snap) => setClaims(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
        } else if (isManager(role as Role)) {
          if (reportIds.length === 0) {
            setClaims([]);
            return;
          }
          if (reportIds.length <= 10) {
            const q = query(
              collection(fdb, 'expenseClaims'),
              where('status', '==', 'Pending'),
              where('userId', 'in', reportIds)
            ) as Query<ExpenseClaim>;
            unsub = onSnapshot(q, (snap) => setClaims(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))));
          } else {
            // Fallback: subscribe all pending and filter client-side
            const q = query(collection(fdb, 'expenseClaims'), where('status', '==', 'Pending')) as Query<ExpenseClaim>;
            unsub = onSnapshot(q, (snap) => {
              const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
              setClaims(all.filter((c: any) => reportIds.includes(c.userId)) as any);
            });
          }
        } else {
          setClaims([]);
        }
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => unsub();
  }, [role, reportIds.join(',')]);

  const handleDecision = useCallback(async (id: string, nextStatus: 'Approved' | 'Rejected') => {
    if (!db || !user) return;
    try {
      await updateDoc(doc(db, 'expenseClaims', id), {
        status: nextStatus,
        decidedAt: serverTimestamp(),
        decidedBy: user.uid,
      });
      toast({ title: nextStatus, description: `Expense claim ${nextStatus.toLowerCase()}.` });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message || 'Could not update claim', variant: 'destructive' });
    }
  }, [toast, user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Pending Expense Claims</CardTitle>
        <CardDescription>Approve or reject expense claims from your team.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No pending expense claims.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.userName || c.userId}</TableCell>
                    <TableCell>{new Date(c.date).toLocaleDateString()}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>${c.amount?.toFixed(2)}</TableCell>
                    <TableCell className="max-w-[240px] truncate" title={c.description}>{c.description}</TableCell>
                    <TableCell>
                      {c.receipt ? (
                        <a href={c.receipt} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <Badge variant="secondary">No Receipt</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        onClick={() => handleDecision(c.id, 'Approved')}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDecision(c.id, 'Rejected')}
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