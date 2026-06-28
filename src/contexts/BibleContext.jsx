import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { loadTWFromURL, getChapter, getChapterCount } from "../utils/bibleParser";
import { BIBLE_BOOKS } from "../utils/bibleBooks";

const BibleContext = createContext(null);

export function BibleProvider({ children }) {
  // All translations from manifest
  const [manifest, setManifest] = useState([]);
  // Loaded translation data cache: { "KJV": { meta, books } }
  const [loadedData, setLoadedData] = useState({});
  const loading = useRef({});

  // Navigation
  const [currentBook, setCurrentBook] = useState("John");
  const [currentChapter, setCurrentChapter] = useState(3);

  // Translation state
  const [globalTranslation, setGlobalTranslation] = useState("KJV");
  // Per-verse overrides: { "John:3:16": "NIV" }
  const [verseOverrides, setVerseOverrides] = useState({});

  // Load manifest on mount
  useEffect(() => {
    fetch("/bibles/manifest.json")
      .then((r) => r.json())
      .then((data) => {
        setManifest(data.translations || []);
        // Auto-load first translation
        if (data.translations?.length > 0) {
          loadTranslation(data.translations[0].abbr, data.translations[0].file);
        }
      })
      .catch((err) => console.error("Manifest load failed:", err));
  }, []);

  const loadTranslation = useCallback(async (abbr, file) => {
    if (loadedData[abbr] || loading.current[abbr]) return;
    loading.current[abbr] = true;
    try {
      const data = await loadTWFromURL(`/bibles/${file}`);
      setLoadedData((prev) => ({ ...prev, [abbr]: data }));
    } catch (err) {
      console.error(`Failed to load ${abbr}:`, err);
    }
    loading.current[abbr] = false;
  }, [loadedData]);

  // Ensure a translation is loaded when needed
  const ensureLoaded = useCallback((abbr) => {
    if (loadedData[abbr]) return;
    const t = manifest.find((t) => t.abbr === abbr);
    if (t) loadTranslation(t.abbr, t.file);
  }, [manifest, loadedData, loadTranslation]);

  // Get verse text, respecting per-verse override
  const getVerseText = useCallback((book, chapter, verse, forceTranslation = null) => {
    const key = `${book}:${chapter}:${verse}`;
    const abbr = forceTranslation || verseOverrides[key] || globalTranslation;
    ensureLoaded(abbr);
    return loadedData[abbr]?.books?.[book]?.[chapter]?.[verse] ?? null;
  }, [loadedData, verseOverrides, globalTranslation, ensureLoaded]);

  // Get all verses for current chapter in given translation
  const getChapterVerses = useCallback((book, chapter, abbr = null) => {
    const translation = abbr || globalTranslation;
    ensureLoaded(translation);
    return getChapter(loadedData[translation], book, chapter);
  }, [loadedData, globalTranslation, ensureLoaded]);

  // Get chapter count for a book
  const getBookChapterCount = useCallback((book) => {
    const data = loadedData[globalTranslation];
    if (data) return getChapterCount(data, book);
    const bookObj = BIBLE_BOOKS.find((b) => b.name === book);
    return bookObj?.chapters ?? 1;
  }, [loadedData, globalTranslation]);

  // Get available books from loaded data
  const books = Object.keys(loadedData[globalTranslation]?.books || {}).sort((a, b) => {
    const ai = BIBLE_BOOKS.findIndex((x) => x.name === a);
    const bi = BIBLE_BOOKS.findIndex((x) => x.name === b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Switch ONE verse to a different translation
  const switchVerseTranslation = useCallback((book, chapter, verse, abbr) => {
    ensureLoaded(abbr);
    setVerseOverrides((prev) => ({
      ...prev,
      [`${book}:${chapter}:${verse}`]: abbr,
    }));
  }, [ensureLoaded]);

  // Switch ALL verses to a translation
  const switchAllTranslation = useCallback((abbr) => {
    ensureLoaded(abbr);
    setGlobalTranslation(abbr);
    setVerseOverrides({});
  }, [ensureLoaded]);

  // Navigation
  const navigateTo = useCallback((book, chapter = 1) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setVerseOverrides({});
  }, []);

  const currentVerses = getChapterVerses(currentBook, currentChapter);
  const currentBookData = BIBLE_BOOKS.find((b) => b.name === currentBook);
  const totalChapters = getBookChapterCount(currentBook);
  const isLoading = !loadedData[globalTranslation];

  return (
    <BibleContext.Provider value={{
      manifest,
      loadedData,
      books,
      currentBook, setCurrentBook,
      currentChapter, setCurrentChapter,
      currentVerses,
      currentBookData,
      totalChapters,
      isLoading,
      globalTranslation,
      verseOverrides,
      getVerseText,
      getChapterVerses,
      switchVerseTranslation,
      switchAllTranslation,
      navigateTo,
      ensureLoaded,
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
