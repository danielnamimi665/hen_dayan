import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';

// Firebase configuration - תצטרך להחליף את הערכים שלך
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firestore (לשמירת מטא-דאטה)
export const db = getFirestore(app);

// Initialize Auth and ensure anonymous sign-in on the client
export const auth = getAuth(app);
if (typeof window !== 'undefined') {
	onAuthStateChanged(auth, (user) => {
		if (!user) {
			// Sign in anonymously so Storage/Firestore rules that require auth will allow access
			signInAnonymously(auth).catch((err) => {
				console.error('Firebase anonymous auth failed:', err);
			});
		}
	});
}

export default app;
