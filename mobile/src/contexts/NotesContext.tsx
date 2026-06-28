import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  tags: string[];
  isPinned: boolean;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const NOTE_CATEGORIES = [
  { id:"sermon",    label:"Sermon",      color:"#7C3AED", bg:"#F5F3FF" },
  { id:"study",     label:"Bible Study", color:"#1D4ED8", bg:"#EFF6FF" },
  { id:"prayer",    label:"Prayer",      color:"#DB2777", bg:"#FDF2F8" },
  { id:"devotion",  label:"Devotional",  color:"#15803D", bg:"#F0FDF4" },
  { id:"general",   label:"General",     color:"#B45309", bg:"#FFFBEB" },
];

export const NOTE_COLORS = [
  { id:"white",   bg:"#FFFFFF", border:"#E5E7EB" },
  { id:"yellow",  bg:"#FEF9C3", border:"#FDE68A" },
  { id:"blue",    bg:"#DBEAFE", border:"#BFDBFE" },
  { id:"green",   bg:"#DCFCE7", border:"#BBF7D0" },
  { id:"pink",    bg:"#FCE7F3", border:"#FBCFE8" },
  { id:"purple",  bg:"#F3E8FF", border:"#E9D5FF" },
];

interface NotesCtx {
  notes: Note[];
  loading: boolean;
  createNote: (fields?: Partial<Note>) => Promise<string>;
  updateNote: (id: string, fields: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const Ctx = createContext<NotesCtx | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setNotes([]); setLoading(false); return; }
    const q = query(collection(db, "notes"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Note))
        .sort((a, b) => {
          const at = a.updatedAt?.toMillis() ?? 0;
          const bt = b.updatedAt?.toMillis() ?? 0;
          return bt - at;
        });
      setNotes(all);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user]);

  const createNote = useCallback(async (fields: Partial<Note> = {}) => {
    if (!user) throw new Error("Not authenticated");
    const ref = await addDoc(collection(db, "notes"), {
      title: "New Note",
      content: "",
      category: "general",
      color: "white",
      tags: [],
      isPinned: false,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...fields,
    });
    return ref.id;
  }, [user]);

  const updateNote = useCallback(async (id: string, fields: Partial<Note>) => {
    await updateDoc(doc(db, "notes", id), { ...fields, updatedAt: serverTimestamp() });
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "notes", id));
  }, []);

  return (
    <Ctx.Provider value={{ notes, loading, createNote, updateNote, deleteNote }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotes() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useNotes outside NotesProvider");
  return c;
}
