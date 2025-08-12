import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

function assertAuth(context: functions.https.CallableContext) { if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required"); }
function isAdmin(token: any) { return (token?.role || "Employee") === "Admin"; }

export const createEvent = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  if (!isAdmin(context.auth!.token)) throw new functions.https.HttpsError("permission-denied", "Admins only");
  const { title, description, start, end, location, capacity = 50, tags = [] } = data as any;
  if (!title || !start || !end) throw new functions.https.HttpsError("invalid-argument", "Missing fields");
  const ref = await db.collection("wellbeingEvents").add({
    title, description: description || "", start: admin.firestore.Timestamp.fromDate(new Date(start)), end: admin.firestore.Timestamp.fromDate(new Date(end)), location: location || "TBA", capacity, tags, published: true, createdAt: admin.firestore.Timestamp.now(), createdBy: context.auth!.uid
  });
  return { id: ref.id, success: true };
});

export const rsvpEvent = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const uid = context.auth!.uid;
  const { eventId, status } = data as { eventId: string; status: 'going'|'maybe'|'declined' };
  if (!eventId || !status) throw new functions.https.HttpsError("invalid-argument", "eventId and status required");

  const evRef = db.collection("wellbeingEvents").doc(eventId);
  const ev = await evRef.get();
  if (!ev.exists) throw new functions.https.HttpsError("not-found", "Event not found");
  const dataEv = ev.data() as any;

  const rsvpRef = evRef.collection("rsvps").doc(uid);
  // Capacity check only for 'going'
  if (status === 'going') {
    const goingSnap = await evRef.collection("rsvps").where("status", "==", "going").get();
    if (goingSnap.size >= (dataEv.capacity || 0)) {
      await rsvpRef.set({ status: 'waitlisted', respondedAt: admin.firestore.Timestamp.now() }, { merge: true });
      return { success: true, waitlisted: true };
    }
  }

  await rsvpRef.set({ status, respondedAt: admin.firestore.Timestamp.now() }, { merge: true });
  return { success: true, waitlisted: false };
});