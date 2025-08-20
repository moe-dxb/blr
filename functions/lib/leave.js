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
exports.approveReturnToWork = exports.returnToWork = exports.declineLeave = exports.approveLeave = exports.applyLeave = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
function assertAuth(context) {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "Auth required");
}
async function getUserRole(uid) {
    try {
        const rec = await admin.auth().getUser(uid);
        const role = rec.customClaims?.role || "Employee";
        return role;
    }
    catch {
        return "Employee";
    }
}
exports.applyLeave = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const uid = context.auth.uid;
    const { leaveType, startDate, endDate, reason } = data;
    if (!leaveType || !startDate || !endDate)
        throw new functions.https.HttpsError("invalid-argument", "Missing fields");
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
exports.approveLeave = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const caller = context.auth.uid;
    const role = await getUserRole(caller);
    if (role === "Employee")
        throw new functions.https.HttpsError("permission-denied", "Manager/Admin only");
    const { id } = data;
    const ref = db.collection("leaveRequests").doc(id);
    const snap = await ref.get();
    if (!snap.exists)
        throw new functions.https.HttpsError("not-found", "Leave not found");
    const req = snap.data();
    await ref.update({ status: "approved", decidedAt: admin.firestore.Timestamp.now(), decidedBy: caller });
    // decrement balances
    const balRef = db.collection("leaveBalances").doc(req.userId);
    const bal = await balRef.get();
    const days = Math.ceil((req.endDate.toDate().getTime() - req.startDate.toDate().getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const field = req.leaveType === "sick" ? "sick" : "annual";
    const curr = (bal.exists ? bal.data()[field] : undefined) || 0;
    await balRef.set({ userId: req.userId, [field]: Math.max(0, curr - days), lastUpdated: admin.firestore.Timestamp.now() }, { merge: true });
    return { success: true };
});
exports.declineLeave = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const caller = context.auth.uid;
    const role = await getUserRole(caller);
    if (role === "Employee")
        throw new functions.https.HttpsError("permission-denied", "Manager/Admin only");
    const { id } = data;
    await db.collection("leaveRequests").doc(id).update({ status: "rejected", decidedAt: admin.firestore.Timestamp.now(), decidedBy: caller });
    return { success: true };
});
exports.returnToWork = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const uid = context.auth.uid;
    const { id } = data;
    const ref = db.collection("leaveRequests").doc(id);
    const snap = await ref.get();
    if (!snap.exists)
        throw new functions.https.HttpsError("not-found", "Leave not found");
    const req = snap.data();
    if (req.userId !== uid)
        throw new functions.https.HttpsError("permission-denied", "Only the requester can submit return to work");
    await ref.update({ returnedAt: admin.firestore.Timestamp.now(), returnStatus: "pending_manager_approval" });
    return { success: true };
});
exports.approveReturnToWork = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const caller = context.auth.uid;
    const role = await getUserRole(caller);
    if (role === "Employee")
        throw new functions.https.HttpsError("permission-denied", "Manager/Admin only");
    const { id } = data;
    const ref = db.collection("leaveRequests").doc(id);
    await ref.update({ returnStatus: "approved", closedAt: admin.firestore.Timestamp.now(), closedBy: caller });
    return { success: true };
});
//# sourceMappingURL=leave.js.map