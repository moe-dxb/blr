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

export type FirestoreSubscriptionInput =
  | Query<DocumentData>
  | null
  | { query: Query<DocumentData> | null; enabled?: boolean };

const useFirestoreSubscription = <T = any>(input: FirestoreSubscriptionInput): FirestoreSubscriptionState<T> => {
  const [state, setState] = useState<FirestoreSubscriptionState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const isOptions = typeof input === 'object' && input !== null && 'query' in (input as any);
    const q = (isOptions ? (input as any).query : input) as Query<DocumentData> | null;
    const enabled = isOptions ? ((input as any).enabled ?? true) : true;

    if (!q || !enabled) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const unsub = onSnapshot(
      q,
      (snap) => setState({ data: mapSnapshot<T>(snap), loading: false, error: null }),
      (err) => setState({ data: [], loading: false, error: (err as any)?.message || 'Subscription error' })
    );
    return () => unsub();
  }, [input]);

  return state;
};

export default useFirestoreSubscription;
export { useFirestoreSubscription };