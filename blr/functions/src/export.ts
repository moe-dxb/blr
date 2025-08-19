import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { google } from "googleapis";

const db = admin.firestore();

function assertAdmin(context: functions.https.CallableContext) {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required");
  const role = (context.auth.token as any)?.role || "Employee";
  if (role !== "Admin") throw new functions.https.HttpsError("permission-denied", "Admins only");
}

export const exportEmployeesToSheets = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const { spreadsheetId, range = 'Employees!A1' } = data as { spreadsheetId: string; range?: string };
  if (!spreadsheetId) throw new functions.https.HttpsError("invalid-argument", "spreadsheetId required");

  // Auth via Service Account
  // Set env vars: GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY (with \n properly escaped)
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL as string;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY as string || '').replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new functions.https.HttpsError("failed-precondition", "Service account env vars missing");
  }

  const jwt = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth: jwt });

  const snap = await db.collection('users').get();
  const rows: any[] = [[
    'Name','Email','Role','Department','Manager','Created At'
  ]];
  snap.forEach(doc => {
    const u = doc.data() as any;
    rows.push([
      u.name || u.displayName || '', u.email || '', u.role || 'Employee', u.department || '', u.manager || u.managerId || '', (u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : '')
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