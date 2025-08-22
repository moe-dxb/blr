// src/lib/firebase/get-expense-data.ts
import 'server-only';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from './firebase-admin';

async function getAuthenticatedUser() {
    try {
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) return null;
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        return { uid: decodedToken.uid };
    } catch (error) {
        return null;
    }
}

export async function getUserExpenseHistory() {
    const user = await getAuthenticatedUser();
    if (!user) {
        return [];
    }

    try {
        const snapshot = await adminDb.collection('expenseClaims')
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        const history = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
                updatedAt: data.updatedAt.toDate().toISOString(),
            };
        });
        
        return history;

    } catch (error) {
        console.error("Error fetching user expense history:", error);
        return [];
    }
}
