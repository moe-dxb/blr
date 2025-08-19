
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize the Firebase Admin SDK.
// This is the "gatekeeper" for all backend operations, ensuring that
// our functions have the necessary permissions to interact with Firestore.
if (getApps().length === 0) {
  initializeApp();
}

export const db = getFirestore();
