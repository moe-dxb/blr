import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// These triggers are provided to satisfy existing deployed function names
// seen by Firebase during CI so deploys don't abort. They are intentionally
// minimal and safe to run in production. We can extend their logic later.

// Firestore onUpdate for leave requests
export const onLeaveRequestUpdate = functions
  .region('us-central1')
  .firestore.document('leaveRequests/{leaveId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // No-op: write an audit stamp when status changes
    try {
      if (before?.status !== after?.status) {
        await admin.firestore()
          .collection('leaveRequests')
          .doc(context.params.leaveId)
          .set({ lastStatusChangeAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      // swallow errors to avoid retries storm; logs visible in Cloud Logging
      console.error('onLeaveRequestUpdate error', e);
    }
    return;
  });

// Firestore onUpdate for vehicle bookings (e.g., set approvedAt timestamp)
export const onVehicleBookingApproved = functions
  .region('us-central1')
  .firestore.document('vehicleBookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    try {
      const becameApproved = before?.status !== 'Approved' && after?.status === 'Approved';
      if (becameApproved) {
        await admin.firestore()
          .collection('vehicleBookings')
          .doc(context.params.bookingId)
          .set({ approvedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.error('onVehicleBookingApproved error', e);
    }
    return;
  });