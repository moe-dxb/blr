import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

function assertAuth(context: functions.https.CallableContext) {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Auth required");
}

async function getUserRole(uid: string): Promise<"Admin"|"Manager"|"Employee"> {
  try {
    const rec = await admin.auth().getUser(uid);
    const role = (rec.customClaims?.role as any) || "Employee";
    return role as any;
  } catch {
    return "Employee";
  }
}

export const applyLeave = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const uid = context.auth!.uid;
  const { leaveType, startDate, endDate, reason } = data as { leaveType: string; startDate: string; endDate: string; reason?: string };
  if (!leaveType || !startDate || !endDate) throw new functions.https.HttpsError("invalid-argument", "Missing fields");

  const payload = {
    userId: uid,
    leaveType,
    startDate: admin.firestore.Timestamp.fromDate(new Date(startDate)),
    endDate: admin.firestore.Timestamp.fromDate(new Date(endDate)),
    reason: reason || "",
    status: "pending",
    requestedAt: admin.firestore.Timestamp.now(),
  };
  const ref = await db.collection("leaveRequests").add(payload);
  return { id: ref.id, success: true };
});

export const approveLeave = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const caller = context.auth!.uid;
  const role = await getUserRole(caller);
  if (role === "Employee") throw new functions.https.HttpsError("permission-denied", "Manager/Admin only");
  const { id } = data as { id: string };
  const ref = db.collection("leaveRequests").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new functions.https.HttpsError("not-found", "Leave not found");
  const req = snap.data()!;
  await ref.update({ status: "approved", decidedAt: admin.firestore.Timestamp.now(), decidedBy: caller });

  // decrement balances
  const balRef = db.collection("leaveBalances").doc(req.userId);
  const bal = await balRef.get();
  const days = Math.ceil((req.endDate.toDate().getTime() - req.startDate.toDate().getTime()) / (1000*60*60*24)) + 1;
  const field = req.leaveType === "sick" ? "sick" : "annual";
  const curr = (bal.exists ? bal.data()![field] : undefined) || 0;
  await balRef.set({ userId: req.userId, [field]: Math.max(0, curr - days), lastUpdated: admin.firestore.Timestamp.now() }, { merge: true });

  return { success: true };
});

export const declineLeave = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const caller = context.auth!.uid;
  const role = await getUserRole(caller);
  if (role === "Employee") throw new functions.https.HttpsError("permission-denied", "Manager/Admin only");
  const { id } = data as { id: string };
  await db.collection("leaveRequests").doc(id).update({ status: "rejected", decidedAt: admin.firestore.Timestamp.now(), decidedBy: caller });
  return { success: true };
});

export const returnToWork = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const uid = context.auth!.uid;
  const { id } = data as { id: string };
  const ref = db.collection("leaveRequests").doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new functions.https.HttpsError("not-found", "Leave not found");
  const req = snap.data()!;
  if (req.userId !== uid) throw new functions.https.HttpsError("permission-denied", "Only the requester can submit return to work");
  await ref.update({ returnedAt: admin.firestore.Timestamp.now(), returnStatus: "pending_manager_approval" });
  return { success: true };
});

export const approveReturnToWork = functions.https.onCall(async (data, context) => {
  assertAuth(context);
  const caller = context.auth!.uid;
  const role = await getUserRole(caller);
  if (role === "Employee") throw new functions.https.HttpsError("permission-denied", "Manager/Admin only");
  const { id } = data as { id: string };
  const ref = db.collection("leaveRequests").doc(id);
  await ref.update({ returnStatus: "approved", closedAt: admin.firestore.Timestamp.now(), closedBy: caller });
  return { success: true };
});