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
exports.rsvpEvent = exports.createEvent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
function assertAuth(context) { if (!context.auth)
    throw new functions.https.HttpsError("unauthenticated", "Auth required"); }
function isAdmin(token) { return (token?.role || "Employee") === "Admin"; }
exports.createEvent = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    if (!isAdmin(context.auth.token))
        throw new functions.https.HttpsError("permission-denied", "Admins only");
    const { title, description, start, end, location, capacity = 50, tags = [] } = data;
    if (!title || !start || !end)
        throw new functions.https.HttpsError("invalid-argument", "Missing fields");
    const ref = await db.collection("wellbeingEvents").add({
        title, description: description || "", start: admin.firestore.Timestamp.fromDate(new Date(start)), end: admin.firestore.Timestamp.fromDate(new Date(end)), location: location || "TBA", capacity, tags, published: true, createdAt: admin.firestore.Timestamp.now(), createdBy: context.auth.uid
    });
    return { id: ref.id, success: true };
});
exports.rsvpEvent = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const uid = context.auth.uid;
    const { eventId, status } = data;
    if (!eventId || !status)
        throw new functions.https.HttpsError("invalid-argument", "eventId and status required");
    const evRef = db.collection("wellbeingEvents").doc(eventId);
    const ev = await evRef.get();
    if (!ev.exists)
        throw new functions.https.HttpsError("not-found", "Event not found");
    const dataEv = ev.data();
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
//# sourceMappingURL=events.js.map