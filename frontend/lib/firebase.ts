import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBpFtgdE-vJeSJzhIdqpq5b_wnQuJrrGt0",
  authDomain: "e-commerse-5db6a.firebaseapp.com",
  projectId: "e-commerse-5db6a",
  storageBucket: "e-commerse-5db6a.firebasestorage.app",
  messagingSenderId: "729527954298",
  appId: "1:729527954298:web:0cc619cff3f6744fb784c3",
  measurementId: "G-4HEZQ48BMS"
};

// Initialize Firebase Client App (Singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
