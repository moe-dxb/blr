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
exports.acknowledgeAnnouncement = exports.createAnnouncement = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
function assertAuth(context) { if (!context.auth)
    throw new functions.https.HttpsError("unauthenticated", "Auth required"); }
function isAdmin(token) { return (token?.role || "Employee") === "Admin"; }
exports.createAnnouncement = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    if (!isAdmin(context.auth.token))
        throw new functions.https.HttpsError("permission-denied", "Admins only");
    const { title, bodyRich, audience, priority = "normal", requiresAck = false, expiresAt } = data;
    if (!title || !bodyRich)
        throw new functions.https.HttpsError("invalid-argument", "Title and body required");
    const payload = {
        title, bodyRich, audience: audience || { type: "all" }, priority,
        requiresAck,
        publishedAt: admin.firestore.Timestamp.now(),
        expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : null,
        createdBy: context.auth.uid,
    };
    const ref = await db.collection("announcements").add(payload);
    return { id: ref.id, success: true };
});
exports.acknowledgeAnnouncement = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const uid = context.auth.uid;
    const { id } = data;
    if (!id)
        throw new functions.https.HttpsError("invalid-argument", "id required");
    const ackRef = db.collection("announcements").doc(id).collection("acks").doc(uid);
    await ackRef.set({ acknowledgedAt: admin.firestore.Timestamp.now() }, { merge: true });
    return { success: true };
});
//# sourceMappingURL=announcements.js.map