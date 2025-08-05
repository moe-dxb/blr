
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "blr-world-hub",
  appId: "1:757764829281:web:7d8b3697ece9e944c03a20",
  storageBucket: "blr-world-hub.firebasestorage.app",
  apiKey: "AIzaSyDNlqsTo368a_oe8n9iYNUfVBhW5Jf5YWc",
  authDomain: "blr-world-hub.firebaseapp.com",
  messagingSenderId: "757764829281",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
