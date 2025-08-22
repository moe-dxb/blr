// functions/src/http/expense-admin.ts
import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { sendNotification } from '../notifications'; // Import the helper

const db = admin.firestore();

/**
 * Gets a list of expense claims for an admin, HR, or manager.
 */
export const getExpenseClaims = functions.https.onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  const userDoc = await db.collection('users').doc(auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (!['admin', 'hr', 'manager'].includes(userRole)) {
    throw new HttpsError('permission-denied', 'You do not have permission to view expense claims.');
  }

  try {
    let query: admin.firestore.Query = db.collection('expenseClaims');

    if (userRole === 'manager') {
      const reportsSnapshot = await db.collection('users').where('managerId', '==', auth.uid).get();
      const reportIds = reportsSnapshot.docs.map(doc => doc.id);
      if (reportIds.length === 0) return { claims: [] };
      query = query.where('userId', 'in', reportIds);
    }

    const snapshot = await query.where('status', '==', 'submitted').orderBy('createdAt', 'desc').limit(50).get();
    const claims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { claims };

  } catch (error) {
    console.error('Error getting expense claims:', error);
    throw new HttpsError('internal', 'An internal error occurred.');
  }
});

const updateExpenseStatusSchema = z.object({
  claimId: z.string(),
  status: z.enum(['approved', 'declined']),
});

/**
 * Approves or declines an expense claim and sends a notification.
 */
export const updateExpenseClaimStatus = functions.https.onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  const { claimId, status } = updateExpenseStatusSchema.parse(request.data);

  const claimRef = db.collection('expenseClaims').doc(claimId);
  
  const [userDoc, claimDoc] = await Promise.all([
    db.collection('users').doc(auth.uid).get(),
    claimRef.get()
  ]);

  const userRole = userDoc.data()?.role;
  const claimData = claimDoc.data();

  if (!claimData) throw new HttpsError('not-found', 'Expense claim not found.');

  const isManagerOfEmployee = userRole === 'manager' && claimData.managerId === auth.uid;
  const isAdminOrHR = ['admin', 'hr'].includes(userRole);

  if (!isAdminOrHR && !isManagerOfEmployee) {
    throw new HttpsError('permission-denied', 'You do not have permission to modify this claim.');
  }
  
  if (claimData.status !== 'submitted') {
     throw new HttpsError('failed-precondition', `Claim has already been ${claimData.status}.`);
  }

  try {
    const auditLogRef = db.collection('auditLogs').doc();
    await db.runTransaction(async (transaction) => {
      transaction.update(claimRef, { status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      transaction.set(auditLogRef, {
        ts: admin.firestore.FieldValue.serverTimestamp(),
        actorUid: auth.uid,
        action: `expense.${status}`,
        targetRef: claimRef.path,
        before: { status: claimData.status },
        after: { status },
      });
    });

    await sendNotification({
      toUid: claimData.userId,
      type: 'expense_status',
      title: `Your expense claim was ${status}`,
      message: `Your claim "${claimData.title}" for $${claimData.totalAmount} has been ${status}.`,
      link: '/expenses',
    });
    
    return { success: true };

  } catch (error) {
    console.error('Error updating expense claim status:', error);
    throw new HttpsError('internal', 'An internal error occurred.');
  }
});
