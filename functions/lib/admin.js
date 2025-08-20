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
exports.setManagerForEmployeeByEmail = exports.seedInitialAdmin = exports.setUserRoleByEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
function assertAdmin(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const claims = (context.auth.token || {});
    if (claims.role !== "Admin") {
        throw new functions.https.HttpsError("permission-denied", "Admins only.");
    }
}
// One-off: seed an admin by email (e.g., moe@blr-world.com). Must be called by an existing Admin
exports.setUserRoleByEmail = functions.https.onCall(async (data, context) => {
    assertAdmin(context);
    const { email, role } = data;
    if (!email || !role) {
        throw new functions.https.HttpsError("invalid-argument", "email and role are required.");
    }
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(userRecord.uid, { role });
        await db.collection("users").doc(userRecord.uid).set({ role }, { merge: true });
        return { success: true };
    }
    catch (err) {
        console.error("setUserRoleByEmail error", err);
        throw new functions.https.HttpsError("internal", err.message || "Failed to set role");
    }
});
// Convenience: initialize moe@blr-world.com as Admin via env flag; call once, then disable
exports.seedInitialAdmin = functions.https.onCall(async (data, context) => {
    const allowSeed = process.env.ALLOW_ADMIN_SEED === "true";
    if (!allowSeed) {
        throw new functions.https.HttpsError("permission-denied", "Seeding disabled.");
    }
    const email = (data && data.email) || "moe@blr-world.com";
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: "Admin" });
        await db.collection("users").doc(userRecord.uid).set({ role: "Admin" }, { merge: true });
        return { success: true };
    }
    catch (err) {
        console.error("seedInitialAdmin error", err);
        throw new functions.https.HttpsError("internal", err.message || "Failed to seed admin");
    }
});
// NEW: Set manager for an employee via emails, and ensure managerId is stored on employee doc
exports.setManagerForEmployeeByEmail = functions.https.onCall(async (data, context) => {
    assertAdmin(context);
    const { employeeEmail, managerEmail } = data;
    if (!employeeEmail || !managerEmail) {
        throw new functions.https.HttpsError("invalid-argument", "employeeEmail and managerEmail are required");
    }
    try {
        const employee = await admin.auth().getUserByEmail(employeeEmail);
        const manager = await admin.auth().getUserByEmail(managerEmail);
        await db.collection('users').doc(employee.uid).set({ managerId: manager.uid, manager: managerEmail }, { merge: true });
        return { success: true, employeeUid: employee.uid, managerUid: manager.uid };
    }
    catch (err) {
        console.error('setManagerForEmployeeByEmail error', err);
        throw new functions.https.HttpsError('internal', err.message || 'Failed to set manager');
    }
});
//# sourceMappingURL=admin.js.map