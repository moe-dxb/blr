// src/lib/firebase/firebase-admin.ts
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// It's crucial to only initialize the admin app once.
let adminApp: App;

if (getApps().length) {
  adminApp = getApps()[0]!;
} else {
  // This service account JSON needs to be stored securely as an environment variable.
  // DO NOT commit the actual JSON file to your repository.
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string
  );

  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
