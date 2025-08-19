'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { useDirectReports } from '@/hooks/useDirectReports';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Role, isAdmin, isManager } from '@/lib/auth/roles';

interface AttendanceRecord {
  id: string;
  userId: string;
  clockInTime?: { toDate: () => Date };
  clockOutTime?: { toDate: () => Date };
}

export function AttendanceReport() {
  const { reportIds, usersById, loading: loadingReports, role } = useDirectReports();

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!db) return;
      const fdb = db!;
      setLoading(true);
      try {
        let ids: string[] = [];
        if (isAdmin(role as Role)) {
          // Admin: show all via collectionGroup (no filter). For large datasets, consider pagination.
          const q = query(collectionGroup(fdb, 'attendance'));
          const snap = await getDocs(q);
          setRecords(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        } else if (isManager(role as Role)) {
          ids = reportIds;
          if (ids.length === 0) {
            setRecords([]);
          } else if (ids.length <= 10) {
            const q = query(collectionGroup(fdb, 'attendance'), where('userId', 'in', ids));
            const snap = await getDocs(q);
            setRecords(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
          } else {
            // Fallback: fetch all and filter client-side to avoid Firestore 'in' limit
            const q = query(collectionGroup(fdb, 'attendance'));
            const snap = await getDocs(q);
            const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            setRecords(all.filter(r => ids.includes((r as any).userId)) as any);
          }
        } else {
          setRecords([]);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [reportIds.join(','), role]);

  const getStatus = (record: AttendanceRecord): { text: string; variant: 'default' | 'secondary' | 'destructive' } => {
    if (record.clockInTime && !record.clockOutTime) return { text: 'Clocked In', variant: 'default' };
    if (record.clockInTime && record.clockOutTime) return { text: 'Completed', variant: 'secondary' };
    return { text: 'Error', variant: 'destructive' };
  };

  const sorted = [...records].sort((a, b) => {
    const at = a.clockInTime?.toDate()?.getTime?.() || 0;
    const bt = b.clockInTime?.toDate()?.getTime?.() || 0;
    return bt - at;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Attendance Report</CardTitle>
        <CardDescription>
          {isAdmin(role as Role) ? 'All employees' : isManager(role as Role) ? 'Your team only' : 'Not authorized'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{usersById[rec.userId]?.name || rec.userId}</TableCell>
                    <TableCell>{rec.clockInTime ? rec.clockInTime.toDate().toLocaleString() : '—'}</TableCell>
                    <TableCell>{rec.clockOutTime ? rec.clockOutTime.toDate().toLocaleString() : '—'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatus(rec).variant}>{getStatus(rec).text}</Badge>
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