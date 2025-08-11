
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query } from 'firebase/firestore';

interface SubscriptionOptions<T> {
    query: Query<T> | null;
    enabled?: boolean;
}

export function useFirestoreSubscription<T>({ query, enabled = true }: SubscriptionOptions<T>) {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!enabled || !query) {
            setLoading(false);
            setData([]);
            return;
        }

        setLoading(true);
        
        const unsubscribe = onSnapshot(query, (snapshot) => {
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
    }, [query, enabled]);

    return { data, loading, error };
}
