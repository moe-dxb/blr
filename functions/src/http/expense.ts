// functions/src/http/expense.ts
import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { z } from 'zod';
import { HttpsError } from 'firebase-functions/v2/https';

// Zod schema for a single line item in an expense claim
const ExpenseItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  category: z.string().min(1, 'Category is required.'),
  description: z.string().min(1, 'Description is required.').max(500),
  amount: z.number().positive('Amount must be greater than zero.'),
});

// Zod schema for the overall expense claim
const ExpenseClaimSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1, 'A title for the claim is required.').max(100),
  items: z.array(ExpenseItemSchema).min(1, 'At least one expense item is required.'),
  totalAmount: z.number().positive('Total amount must be greater than zero.'),
  // receiptUrls: z.array(z.string().url()).optional(), // To be used after implementing file uploads
});

/**
 * A callable Cloud Function to create a new expense claim.
 */
export const createExpenseClaim = functions.https.onCall(async (request) => {
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  try {
    const parsedData = ExpenseClaimSchema.parse(request.data);

    if (parsedData.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'You can only create an expense claim for yourself.');
    }
    
    // Server-side validation to ensure the sum of items matches the total amount
    const calculatedTotal = parsedData.items.reduce((sum, item) => sum + item.amount, 0);
    if (Math.abs(calculatedTotal - parsedData.totalAmount) > 0.01) { // Check for floating point discrepancies
        throw new HttpsError('invalid-argument', 'The provided total amount does not match the sum of the items.');
    }

    const db = admin.firestore();
    const claimRef = db.collection('expenseClaims').doc();
    const auditLogRef = db.collection('auditLogs').doc();

    const newClaim = {
      ...parsedData,
      status: 'submitted',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const auditLogEntry = {
      ts: admin.firestore.FieldValue.serverTimestamp(),
      actorUid: auth.uid,
      action: 'expense.create',
      targetRef: claimRef.path,
      before: null,
      after: newClaim,
    };

    await db.runTransaction(async (transaction) => {
      transaction.set(claimRef, newClaim);
      transaction.set(auditLogRef, auditLogEntry);
    });

    return { success: true, id: claimRef.id };

  } catch (error) {
    console.error('Error creating expense claim:', error);
    if (error instanceof z.ZodError) {
      throw new HttpsError('invalid-argument', 'Invalid data provided.', error.errors);
    }
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'An internal error occurred.');
  }
});
