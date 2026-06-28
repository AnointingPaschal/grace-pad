import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
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

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;
