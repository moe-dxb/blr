
"use client";

import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { PolicyList } from './PolicyList';
import { useAuth } from '@/hooks/useAuth';

interface Policy {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    acknowledgements: string[];
}

const getPolicies = httpsCallable<unknown, Policy[]>(getFunctions(), 'getPolicies');

export default function Policies() {
    const { user } = useAuth();
    const [policies, setPolicies] = useState<Policy[]>([]);

    useEffect(() => {
        if (user) {
            getPolicies().then(result => setPolicies(result.data));
        }
    }, [user]);

    return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">Company Policies</h1>
            <p className="text-muted-foreground">
              Stay up-to-date with the latest company policies and procedures.
            </p>
          </div>
          <PolicyList initialPolicies={policies} />
        </div>
      );
}
