"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Initialize the Firebase Admin SDK.
// This is the "gatekeeper" for all backend operations, ensuring that
// our functions have the necessary permissions to interact with Firestore.
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
exports.db = (0, firestore_1.getFirestore)();
//# sourceMappingURL=firebase-admin.js.map