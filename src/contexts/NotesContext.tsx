import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import { NOTE_CATEGORIES, NOTE_COLORS } from "../constants";
export { NOTE_CATEGORIES, NOTE_COLORS };

export interface Note {
  id: string; title: string; content: string;
  category: string; color: string; tags: string[];
  isPinned: boolean; userId: string;
  updatedAt?: any; createdAt?: any;
}
interface NotesCtx {
  notes: Note[]; loading: boolean;
  createNote(f?: Partial<Note>): Promise<string>;
  updateNote(id: string, f: Partial<Note>): Promise<void>;
  deleteNote(id: string): Promise<void>;
}
const Ctx = createContext<NotesCtx|null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setNotes([]); setLoading(false); return; }
    const q = query(collection(db,"notes"), where("userId","==",user.uid));
    return onSnapshot(q, snap => {
      setNotes(snap.docs.map(d=>({id:d.id,...d.data()} as Note))
        .sort((a,b)=>(b.updatedAt?.toMillis?.()??0)-(a.updatedAt?.toMillis?.()??0)));
      setLoading(false);
    }, () => setLoading(false));
  }, [user]);

  const createNote = useCallback(async (f: Partial<Note> = {}) => {
    if (!user) throw new Error("Not signed in");
    const ref = await addDoc(collection(db,"notes"), {
      title:"New Note", content:"", category:"general", color:"white",
      tags:[], isPinned:false, userId:user.uid,
      createdAt:serverTimestamp(), updatedAt:serverTimestamp(), ...f,
    });
    return ref.id;
  }, [user]);

  const updateNote = useCallback(async (id: string, f: Partial<Note>) =>
    updateDoc(doc(db,"notes",id), {...f, updatedAt:serverTimestamp()}), []);

  const deleteNote = useCallback(async (id: string) =>
    deleteDoc(doc(db,"notes",id)), []);

  return <Ctx.Provider value={{notes,loading,createNote,updateNote,deleteNote}}>{children}</Ctx.Provider>;
}
export const useNotes = () => useContext(Ctx)!;
