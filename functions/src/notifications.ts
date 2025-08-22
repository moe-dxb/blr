// functions/src/notifications.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const db = admin.firestore();

interface NotificationPayload {
  toUid: string;
  type: 'leave_status' | 'expense_status' | 'announcement'; // Add more types as needed
  title: string;
  message: string;
  link?: string; // e.g., a link to the specific leave request
}

/**
 * Creates a notification document in Firestore.
 * This is a helper function to be called by other backend functions.
 * It is not a callable function itself.
 * @param payload The notification data.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  try {
    const notificationRef = db.collection('notifications').doc();
    
    await notificationRef.set({
      ...payload,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      readAt: null, // Mark as unread initially
    });

    // Also, update a counter on the user's doc for easy access to unread count
    const userRef = db.collection('users').doc(payload.toUid);
    await userRef.update({
        unreadNotifications: admin.firestore.FieldValue.increment(1),
    });

  } catch (error) {
      functions.logger.error(`Failed to send notification to ${payload.toUid}`, error);
      // We don't rethrow here because the primary action (e.g., approving leave)
      // should not fail if the notification fails. Logging the error is sufficient.
  }
}
