import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext(null);

// Google Client ID — used for One Tap auto sign-in
const GOOGLE_CLIENT_ID =
  "797228686427-1mfoj00i35hab40nt0846q54fqc9m6fq.apps.googleusercontent.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Google One Tap — uses the device's already-logged-in Google account
  useEffect(() => {
    if (user || loading) return;

    const initOneTap = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const credential = GoogleAuthProvider.credential(response.credential);
            await signInWithCredential(auth, credential);
          } catch (err) {
            console.error("One Tap sign-in failed:", err);
          }
        },
        auto_select: true,          // Auto sign-in if one account on device
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true, // Uses Chrome's native FedCM if available
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log("One Tap not shown:", notification.getNotDisplayedReason());
        }
      });
    };

    // Wait for the GIS script to load
    if (window.google?.accounts?.id) {
      initOneTap();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initOneTap();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  // Fallback: popup sign-in button
  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        throw err;
      }
    }
  }, []);

  const signOut = useCallback(() => firebaseSignOut(auth), []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
