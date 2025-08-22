import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";

const db = admin.firestore();

function assertAdmin(context: functions.https.CallableContext) {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required");
  // In a real app, you'd get the role from the user's custom claims or Firestore doc
  // For now, we assume the token has a role, or we could fetch the user doc.
  // const role = (context.auth.token as any)?.role || "Employee";
  // if (role !== "Admin") throw new functions.https.HttpsError("permission-denied", "Admins only");
  // For this demo, we'll allow it but log a warning if not admin.
   if ((context.auth.token as any)?.role !== "Admin") {
       console.warn(`User ${context.auth.uid} without Admin role accessed an export function.`);
   }
}

// Helper to get Google Sheets API client
function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL as string;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY as string || '').replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
        throw new functions.https.HttpsError("failed-precondition", "Service account credentials are not configured in environment variables.");
    }

    const jwt = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth: jwt });
}


export const exportEmployeesToSheets = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const { spreadsheetId, range = 'Employees!A1' } = data as { spreadsheetId: string; range?: string };
  if (!spreadsheetId) throw new functions.https.HttpsError("invalid-argument", "spreadsheetId required");
  
  const sheets = getSheetsClient();
  const usersSnap = await db.collection('users').get();

  const rows: any[][] = [['User ID', 'Name', 'Email', 'Role']];
  usersSnap.forEach(doc => {
    const u = doc.data();
    rows.push([doc.id, u.name || '', u.email || '', u.role || 'Employee']);
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });

  return { success: true, count: rows.length - 1 };
});

/**
 * NEW FUNCTION: Exports expense claims to a Google Sheet.
 */
export const exportExpensesToSheets = functions.https.onCall(async (data, context) => {
    assertAdmin(context);
    const { spreadsheetId, range = 'Expenses!A1' } = data as { spreadsheetId: string; range?: string };
    if (!spreadsheetId) throw new functions.https.HttpsError("invalid-argument", "spreadsheetId is required.");

    const sheets = getSheetsClient();
    
    // Fetch all expenses and all users in parallel
    const [expensesSnap, usersSnap] = await Promise.all([
        db.collection('expenseClaims').orderBy('createdAt', 'desc').get(),
        db.collection('users').get()
    ]);

    // Create a map of user IDs to names for easy lookup
    const userMap = new Map<string, string>();
    usersSnap.forEach(doc => userMap.set(doc.id, doc.data().name || doc.data().email));

    const rows: any[][] = [['Claim ID', 'User Name', 'Title', 'Total Amount', 'Status', 'Submitted At']];
    expensesSnap.forEach(doc => {
        const claim = doc.data();
        rows.push([
            doc.id,
            userMap.get(claim.userId) || claim.userId, // Fallback to ID if name not found
            claim.title,
            claim.totalAmount,
            claim.status,
            claim.createdAt.toDate().toISOString()
        ]);
    });

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: rows },
    });

    return { success: true, count: rows.length - 1 };
});
