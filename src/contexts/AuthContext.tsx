import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithCredential, GoogleAuthProvider, signOut as fbOut, User } from "firebase/auth";
import { auth } from "../firebase";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

// Web client ID (works for Expo Go). Add Android/iOS client IDs for production builds.
const WEB_ID = "797228686427-1mfoj00i35hab40nt0846q54fqc9m6fq.apps.googleusercontent.com";

const Ctx = createContext<{ user:User|null; loading:boolean; signIn:()=>void; signOut:()=>void } | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, response, promptAsync] = Google.useAuthRequest({ webClientId: WEB_ID });

  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }), []);

  useEffect(() => {
    if (response?.type === "success") {
      const cred = GoogleAuthProvider.credential(response.params.id_token);
      signInWithCredential(auth, cred);
    }
  }, [response]);

  return (
    <Ctx.Provider value={{ user, loading, signIn: () => promptAsync(), signOut: () => fbOut(auth) }}>
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = () => { const c = useContext(Ctx)!; return c; };
