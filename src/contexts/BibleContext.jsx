import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import { useAuth } from "./AuthContext";
import { loadTWFromURL, loadTWFromFile, getChapter, parseTWFile } from "../utils/bibleParser";
import { BIBLE_BOOKS } from "../utils/bibleBooks";
import toast from "react-hot-toast";

const BibleContext = createContext(null);

const SAMPLE_TRANSLATIONS = [
  { id: "kjv-sample", name: "King James Version", abbr: "KJV", url: "/bibles/kjv-sample.tw", builtin: true },
];

export function BibleProvider({ children }) {
  const { user } = useAuth();

  // Translation registry
  const [translations, setTranslations] = useState(SAMPLE_TRANSLATIONS);
  const [activeTranslationId, setActiveTranslationId] = useState("kjv-sample");
  const [bibleData, setBibleData] = useState(null); // parsed { meta, books }
  const [loadingBible, setLoadingBible] = useState(false);

  // Navigation state
  const [currentBook, setCurrentBook] = useState("JHN");
  const [currentChapter, setCurrentChapter] = useState(3);
  const [verses, setVerses] = useState([]);

  // Load active translation
  useEffect(() => {
    const translation = translations.find((t) => t.id === activeTranslationId);
    if (!translation) return;

    setLoadingBible(true);
    loadTWFromURL(translation.url)
      .then((data) => {
        setBibleData(data);
        setLoadingBible(false);
      })
      .catch((err) => {
        console.error("Failed to load Bible:", err);
        toast.error("Could not load Bible translation.");
        setLoadingBible(false);
      });
  }, [activeTranslationId, translations]);

  // Update verses when book/chapter/bibleData changes
  useEffect(() => {
    if (!bibleData) return;
    setVerses(getChapter(bibleData, currentBook, currentChapter));
  }, [bibleData, currentBook, currentChapter]);

  // Load user's uploaded translations from Firebase Storage
  useEffect(() => {
    if (!user) return;
    const storageRef = ref(storage, `bibles/${user.uid}`);
    listAll(storageRef)
      .then(async (result) => {
        const userTranslations = await Promise.all(
          result.items.map(async (item) => {
            const url = await getDownloadURL(item);
            const id = item.name.replace(".tw", "");
            return { id, name: id, abbr: id.toUpperCase(), url, builtin: false };
          })
        );
        setTranslations((prev) => {
          const userIds = userTranslations.map((t) => t.id);
          const filtered = prev.filter((t) => t.builtin || !userIds.includes(t.id));
          return [...filtered, ...userTranslations];
        });
      })
      .catch(() => {});
  }, [user]);

  // Upload a new .tw translation file
  const uploadTranslation = useCallback(async (file) => {
    if (!user) return;
    if (!file.name.endsWith(".tw")) {
      toast.error("Please upload a .tw file");
      return;
    }

    const toastId = toast.loading("Uploading translation...");
    try {
      // Parse to validate and get metadata
      const data = await loadTWFromFile(file);
      const { abbr, name } = data.meta;
      const id = abbr.toLowerCase() || file.name.replace(".tw", "");

      const storageRef = ref(storage, `bibles/${user.uid}/${id}.tw`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      setTranslations((prev) => [
        ...prev.filter((t) => t.id !== id),
        { id, name, abbr, url, builtin: false },
      ]);

      toast.success(`${name} (${abbr}) added!`, { id: toastId });
      return id;
    } catch (err) {
      toast.error("Failed to upload Bible", { id: toastId });
      throw err;
    }
  }, [user]);

  const removeTranslation = useCallback(async (id) => {
    if (!user) return;
    const storageRef = ref(storage, `bibles/${user.uid}/${id}.tw`);
    await deleteObject(storageRef);
    setTranslations((prev) => prev.filter((t) => t.id !== id));
    if (activeTranslationId === id) setActiveTranslationId("kjv-sample");
    toast.success("Translation removed");
  }, [user, activeTranslationId]);

  const navigateTo = useCallback((book, chapter = 1) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
  }, []);

  const activeTranslation = translations.find((t) => t.id === activeTranslationId);
  const currentBookData = BIBLE_BOOKS.find((b) => b.code === currentBook);

  return (
    <BibleContext.Provider value={{
      translations, activeTranslation, activeTranslationId, setActiveTranslationId,
      bibleData, loadingBible,
      currentBook, currentChapter, currentBookData,
      verses,
      navigateTo,
      setCurrentBook, setCurrentChapter,
      uploadTranslation, removeTranslation,
    }}>
      {children}
    </BibleContext.Provider>
  );
}

export function useBible() {
  const ctx = useContext(BibleContext);
  if (!ctx) throw new Error("useBible must be used inside BibleProvider");
  return ctx;
}
