import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// ============================================================================
// Firebase Configuration (Loaded from `.env.local` or deployment environment)
// ============================================================================

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Warn during local development if `.env.local` variables are missing
if (process.env.NODE_ENV === 'development' && !firebaseConfig.apiKey) {
  console.error(
    'Firebase configuration is missing. Check NEXT_PUBLIC_FIREBASE_* values in .env.local and restart `npm run dev`.',
  );
}

// ============================================================================
// Initialize Firebase (Singleton guard prevents duplicate app errors on HMR)
// ============================================================================

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Named export for Auth & default export for Firebase App
export const auth: Auth = getAuth(app);
export default app;
