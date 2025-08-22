// src/lib/firebase/get-timesheet-data.ts
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

export async function getUserTimesheet() {
    const user = await getAuthenticatedUser();
    if (!user) {
        return [];
    }

    try {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        const snapshot = await adminDb.collection('timesheets')
            .where('userId', '==', user.uid)
            .where('clockInTime', '>=', startOfWeek)
            .orderBy('clockInTime', 'desc')
            .get();

        const entries = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                clockInTime: data.clockInTime.toDate().toISOString(),
                clockOutTime: data.clockOutTime?.toDate().toISOString() || null,
            };
        });
        
        return entries;

    } catch (error) {
        console.error("Error fetching user timesheet:", error);
        return [];
    }
}
