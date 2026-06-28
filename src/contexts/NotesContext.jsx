import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const NotesContext = createContext(null);

export const NOTE_CATEGORIES = [
  { id: "sermon",     label: "Sermon",      color: "#7C3AED", bg: "#EDE9FF" },
  { id: "study",      label: "Bible Study", color: "#0369A1", bg: "#E0F2FE" },
  { id: "prayer",     label: "Prayer",      color: "#BE185D", bg: "#FCE7F3" },
  { id: "devotional", label: "Devotional",  color: "#065F46", bg: "#D1FAE5" },
  { id: "general",    label: "General",     color: "#92400E", bg: "#FEF3C7" },
];

export const NOTE_COLORS = [
  { id: "white",  bg: "#FFFFFF",  border: "#E5E7EB" },
  { id: "purple", bg: "#EDE9FF",  border: "#C4B5FD" },
  { id: "gold",   bg: "#FFF9E6",  border: "#FCD34D" },
  { id: "green",  bg: "#ECFDF5",  border: "#6EE7B7" },
  { id: "blue",   bg: "#EFF6FF",  border: "#93C5FD" },
  { id: "pink",   bg: "#FDF2F8",  border: "#F9A8D4" },
];

export const HIGHLIGHT_COLORS = [
  { id: "yellow", label: "General",  bg: "#FFF3CC", text: "#92400E" },
  { id: "green",  label: "Promise",  bg: "#D4F5E2", text: "#065F46" },
  { id: "blue",   label: "Command",  bg: "#D4E8F5", text: "#0369A1" },
  { id: "pink",   label: "Grace",    bg: "#F5D4E8", text: "#BE185D" },
  { id: "purple", label: "Prophecy", bg: "#E5D4F5", text: "#6D28D9" },
];

function NotesContext_Provider({ children }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time sync with Firestore
  useEffect(() => {
    if (!user) { setNotes([]); setLoading(false); return; }

    // Query only by userId — sort client-side to avoid needing a
    // composite Firestore index (which requires manual setup in console)
    const q = query(
      collection(db, "notes"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const sorted = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() ?? 0;
          const bTime = b.updatedAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });
      setNotes(sorted);
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    return unsub;
  }, [user]);

  const createNote = useCallback(async (data = {}) => {
    if (!user) return null;
    const ref = await addDoc(collection(db, "notes"), {
      userId: user.uid,
      title: "Untitled Note",
      content: { type: "doc", content: [] },
      category: "general",
      tags: [],
      color: "white",
      isPinned: false,
      bibleRefs: [],
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }, [user]);

  const updateNote = useCallback(async (id, data) => {
    if (!id) return;
    await updateDoc(doc(db, "notes", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const deleteNote = useCallback(async (id) => {
    if (!id) return;
    await deleteDoc(doc(db, "notes", id));
    toast.success("Note deleted");
  }, []);

  const pinNote = useCallback(async (id, isPinned) => {
    await updateDoc(doc(db, "notes", id), { isPinned, updatedAt: serverTimestamp() });
  }, []);

  const pinnedNotes = notes.filter((n) => n.isPinned);
  const recentNotes = notes.slice(0, 10);

  return (
    <NotesContext.Provider value={{ notes, loading, pinnedNotes, recentNotes, createNote, updateNote, deleteNote, pinNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export { NotesContext_Provider as NotesProvider };

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}
