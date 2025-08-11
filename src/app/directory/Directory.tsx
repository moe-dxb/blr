
"use client";

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { EmployeeList } from './EmployeeList';
import { useAuth } from '@/hooks/useAuth';

interface Employee {
    id: string;
    name: string;
    title: string;
    department: string;
    email: string;
    avatar: string;
    hint: string;
}

const getDirectory = httpsCallable<unknown, Employee[]>(getFunctions(), 'getDirectory');

export default function Directory() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        if (user) {
            getDirectory().then(result => setEmployees(result.data));
        }
    }, [user]);

    return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">Company Directory</h1>
            <p className="text-muted-foreground">Find and connect with your colleagues.</p>
          </div>
          <EmployeeList employees={employees} />
        </div>
      );
}
