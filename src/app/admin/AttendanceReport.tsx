
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, getDocs } from 'firebase/firestore';
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

interface AttendanceRecord {
    id: string;
    userId: string;
    userName: string; // We'll need to fetch this
    type: 'clock-in' | 'clock-out';
    timestamp: Timestamp;
}

interface User {
    id: string;
    name: string;
}

export function AttendanceReport() {
  const { user, role } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !role) return;

    setLoading(true);
    
    const fetchData = async () => {
        let userIdsToQuery: string[] = [];
        
        // Admins see everyone's data. Managers only see their team's data.
        if (role === 'Admin') {
            const usersSnapshot = await getDocs(collection(db, "users"));
            userIdsToQuery = usersSnapshot.docs.map(doc => doc.id);
        } else if (role === 'Manager') {
            const teamQuery = query(collection(db, "users"), where("manager", "==", user.displayName));
            const teamSnapshot = await getDocs(teamQuery);
            userIdsToQuery = teamSnapshot.docs.map(doc => doc.id);
        } else {
            // Employees shouldn't see this report
            setLoading(false);
            return;
        }

        if (userIdsToQuery.length === 0) {
            setLoading(false);
            return;
        }

        const attendanceQuery = query(
            collection(db, "attendance"),
            where("userId", "in", userIdsToQuery),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(attendanceQuery, async (snapshot) => {
            // Fetch user details to map names to records
            const usersSnapshot = await getDocs(collection(db, "users"));
            const users = usersSnapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data().name;
                return acc;
            }, {} as {[key: string]: string});

            const recordList = snapshot.docs.map(doc => ({ 
                id: doc.id,
                ...doc.data(),
                userName: users[doc.data().userId] || 'Unknown User'
            } as AttendanceRecord));
            setRecords(recordList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching attendance records:", error);
            setLoading(false);
        });

        return unsubscribe;
    };

    fetchData();

  }, [user, role]);
  
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
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                        No attendance records found.
                    </TableCell>
                </TableRow>
              ) : records.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-medium">{rec.userName}</TableCell>
                  <TableCell>
                      <Badge variant={rec.type === 'clock-in' ? 'default' : 'secondary'}>
                          {rec.type === 'clock-in' ? 'Clock In' : 'Clock Out'}
                      </Badge>
                  </TableCell>
                  <TableCell>{rec.timestamp.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>{rec.timestamp.toDate().toLocaleTimeString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
