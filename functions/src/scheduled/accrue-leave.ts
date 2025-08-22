// functions/src/scheduled/accrue-leave.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * A scheduled Cloud Function that runs nightly to accrue leave for all employees.
 *
 * This is a placeholder and requires business logic for accrual rules.
 */
export const accrueLeaveBalances = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  functions.logger.info('Starting nightly leave accrual process.', { structuredData: true });

  const db = admin.firestore();
  const usersRef = db.collection('users');

  try {
    // 1. Get all users. For large sets, this should be paginated.
    const snapshot = await usersRef.where('role', 'in', ['employee', 'manager']).get();

    if (snapshot.empty) {
      functions.logger.info('No users found to accrue leave for.');
      return;
    }

    // 2. Iterate and update each user's leave balance.
    //    This is where you would implement your company's specific accrual logic.
    //    e.g., check their start date, role, current balance, etc.
    const batch = db.batch();
    snapshot.forEach(doc => {
      const user = doc.data();
      const currentBalance = user.leaveBalance?.annual || 0;
      
      // --- DUMMY ACCRUAL LOGIC ---
      // Replace this with your actual business rules.
      // Example: Add 0.0833 days per day (approx 2.5 days/month)
      const newBalance = currentBalance + 0.0833; 
      // ----------------------------

      const userRef = usersRef.doc(doc.id);
      batch.update(userRef, { 'leaveBalance.annual': newBalance });
    });

    // 3. Commit the batch update.
    await batch.commit();
    functions.logger.info(`Successfully updated leave balances for ${snapshot.size} users.`);

  } catch (error) {
    functions.logger.error('Error during nightly leave accrual:', error);
  }
});
