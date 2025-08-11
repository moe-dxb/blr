
"use client";

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { PolicyList } from './PolicyList';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { Card, CardHeader } from '@/components/ui/card';

export interface Policy {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    acknowledgements: string[];
}

export default function Policies() {
    const policiesQuery = useMemo(() => {
      return query(collection(db, "policies"), orderBy("createdAt", "desc"));
    }, []);
    
    const { data: policies, loading, error } = useFirestoreSubscription<Policy>({ query: policiesQuery });

    return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <h1 className="text-3xl font-bold font-headline">Company Policies</h1>
                <p className="text-muted-foreground">
                Stay up-to-date with the latest company policies and procedures.
                </p>
            </CardHeader>
          </Card>
          <PolicyList initialPolicies={policies || []} loading={loading} error={error ? "Failed to load policies" : null} />
        </div>
      );
}
