
"use client";

import { useMemo } from 'react';
import { collection, query, Query } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { EmployeeList } from './EmployeeList';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';

interface Employee {
    id: string;
    name: string;
    title: string;
    department: string;
    email: string;
    avatar: string;
    hint: string;
}

export default function Directory() {
    const employeesQuery = useMemo(() => {
        if (!db) return null;
        return query(collection(db, "users")) as Query<Employee>;
    }, []);
    const { data: employees, loading, error } = useFirestoreSubscription<Employee>({ query: employeesQuery });

    return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">Company Directory</h1>
            <p className="text-muted-foreground">Find and connect with your colleagues.</p>
          </div>
          <EmployeeList employees={employees || []} loading={loading} error={error ? "Error loading employees" : null} />
        </div>
      );
}
