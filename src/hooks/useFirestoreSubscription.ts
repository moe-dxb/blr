
import { useState, useEffect } from 'react';
import { Query, onSnapshot } from 'firebase/firestore';

interface SubscriptionResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
}

export function useFirestoreSubscription<T>(query: Query): SubscriptionResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(result);
        setLoading(false);
      },
      (err) => {
        console.error("Error in Firestore subscription:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
