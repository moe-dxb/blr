import { useEffect, useState } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';

export interface FirestoreSubscriptionState<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
}

function mapSnapshot<T = any>(snap: QuerySnapshot<DocumentData>): T[] {
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as T[];
}

const useFirestoreSubscription = <T = any>(query: Query<DocumentData> | null): FirestoreSubscriptionState<T> => {
  const [state, setState] = useState<FirestoreSubscriptionState<T>>({ data: [], loading: true, error: null });

  useEffect(() => {
    if (!query) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    const unsub = onSnapshot(
      query,
      (snap) => setState({ data: mapSnapshot<T>(snap), loading: false, error: null }),
      (err) => setState({ data: [], loading: false, error: err.message || 'Subscription error' })
    );
    return () => unsub();
  }, [query]);

  return state;
};

export default useFirestoreSubscription;
export { useFirestoreSubscription };