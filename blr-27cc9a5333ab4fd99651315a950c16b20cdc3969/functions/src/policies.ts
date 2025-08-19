import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

function assertAuth(context: functions.https.CallableContext) { if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required"); }
function isAdmin(token: any) { return (token?.role || "Employee") === "Admin"; }

export const publishPolicy = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  if (!isAdmin(context.auth!.token)) throw new functions.https.HttpsError("permission-denied", "Admins only");
  const { id, title, contentRich, category, attachments, audience } = data as any;

  let ref;
  if (id) {
    ref = db.collection("policies").doc(id);
    const snap = await ref.get();
    const curr = snap.exists ? (snap.data() as any) : { version: 0 };
    await ref.set({
      title: title ?? curr.title,
      contentRich: contentRich ?? curr.contentRich,
      category: category ?? curr.category,
      attachments: attachments ?? curr.attachments ?? [],
      audience: audience ?? curr.audience ?? { type: "all" },
      version: (curr.version || 0) + 1,
      published: true,
      effectiveDate: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      updatedBy: context.auth!.uid,
    }, { merge: true });
  } else {
    ref = await db.collection("policies").add({
      title, contentRich, category: category || "General", attachments: attachments || [], audience: audience || { type: "all" },
      version: 1, published: true, effectiveDate: admin.firestore.Timestamp.now(), updatedAt: admin.firestore.Timestamp.now(), updatedBy: context.auth!.uid,
    });
  }

  return { id: ref.id, success: true };
});

export const acknowledgePolicy = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const uid = context.auth!.uid;
  const { id, version } = data as { id: string; version: number };
  if (!id || !version) throw new functions.https.HttpsError("invalid-argument", "id and version required");
  const ackRef = db.collection("policies").doc(id).collection("acks").doc(uid);
  await ackRef.set({ version, acknowledgedAt: admin.firestore.Timestamp.now() }, { merge: true });
  return { success: true };
});