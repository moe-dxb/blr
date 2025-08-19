"use client";

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Role, isAdmin, isManager } from '@/lib/auth/roles';

export type UserDoc = {
  id: string;
  name?: string;
  email?: string;
  managerId?: string;
  department?: string;
  role?: Role;
};

export function useDirectReports() {
  const { user, role } = useAuth();
  const [reports, setReports] = useState<UserDoc[]>([]);
  const [allUsers, setAllUsers] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const fdb = db!;
    const run = async () => {
      setLoading(true);
      try {
        const currentRole = role as Role;
        if (isAdmin(currentRole)) {
          const snap = await getDocs(collection(fdb, 'users'));
          const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          setAllUsers(arr);
          setReports(arr); // Admin effectively sees all
        } else if (isManager(currentRole)) {
          if (!user) return;
          const q = query(collection(fdb, 'users'), where('managerId', '==', user.uid));
          const snap = await getDocs(q);
          const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          setReports(arr);
        } else {
          setReports([]);
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.uid, role]);

  const reportIds = useMemo(() => reports.map(r => r.id), [reports]);
  const usersById = useMemo(() => {
    const map: Record<string, UserDoc> = {};
    const currentRole = role as Role;
    (isAdmin(currentRole) ? allUsers : reports).forEach(u => (map[u.id] = u));
    return map;
  }, [reports, allUsers, role]);

  return { reports, reportIds, usersById, loading, role };
}