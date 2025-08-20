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
exports.generatePolicyAttachmentDownloadUrl = exports.generatePolicyAttachmentUploadUrl = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const db = admin.firestore();
const bucket = admin.storage().bucket();
function assertAuth(context) {
    if (!context.auth)
        throw new functions.https.HttpsError('unauthenticated', 'Auth required');
}
function isAdmin(token) { return (token?.role || 'Employee') === 'Admin'; }
exports.generatePolicyAttachmentUploadUrl = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    if (!isAdmin(context.auth.token))
        throw new functions.https.HttpsError('permission-denied', 'Admins only');
    const { fileName, contentType, policyId } = data;
    if (!fileName || !contentType)
        throw new functions.https.HttpsError('invalid-argument', 'fileName and contentType required');
    const id = (0, uuid_1.v4)();
    const objectPath = `policy-attachments/${policyId || 'drafts'}/${id}/${fileName}`;
    const expires = Date.now() + 10 * 60 * 1000; // 10 min
    const [url] = await bucket.file(objectPath).getSignedUrl({ action: 'write', expires, contentType, version: 'v4' });
    return { uploadUrl: url, path: objectPath, id, expires };
});
// Verify audience access against policy document and then create a signed read URL
exports.generatePolicyAttachmentDownloadUrl = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const uid = context.auth.uid;
    const claims = context.auth.token;
    const { policyId, attachmentPath, fileName } = data;
    if (!policyId || !attachmentPath || !fileName)
        throw new functions.https.HttpsError('invalid-argument', 'policyId, attachmentPath, fileName required');
    const policyRef = db.collection('policies').doc(policyId);
    const snap = await policyRef.get();
    if (!snap.exists)
        throw new functions.https.HttpsError('not-found', 'policy not found');
    const policy = snap.data();
    // Simple audience enforcement
    const audience = policy.audience || { type: 'all' };
    let allowed = false;
    if (audience.type === 'all')
        allowed = true;
    else if (audience.type === 'role')
        allowed = (claims?.role || 'Employee') === audience.role;
    else if (audience.type === 'department') {
        const userDoc = await db.collection('users').doc(uid).get();
        const dept = userDoc.exists ? userDoc.data().department : undefined;
        allowed = dept && audience.department && dept === audience.department;
    }
    if (!allowed)
        throw new functions.https.HttpsError('permission-denied', 'Not allowed');
    const expires = Date.now() + 10 * 60 * 1000; // 10 min
    const [url] = await bucket.file(attachmentPath).getSignedUrl({ action: 'read', expires, version: 'v4', responseDisposition: `attachment; filename="${fileName}"` });
    return { downloadUrl: url, expires };
});
//# sourceMappingURL=policy-attachments.js.map