import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { DateTime } from "luxon";

const db = admin.firestore();

function requireAuth(context: functions.https.CallableContext) {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
}

async function getSettings() {
  const snap = await db.collection("settings").doc("global").get();
  const defaults = { attendance: { toleranceMinutes: 15 } } as any;
  return snap.exists ? { ...defaults, ...snap.data() } : defaults;
}

async function getSchedule(uid: string) {
  const doc = await db.collection("schedules").doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as any;
}

export const clockIn = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const uid = context.auth!.uid;
  const now = DateTime.utc();
  const schedule = await getSchedule(uid);
  const settings = await getSettings();
  const tol = (settings.attendance?.toleranceMinutes ?? 15) as number;

  if (!schedule) {
    throw new functions.https.HttpsError("failed-precondition", "No schedule set. Contact your manager.");
  }

  const tz = schedule.timezone || "UTC";
  const today = now.setZone(tz);
  const weekday = today.weekday; // 1..7
  const enabled = (schedule.workDays || []).includes(weekday);
  if (!enabled) {
    throw new functions.https.HttpsError("failed-precondition", "Today is not a scheduled work day.");
  }

  // schedule.startTime/endTime as "HH:mm"
  const start = DateTime.fromFormat(schedule.startTime, "HH:mm", { zone: tz }).set({
    year: today.year, month: today.month, day: today.day,
  });

  const minIn = start.minus({ minutes: tol });
  const maxIn = start.plus({ minutes: tol });
  if (today < minIn || today > maxIn) {
    // record but flag
    await db.collection("users").doc(uid).collection("attendance").add({
      clockInTime: admin.firestore.Timestamp.now(),
      clockOutTime: null,
      flagged: true,
      reason: "Outside tolerance window",
      tz,
    });
    return { success: true, flagged: true };
  }

  await db.collection("users").doc(uid).collection("attendance").add({
    clockInTime: admin.firestore.Timestamp.now(),
    clockOutTime: null,
    flagged: false,
    tz,
  });
  return { success: true, flagged: false };
});

export const clockOut = functions.https.onCall(async (data, context) => {
  requireAuth(context);
  const uid = context.auth!.uid;
  const coll = db.collection("users").doc(uid).collection("attendance");
  const openSnap = await coll
    .where("clockOutTime", "==", null)
    .orderBy("clockInTime", "desc")
    .limit(1)
    .get();

  if (openSnap.empty) {
    throw new functions.https.HttpsError("failed-precondition", "No open attendance record.");
  }

  const docRef = openSnap.docs[0].ref;
  await docRef.update({ clockOutTime: admin.firestore.Timestamp.now() });
  return { success: true };
});