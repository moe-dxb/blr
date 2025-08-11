
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/firebase';
import { collection, query, onSnapshot, Query } from 'firebase/firestore';

interface SubscriptionOptions {
    queryFn: (ref: any) => Query;
}

export function useFirestoreSubscription<T>(collectionName: string, { queryFn }: SubscriptionOptions) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        const collectionRef = collection(db, collectionName);
        
        // The query function is passed in, allowing this hook to be used for any query.
        const q = queryFn(collectionRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const result = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
            setData(result);
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError(err);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    // The dependency array must include the collection name and a stable reference to the query function.
    // For now, we assume queryFn is stable or correctly memoized by the caller.
    }, [collectionName, queryFn]);

    return { data, loading, error };
}
