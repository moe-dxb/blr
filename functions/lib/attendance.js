"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clockOut = exports.clockIn = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const luxon_1 = require("luxon");
const db = admin.firestore();
function requireAuth(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
}
async function getSettings() {
    const snap = await db.collection("settings").doc("global").get();
    const defaults = { attendance: { toleranceMinutes: 15 } };
    return snap.exists ? { ...defaults, ...snap.data() } : defaults;
}
async function getSchedule(uid) {
    const doc = await db.collection("schedules").doc(uid).get();
    if (!doc.exists)
        return null;
    return doc.data();
}
exports.clockIn = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const uid = context.auth.uid;
    const now = luxon_1.DateTime.utc();
    const schedule = await getSchedule(uid);
    const settings = await getSettings();
    const tol = (settings.attendance?.toleranceMinutes ?? 15);
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
    const start = luxon_1.DateTime.fromFormat(schedule.startTime, "HH:mm", { zone: tz }).set({
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
exports.clockOut = functions.https.onCall(async (data, context) => {
    requireAuth(context);
    const uid = context.auth.uid;
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
//# sourceMappingURL=attendance.js.map