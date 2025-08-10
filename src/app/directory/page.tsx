
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebaseAdmin';
import { EmployeeList } from './EmployeeList';

async function getEmployees() {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            title: data.role,
            department: data.department || 'N/A',
            email: data.email,
            avatar: `https://placehold.co/100x100.png`,
            hint: 'person face',
        };
    });
}

export default async function DirectoryPage() {
  const employees = await getEmployees();

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
