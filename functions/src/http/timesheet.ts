// functions/src/http/timesheet.ts
import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';
import { z } from 'zod';

const db = admin.firestore();

const clockInSchema = z.object({});

export const clockInV2 = functions.https.onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');
  
  clockInSchema.parse(request.data);

  const userRef = db.collection('users').doc(auth.uid);
  const timesheetRef = db.collection('timesheets').doc();
  const auditLogRef = db.collection('auditLogs').doc();

  try {
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found.');
      }
      
      const userData = userDoc.data()!;
      if (userData.attendanceStatus === 'clockedIn') {
        throw new HttpsError('failed-precondition', 'User is already clocked in.');
      }

      transaction.update(userRef, { 
        attendanceStatus: 'clockedIn',
        lastClockIn: admin.firestore.FieldValue.serverTimestamp(),
        activeTimesheetId: timesheetRef.id,
      });

      const newTimesheetEntry = {
        userId: auth.uid,
        clockInTime: admin.firestore.FieldValue.serverTimestamp(),
        clockOutTime: null,
        status: 'open',
      };
      transaction.set(timesheetRef, newTimesheetEntry);

      const auditLogEntry = {
        ts: admin.firestore.FieldValue.serverTimestamp(),
        actorUid: auth.uid,
        action: 'timesheet.clockIn',
        targetRef: timesheetRef.path,
        before: { status: userData.attendanceStatus || 'clockedOut' },
        after: { status: 'clockedIn' },
      };
      transaction.set(auditLogRef, auditLogEntry);
    });

    return { success: true, timesheetId: timesheetRef.id };

  } catch (error) {
    console.error('Error during clock-in:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'An internal error occurred during clock-in.');
  }
});

export const clockOutV2 = functions.https.onCall(async (request) => {
  const auth = request.auth;
  if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');

  const userRef = db.collection('users').doc(auth.uid);
  const auditLogRef = db.collection('auditLogs').doc();

  try {
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) throw new HttpsError('not-found', 'User profile not found.');

      const userData = userDoc.data()!;
      if (userData.attendanceStatus !== 'clockedIn' || !userData.activeTimesheetId) {
        throw new HttpsError('failed-precondition', 'User is not clocked in or no active timesheet found.');
      }

      const timesheetRef = db.collection('timesheets').doc(userData.activeTimesheetId);

      transaction.update(userRef, {
        attendanceStatus: 'clockedOut',
        activeTimesheetId: null,
      });

      transaction.update(timesheetRef, {
        clockOutTime: admin.firestore.FieldValue.serverTimestamp(),
        status: 'closed',
      });

      const auditLogEntry = {
        ts: admin.firestore.FieldValue.serverTimestamp(),
        actorUid: auth.uid,
        action: 'timesheet.clockOut',
        targetRef: timesheetRef.path,
        before: { status: 'open' },
        after: { status: 'closed' },
      };
      transaction.set(auditLogRef, auditLogEntry);
    });

    return { success: true };

  } catch (error) {
    console.error('Error during clock-out:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'An internal error occurred during clock-out.');
  }
});

export const getMyTimesheet = functions.https.onCall(async (request) => {
    const auth = request.auth;
    if (!auth) throw new HttpsError('unauthenticated', 'Authentication required.');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today.setDate(today.getDate() - dayOfWeek));

    try {
        const snapshot = await db.collection('timesheets')
            .where('userId', '==', auth.uid)
            .where('clockInTime', '>=', admin.firestore.Timestamp.fromDate(startOfWeek))
            .orderBy('clockInTime', 'desc')
            .get();
            
        const entries = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                clockInTime: data.clockInTime?.toDate().toISOString(),
                clockOutTime: data.clockOutTime?.toDate().toISOString(),
            };
        });
        
        return { entries };

    } catch (error) {
        console.error('Error getting user timesheet:', error);
        throw new HttpsError('internal', 'An internal error occurred.');
    }
});
