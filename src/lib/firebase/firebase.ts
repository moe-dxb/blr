
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getPerformance } from 'firebase/performance';

// This function centralizes the logic for creating the Firebase config object.
// It ensures that we only proceed if the required environment variables are present.
const getFirebaseConfig = (): FirebaseOptions | null => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  // Only return a config object if the essential keys are present.
  if (apiKey && authDomain && projectId) {
    return {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    };
  }
  
  // Return null if the configuration is incomplete.
  console.error("Firebase configuration is missing. Check your environment variables.");
  return null;
}

// Get the config object.
const firebaseConfig = getFirebaseConfig();

// Initialize Firebase only if the config was successfully created.
// This prevents the app from crashing if environment variables are not loaded.
const app = !getApps().length && firebaseConfig ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Initialize Performance Monitoring only in the browser environment and if config is valid.
let performance;
if (typeof window !== 'undefined' && firebaseConfig?.projectId) {
  performance = getPerformance(app);
}

export { app, db, functions, storage, performance };
