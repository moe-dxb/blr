import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

function assertAuth(context: functions.https.CallableContext) { if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required"); }
function isAdmin(token: any) { return (token?.role || "Employee") === "Admin"; }

export const createAnnouncement = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  if (!isAdmin(context.auth!.token)) throw new functions.https.HttpsError("permission-denied", "Admins only");
  const { title, bodyRich, audience, priority = "normal", requiresAck = false, expiresAt } = data as any;
  if (!title || !bodyRich) throw new functions.https.HttpsError("invalid-argument", "Title and body required");

  const payload = {
    title, bodyRich, audience: audience || { type: "all" }, priority,
    requiresAck,
    publishedAt: admin.firestore.Timestamp.now(),
    expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null,
    createdBy: context.auth!.uid,
  };
  const ref = await db.collection("announcements").add(payload);
  return { id: ref.id, success: true };
});

export const acknowledgeAnnouncement = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const uid = context.auth!.uid;
  const { id } = data as { id: string };
  if (!id) throw new functions.https.HttpsError("invalid-argument", "id required");
  const ackRef = db.collection("announcements").doc(id).collection("acks").doc(uid);
  await ackRef.set({ acknowledgedAt: admin.firestore.Timestamp.now() }, { merge: true });
  return { success: true };
});