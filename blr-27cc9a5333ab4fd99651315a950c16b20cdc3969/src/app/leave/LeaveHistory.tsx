'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore, orderBy, query, where, DocumentData } from 'firebase/firestore';
import { app } from '@/lib/firebase/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { isAdminOrManager, Role } from '@/lib/auth/roles';

export function LeaveHistory() {
  const db = app ? getFirestore(app) : null as any;
  const { user, role } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!db || !user) return;
      setLoading(true);
      try {
        let q: any;
        if (isAdminOrManager(role as Role)) {
          // Admin/Manager: show pending first across their scope. For MVP, show all.
          q = query(collection(db, 'leaveRequests'), orderBy('requestedAt', 'desc'));
        } else {
          q = query(collection(db, 'leaveRequests'), where('userId', '==', user.uid), orderBy('requestedAt', 'desc'));
        }
        const snap = await getDocs(q as any);
        setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) })));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [db, user, role]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading history...</div>;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-2 py-1">Employee</th>
                <th className="px-2 py-1">Type</th>
                <th className="px-2 py-1">Start</th>
                <th className="px-2 py-1">End</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="px-2 py-2">{r.userId}</td>
                  <td className="px-2 py-2">{r.leaveType}</td>
                  <td className="px-2 py-2">{r.startDate?.toDate ? r.startDate.toDate().toLocaleDateString() : r.startDate}</td>
                  <td className="px-2 py-2">{r.endDate?.toDate ? r.endDate.toDate().toLocaleDateString() : r.endDate}</td>
                  <td className="px-2 py-2 capitalize">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}