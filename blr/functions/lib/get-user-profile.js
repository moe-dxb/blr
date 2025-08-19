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
exports.getUserProfile = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.getUserProfile = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
    }
    const userId = context.auth.uid;
    try {
        const userRecord = await admin.auth().getUser(userId);
        const userDoc = await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .get();
        if (!userDoc.exists) {
            return { role: "Employee", ...userRecord };
        }
        const customClaims = userRecord.customClaims || {};
        return {
            ...userDoc.data(),
            role: customClaims.role || "Employee",
        };
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        throw new functions.https.HttpsError("internal", "Failed to fetch user profile.");
    }
});
//# sourceMappingURL=get-user-profile.js.map