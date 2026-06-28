import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithCredential, GoogleAuthProvider, signOut as fbSignOut, User } from "firebase/auth";
import { auth } from "../firebase";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs — set up in Google Cloud Console
// For Expo Go testing, the webClientId works on both platforms
const WEB_CLIENT_ID = "797228686427-1mfoj00i35hab40nt0846q54fqc9m6fq.apps.googleusercontent.com";
// Create Android/iOS client IDs in Google Cloud Console and add here:
const ANDROID_CLIENT_ID = ""; // e.g. 797228686427-xxx.apps.googleusercontent.com
const IOS_CLIENT_ID = "";     // e.g. 797228686427-yyy.apps.googleusercontent.com

interface AuthCtx {
  user: User | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID || undefined,
    iosClientId: IOS_CLIENT_ID || undefined,
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const cred = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, cred);
    }
  }, [response]);

  const signIn = () => promptAsync();
  const signOut = () => fbSignOut(auth);

  return <Ctx.Provider value={{ user, loading, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
