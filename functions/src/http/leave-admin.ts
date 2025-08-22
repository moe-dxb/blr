// functions/src/http/leave-admin.ts
import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';
import { sendNotification } from '../notifications'; // Import the new helper

const db = admin.firestore();

/**
 * Gets a list of leave requests for an admin, HR, or manager.
 */
export const getLeaveRequests = functions.https.onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  const userDoc = await db.collection('users').doc(auth.uid).get();
  const userRole = userDoc.data()?.role;

  if (!['admin', 'hr', 'manager'].includes(userRole)) {
    throw new HttpsError('permission-denied', 'You do not have permission to view these requests.');
  }

  try {
    let query: admin.firestore.Query = db.collection('leaveRequests');

    if (userRole === 'manager') {
      const reportsSnapshot = await db.collection('users').where('managerId', '==', auth.uid).get();
      const reportIds = reportsSnapshot.docs.map(doc => doc.id);
      if (reportIds.length === 0) return { requests: [] };
      query = query.where('userId', 'in', reportIds);
    }

    const snapshot = await query.where('status', '==', 'submitted').orderBy('createdAt', 'desc').limit(50).get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { requests };

  } catch (error) {
    console.error('Error getting leave requests:', error);
    throw new HttpsError('internal', 'An internal error occurred.');
  }
});

const updateStatusSchema = z.object({
  requestId: z.string(),
  status: z.enum(['approved', 'declined']),
});

/**
 * Approves or declines a leave request and sends a notification.
 */
export const updateLeaveRequestStatus = functions.https.onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  const { requestId, status } = updateStatusSchema.parse(request.data);

  const requestRef = db.collection('leaveRequests').doc(requestId);
  const [userDoc, requestDoc] = await Promise.all([
    db.collection('users').doc(auth.uid).get(),
    requestRef.get()
  ]);
  
  const userRole = userDoc.data()?.role;
  const requestData = requestDoc.data();

  if (!requestData) throw new HttpsError('not-found', 'Leave request not found.');

  const isManagerOfEmployee = userRole === 'manager' && requestData.managerId === auth.uid;
  const isAdminOrHR = ['admin', 'hr'].includes(userRole);

  if (!isAdminOrHR && !isManagerOfEmployee) {
    throw new HttpsError('permission-denied', 'You do not have permission to modify this request.');
  }
  
  if (requestData.status !== 'submitted') {
     throw new HttpsError('failed-precondition', `Request has already been ${requestData.status}.`);
  }

  try {
    // Step 1: Perform the primary action in a transaction
    const auditLogRef = db.collection('auditLogs').doc();
    await db.runTransaction(async (transaction) => {
      transaction.update(requestRef, { status, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      transaction.set(auditLogRef, {
        ts: admin.firestore.FieldValue.serverTimestamp(),
        actorUid: auth.uid,
        action: `leave.${status}`,
        targetRef: requestRef.path,
        before: { status: requestData.status },
        after: { status },
      });
    });

    // Step 2: Await the background task (notification) after the transaction is complete
    await sendNotification({
      toUid: requestData.userId,
      type: 'leave_status',
      title: `Your leave request was ${status}`,
      message: `Your request from ${requestData.startDate} to ${requestData.endDate} has been ${status}.`,
      link: `/leave`, // Link to the leave page
    });
    
    return { success: true };

  } catch (error) {
    console.error('Error updating leave request status:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'An internal error occurred.');
  }
});
