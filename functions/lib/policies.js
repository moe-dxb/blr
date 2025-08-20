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
exports.acknowledgePolicy = exports.publishPolicy = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
function assertAuth(context) { if (!context.auth)
    throw new functions.https.HttpsError("unauthenticated", "Auth required"); }
function isAdmin(token) { return (token?.role || "Employee") === "Admin"; }
exports.publishPolicy = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    if (!isAdmin(context.auth.token))
        throw new functions.https.HttpsError("permission-denied", "Admins only");
    const { id, title, contentRich, category, attachments, audience } = data;
    let ref;
    if (id) {
        ref = db.collection("policies").doc(id);
        const snap = await ref.get();
        const curr = snap.exists ? snap.data() : { version: 0 };
        await ref.set({
            title: title ?? curr.title,
            contentRich: contentRich ?? curr.contentRich,
            category: category ?? curr.category,
            attachments: attachments ?? curr.attachments ?? [],
            audience: audience ?? curr.audience ?? { type: "all" },
            version: (curr.version || 0) + 1,
            published: true,
            effectiveDate: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
            updatedBy: context.auth.uid,
        }, { merge: true });
    }
    else {
        ref = await db.collection("policies").add({
            title, contentRich, category: category || "General", attachments: attachments || [], audience: audience || { type: "all" },
            version: 1, published: true, effectiveDate: admin.firestore.Timestamp.now(), updatedAt: admin.firestore.Timestamp.now(), updatedBy: context.auth.uid,
        });
    }
    return { id: ref.id, success: true };
});
exports.acknowledgePolicy = functions.https.onCall(async (data, context) => {
    assertAuth(context);
    const uid = context.auth.uid;
    const { id, version } = data;
    if (!id || !version)
        throw new functions.https.HttpsError("invalid-argument", "id and version required");
    const ackRef = db.collection("policies").doc(id).collection("acks").doc(uid);
    await ackRef.set({ version, acknowledgedAt: admin.firestore.Timestamp.now() }, { merge: true });
    return { success: true };
});
//# sourceMappingURL=policies.js.map