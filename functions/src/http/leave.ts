// functions/src/http/leave.ts
import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { HttpsError } from 'firebase-functions/v2/https';

// Define the schema for creating a leave request using Zod
const LeaveRequestSchema = z.object({
  userId: z.string().min(1, 'User ID cannot be empty.'),
  type: z.enum(['annual', 'sick', 'unpaid', 'other']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format.'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format.'),
  reason: z.string().max(1000).optional(),
});

/**
 * A callable Cloud Function to create a new leave request.
 * It validates input and creates an audit log entry in a single transaction.
 */
export const createLeaveRequest = functions.https.onCall(async (request) => {
  // 1. Authentication Check
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  try {
    // 2. Input Validation
    const parsedData = LeaveRequestSchema.parse(request.data);

    // 3. Authorization Check
    if (parsedData.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'You can only create a leave request for yourself.');
    }

    const db = admin.firestore();
    const leaveRequestRef = db.collection('leaveRequests').doc();
    const auditLogRef = db.collection('auditLogs').doc();

    const newLeaveRequest = {
      ...parsedData,
      status: 'submitted',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const auditLogEntry = {
      ts: admin.firestore.FieldValue.serverTimestamp(),
      actorUid: auth.uid,
      action: 'leave.create',
      targetRef: leaveRequestRef.path,
      before: null,
      after: newLeaveRequest,
    };

    // 4. Transactional Write for Atomicity
    await db.runTransaction(async (transaction) => {
      transaction.set(leaveRequestRef, newLeaveRequest);
      transaction.set(auditLogRef, auditLogEntry);
    });

    return { success: true, id: leaveRequestRef.id };

  } catch (error) {
    console.error('Error creating leave request:', error);
    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', 'Invalid data provided.', error.errors);
    }
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'An internal error occurred.');
  }
});
