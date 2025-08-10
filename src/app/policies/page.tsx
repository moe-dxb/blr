
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseAdmin';
import { PolicyList } from './PolicyList';

async function getPolicies() {
    const policiesCollection = collection(db, 'policies');
    const q = query(policiesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt.toDate().toISOString(), // Convert to serializable format
            acknowledgements: data.acknowledgements || [],
        };
    });
}

export default async function PolicyHubPage() {
  const initialPolicies = await getPolicies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Company Policies</h1>
        <p className="text-muted-foreground">
          Stay up-to-date with the latest company policies and procedures.
        </p>
      </div>
      <PolicyList initialPolicies={initialPolicies} />
    </div>
  );
}
