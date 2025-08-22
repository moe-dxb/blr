// src/lib/firebase/get-approval-data.ts
import 'server-only'; // Ensures this code only runs on the server
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from './firebase-admin';

async function getAuthenticatedUser() {
    try {
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) return null;
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists) return null;
        return { uid: decodedToken.uid, ...userDoc.data() };
    } catch (error) {
        console.error("Authentication error on server:", error);
        return null;
    }
}

export async function getApprovalData() {
    const user = await getAuthenticatedUser();

    if (!user || !['admin', 'hr', 'manager'].includes(user.role)) {
        // Return empty arrays if user is not authorized, page will show "no requests"
        return { leaveRequests: [], expenseClaims: [] };
    }

    try {
        let leaveQuery = adminDb.collection('leaveRequests').where('status', '==', 'submitted');
        let expenseQuery = adminDb.collection('expenseClaims').where('status', '==', 'submitted');

        if (user.role === 'manager') {
            const reportsSnapshot = await adminDb.collection('users').where('managerId', '==', user.uid).get();
            const reportIds = reportsSnapshot.docs.map(doc => doc.id);
            
            if (reportIds.length === 0) {
                return { leaveRequests: [], expenseClaims: [] };
            }
            leaveQuery = leaveQuery.where('userId', 'in', reportIds);
            expenseQuery = expenseQuery.where('userId', 'in', reportIds);
        }

        const [leaveSnapshot, expenseSnapshot] = await Promise.all([
            leaveQuery.orderBy('createdAt', 'desc').get(),
            expenseQuery.orderBy('createdAt', 'desc').get(),
        ]);
        
        const leaveRequests = leaveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const expenseClaims = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return { leaveRequests, expenseClaims };

    } catch (error) {
        console.error("Error fetching approval data:", error);
        return { leaveRequests: [], expenseClaims: [] }; // Return empty on error
    }
}
