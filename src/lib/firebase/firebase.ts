
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getPerformance } from 'firebase/performance';

// Firebase configuration is loaded from environment variables as defined in the README.md
// This prevents hardcoding credentials in the source code.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Initialize Performance Monitoring only in the browser environment.
// This prevents errors during Server-Side Rendering (SSR).
let performance;
if (typeof window !== 'undefined') {
  performance = getPerformance(app);
}

export { app, db, functions, storage, performance };
