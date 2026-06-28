import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyARAnX9VwU1U9G3y7VXbEof2vZbwTLrMfM",
  authDomain: "grace-pad.firebaseapp.com",
  projectId: "grace-pad",
  storageBucket: "grace-pad.firebasestorage.app",
  messagingSenderId: "797228686427",
  appId: "1:797228686427:web:dce5a8c2421e901478737e",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export default app;
