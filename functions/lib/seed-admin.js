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
exports.seedAdminRole = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.seedAdminRole = functions.https.onCall(async (data, context) => {
    // One-time admin seeding function
    // This function should only be called once to set up the initial admin
    const { email } = data;
    if (!email || !email.endsWith("@blr-world.com")) {
        throw new functions.https.HttpsError("invalid-argument", "Valid @blr-world.com email required");
    }
    try {
        // Find user by email
        const userRecord = await admin.auth().getUserByEmail(email);
        // Set admin role
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: "Admin" });
        // Update user profile in Firestore
        await admin.firestore().collection("users").doc(userRecord.uid).set({
            name: userRecord.displayName || "Admin User",
            email: userRecord.email,
            role: "Admin",
            department: "Management",
            manager: "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        functions.logger.info(`Admin role granted to ${email}`);
        return {
            success: true,
            message: `Successfully granted Admin role to ${email}`,
            uid: userRecord.uid
        };
    }
    catch (error) {
        functions.logger.error("Error seeding admin:", error);
        if (error instanceof Error && error.message.includes("no user record")) {
            throw new functions.https.HttpsError("not-found", "User not found. Please ensure the user has signed up first.");
        }
        throw new functions.https.HttpsError("internal", "Failed to seed admin role");
    }
});
//# sourceMappingURL=seed-admin.js.map