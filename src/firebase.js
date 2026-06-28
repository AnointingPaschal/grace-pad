import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyARAnX9VwU1U9G3y7VXbEof2vZbwTLrMfM",
  authDomain: "grace-pad.firebaseapp.com",
  projectId: "grace-pad",
  storageBucket: "grace-pad.firebasestorage.app",
  messagingSenderId: "797228686427",
  appId: "1:797228686427:web:dce5a8c2421e901478737e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
