import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

const db = admin.firestore();
const bucket = admin.storage().bucket();

function assertAuth(context: functions.https.CallableContext) {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required");
}

function isAdmin(claims: any) { return (claims?.role || "Employee") === "Admin"; }

async function isManagerOf(managerUid: string, employeeUid: string) {
  const user = await db.collection("users").doc(employeeUid).get();
  const managerId = user.exists ? (user.data() as any).managerId : undefined;
  return managerId && managerId === managerUid;
}

// Generate signed URL for uploading a personal document (owner only)
export const generatePersonalDocUploadUrl = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const uid = context.auth!.uid;
  const { fileName, contentType } = data as { fileName: string; contentType: string };
  if (!fileName || !contentType) {
    throw new functions.https.HttpsError("invalid-argument", "fileName and contentType are required");
  }

  const docId = uuidv4();
  const objectPath = `personal-documents/${uid}/${docId}/${fileName}`;

  // Create Firestore metadata
  await db.collection("users").doc(uid).collection("personalDocuments").doc(docId).set({
    fileName,
    contentType,
    path: objectPath,
    createdAt: admin.firestore.Timestamp.now(),
  });

  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  const [url] = await bucket.file(objectPath).getSignedUrl({
    action: "write",
    expires,
    contentType,
    version: "v4",
  });

  return { uploadUrl: url, docId, path: objectPath, expires };
});

// Generate signed URL for downloading a personal document (owner, manager, or admin)
export const generatePersonalDocDownloadUrl = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const caller = context.auth!.uid;
  const claims = context.auth!.token as any;
  const { userId, docId, fileName } = data as { userId: string; docId: string; fileName: string };
  if (!userId || !docId || !fileName) {
    throw new functions.https.HttpsError("invalid-argument", "userId, docId, fileName required");
  }

  const metaSnap = await db.collection("users").doc(userId).collection("personalDocuments").doc(docId).get();
  if (!metaSnap.exists) throw new functions.https.HttpsError("not-found", "Document not found");
  const meta = metaSnap.data() as any;
  const objectPath = meta.path as string;

  const allowed = caller === userId || isAdmin(claims) || (await isManagerOf(caller, userId));
  if (!allowed) throw new functions.https.HttpsError("permission-denied", "Not allowed");

  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
  const [url] = await bucket.file(objectPath).getSignedUrl({
    action: "read",
    expires,
    version: "v4",
    responseDisposition: `attachment; filename=\"${fileName}\"`,
  });

  return { downloadUrl: url, expires };
});