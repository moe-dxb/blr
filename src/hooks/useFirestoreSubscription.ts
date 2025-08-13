import { useEffect, useState } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';

export interface FirestoreSubscriptionState<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
}

function mapSnapshot<T = any>(snap: QuerySnapshot&lt;DocumentData&gt;): T[] {
  return snap.docs.map((d) =&gt; ({ id: d.id, ...(d.data() as any) })) as T[];
}

export type FirestoreSubscriptionInput = Query&lt;DocumentData&gt; | null | { query: Query&lt;DocumentData&gt; | null; enabled?: boolean };

const useFirestoreSubscription = &lt;T = any&gt;(input: FirestoreSubscriptionInput): FirestoreSubscriptionState&lt;T&gt; =&gt; {
  const [state, setState] = useState&lt;FirestoreSubscriptionState&lt;T&gt;&gt;({ data: [], loading: true, error: null });

  useEffect(() =&gt; {
    // Normalize inputs: support either a Query|null or an options object { query, enabled }
    const isOptions = typeof input === 'object' &amp;&amp; input !== null &amp;&amp; 'query' in (input as any);
    const q = (isOptions ? (input as any).query : input) as Query&lt;DocumentData&gt; | null;
    const enabled = isOptions ? ((input as any).enabled ?? true) : true;

    if (!q || !enabled) {
      setState((s) =&gt; ({ ...s, loading: false }));
      return;
    }

    const unsub = onSnapshot(
      q,
      (snap) =&gt; setState({ data: mapSnapshot&lt;T&gt;(snap), loading: false, error: null }),
      (err) =&gt; setState({ data: [], loading: false, error: err.message || 'Subscription error' })
    );
    return () =&gt; unsub();
  }, [input]);

  return state;
};

export default useFirestoreSubscription;
export { useFirestoreSubscription };