
'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs, Query } from 'firebase/firestore';
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
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';

interface AttendanceRecord {
    id: string;
    userId: string;
    userName: string;
    clockInTime?: Timestamp;
    clockOutTime?: Timestamp;
}

interface User {
    id: string;
    name: string;
    manager?: string;
}

export function AttendanceReport() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    const fetchUsers = async () => {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const userMap = usersSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = { id: doc.id, ...doc.data() } as User;
            return acc;
        }, {} as Record<string, User>);
        setUsers(userMap);
    };
    fetchUsers();
  }, []);

  const attendanceQuery = useMemo(() => {
    if (!user || !role || Object.keys(users).length === 0) return null;

    let userIdsToQuery: string[] = [];

    if (role === 'Admin') {
        userIdsToQuery = Object.keys(users);
    } else if (role === 'Manager') {
        userIdsToQuery = Object.values(users)
            .filter(u => u.manager === user.displayName)
            .map(u => u.id);
    } else {
        return null;
    }

    if (userIdsToQuery.length === 0) return null;

    return query(
        collection(db, "attendance"),
        where("userId", "in", userIdsToQuery),
        orderBy("clockInTime", "desc")
    ) as Query<AttendanceRecord>;
  }, [user, role, users]);

  const { data: records, loading } = useFirestoreSubscription<AttendanceRecord>({ query: attendanceQuery, enabled: !!attendanceQuery });

  const getStatus = (record: AttendanceRecord): {text: string, variant: "default" | "secondary" | "destructive"} => {
    if (record.clockInTime && !record.clockOutTime) return { text: "Clocked In", variant: "default" };
    if (record.clockInTime && record.clockOutTime) return { text: "Completed", variant: "secondary" };
    return { text: "Error", variant: "destructive"};
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Attendance Report</CardTitle>
        <CardDescription>
          A live log of all clock-in and clock-out events.
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
              ) : records?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No attendance records found.
                    </TableCell>
                </TableRow>
              ) : records?.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-medium">{users[rec.userId]?.name || 'Unknown'}</TableCell>
                  <TableCell>{rec.clockInTime?.toDate().toLocaleString()}</TableCell>
                  <TableCell>{rec.clockOutTime?.toDate().toLocaleString() ?? 'N/A'}</TableCell>
                  <TableCell>
                      <Badge variant={getStatus(rec).variant}>
                          {getStatus(rec).text}
                      </Badge>
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
