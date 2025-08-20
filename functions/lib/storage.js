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
exports.generatePersonalDocDownloadUrl = exports.generatePersonalDocUploadUrl = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const db = admin.firestore();
const bucket = admin.storage().bucket();
function assertAuth(context) {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "Auth required");
}
function isAdmin(claims) { return (claims?.role || "Employee") === "Admin"; }
async function isManagerOf(managerUid, employeeUid) {
    const user = await db.collection("users").doc(employeeUid).get();
    const managerId = user.exists ? user.data().managerId : undefined;
    return managerId && managerId === managerUid;
}
// Generate signed URL for uploading a personal document (owner only)
exports.generatePersonalDocUploadUrl = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const uid = context.auth.uid;
    const { fileName, contentType } = data;
    if (!fileName || !contentType) {
        throw new functions.https.HttpsError("invalid-argument", "fileName and contentType are required");
    }
    const docId = (0, uuid_1.v4)();
    const objectPath = `personal-documents/${uid}/${docId}/${fileName}`;
    // Create Firestore metadata
    await db.collection("users").doc(uid).collection("personalDocuments").doc(docId).set({
        fileName,
        contentType,
        path: objectPath,
        createdAt: admin.firestore.Timestamp.now(),
    });
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    const [url] = await bucket.file(objectPath).getSignedUrl({
        action: "write",
        expires,
        contentType,
        version: "v4",
    });
    return { uploadUrl: url, docId, path: objectPath, expires };
});
// Generate signed URL for downloading a personal document (owner, manager, or admin)
exports.generatePersonalDocDownloadUrl = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const caller = context.auth.uid;
    const claims = context.auth.token;
    const { userId, docId, fileName } = data;
    if (!userId || !docId || !fileName) {
        throw new functions.https.HttpsError("invalid-argument", "userId, docId, fileName required");
    }
    const metaSnap = await db.collection("users").doc(userId).collection("personalDocuments").doc(docId).get();
    if (!metaSnap.exists)
        throw new functions.https.HttpsError("not-found", "Document not found");
    const meta = metaSnap.data();
    const objectPath = meta.path;
    const allowed = caller === userId || isAdmin(claims) || (await isManagerOf(caller, userId));
    if (!allowed)
        throw new functions.https.HttpsError("permission-denied", "Not allowed");
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    const [url] = await bucket.file(objectPath).getSignedUrl({
        action: "read",
        expires,
        version: "v4",
        responseDisposition: `attachment; filename=\"${fileName}\"`,
    });
    return { downloadUrl: url, expires };
});
//# sourceMappingURL=storage.js.map