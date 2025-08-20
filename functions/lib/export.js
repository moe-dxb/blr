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
exports.exportEmployeesToSheets = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const googleapis_1 = require("googleapis");
const db = admin.firestore();
function assertAdmin(context) {
    if (!context.auth)
        throw new functions.https.HttpsError("unauthenticated", "Auth required");
    const role = context.auth.token?.role || "Employee";
    if (role !== "Admin")
        throw new functions.https.HttpsError("permission-denied", "Admins only");
}
exports.exportEmployeesToSheets = functions.https.onCall(async (data, context) => {
    assertAdmin(context);
    const { spreadsheetId, range = 'Employees!A1' } = data;
    if (!spreadsheetId)
        throw new functions.https.HttpsError("invalid-argument", "spreadsheetId required");
    // Auth via Service Account
    // Set env vars: GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY (with \n properly escaped)
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!clientEmail || !privateKey) {
        throw new functions.https.HttpsError("failed-precondition", "Service account env vars missing");
    }
    const jwt = new googleapis_1.google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = googleapis_1.google.sheets({ version: 'v4', auth: jwt });
    const snap = await db.collection('users').get();
    const rows = [[
            'Name', 'Email', 'Role', 'Department', 'Manager', 'Created At'
        ]];
    snap.forEach(doc => {
        const u = doc.data();
        rows.push([
            u.name || u.displayName || '', u.email || '', u.role || 'Employee', u.department || '', u.manager || u.managerId || '', (u.createdAt?.toDate ? u.createdAt.toDate().toISOString() : '')
        ]);
    });
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: { values: rows },
    });
    return { success: true, count: rows.length - 1 };
});
//# sourceMappingURL=export.js.map