import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

function assertAdmin(context: functions.https.CallableContext) {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
  const claims = (context.auth.token || {}) as { role?: string };
  if (claims.role !== "Admin") {
    throw new functions.https.HttpsError("permission-denied", "Admins only.");
  }
}

// One-off: seed an admin by email (e.g., moe@blr-world.com). Must be called by an existing Admin
export const setUserRoleByEmail = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const { email, role } = data as { email: string; role: "Admin" | "Manager" | "Employee" };
  if (!email || !role) {
    throw new functions.https.HttpsError("invalid-argument", "email and role are required.");
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    await db.collection("users").doc(userRecord.uid).set({ role }, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error("setUserRoleByEmail error", err);
    throw new functions.https.HttpsError("internal", err.message || "Failed to set role");
  }
});

// Convenience: initialize moe@blr-world.com as Admin via env flag; call once, then disable
export const seedInitialAdmin = functions.https.onCall(async (data, context) => {
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
  } catch (err: any) {
    console.error("seedInitialAdmin error", err);
    throw new functions.https.HttpsError("internal", err.message || "Failed to seed admin");
  }
});