import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { parseTWFile, getChapter, getChapterCount, searchBible, BibleData, formatShortRef } from "../utils/bibleParser";
import { BIBLE_BOOKS } from "../utils/bibleBooks";
import { loadBibleText, TRANSLATIONS } from "../utils/storage";

interface Translation { id:string; abbr:string; name:string; file:string; }

interface BibleCtx {
  manifest: Translation[];
  loadedData: Record<string, BibleData>;
  loadingStatus: Record<string, "loading"|"loaded"|"error">;
  currentBook: string;
  currentChapter: number;
  currentVerses: Array<{ verse:number; text:string }>;
  totalChapters: number;
  isLoading: boolean;
  globalTranslation: string;
  verseOverrides: Record<string, string>;
  activeSheet: string | null;
  setActiveSheet: (s: string | null) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  getVerseText: (book:string, chapter:number, verse:number) => string | null;
  switchVerseTranslation: (book:string, ch:number, vs:number, abbr:string) => void;
  switchAllTranslation: (abbr:string) => void;
  navigateTo: (book:string, chapter?:number) => void;
  searchAllLoaded: (query:string, max?:number) => Array<{book:string;chapter:number;verse:number;text:string}>;
  getBookChapterCount: (book:string) => number;
  shortRef: string;
}

const Ctx = createContext<BibleCtx | null>(null);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [loadedData, setLoadedData] = useState<Record<string, BibleData>>({});
  const [loadingStatus, setLoadingStatus] = useState<Record<string, "loading"|"loaded"|"error">>({});
  const [currentBook, setCurrentBook] = useState("John");
  const [currentChapter, setCurrentChapter] = useState(3);
  const [globalTranslation, setGlobalTranslation] = useState("KJV");
  const [verseOverrides, setVerseOverrides] = useState<Record<string, string>>({});
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const inFlight = useRef<Record<string, boolean>>({});

  const loadTranslation = useCallback(async (abbr: string, file: string) => {
    if (loadedData[abbr] || inFlight.current[abbr]) return;
    inFlight.current[abbr] = true;
    setLoadingStatus(p => ({ ...p, [abbr]: "loading" }));
    try {
      const text = await loadBibleText(abbr, file);
      const data = parseTWFile(text, abbr);
      setLoadedData(p => ({ ...p, [abbr]: data }));
      setLoadingStatus(p => ({ ...p, [abbr]: "loaded" }));
    } catch (e) {
      console.error(`Failed ${abbr}:`, e);
      setLoadingStatus(p => ({ ...p, [abbr]: "error" }));
    }
    inFlight.current[abbr] = false;
  }, [loadedData]);

  // Load all translations on mount (parallel)
  useEffect(() => {
    TRANSLATIONS.forEach(t => loadTranslation(t.abbr, t.file));
  }, []);

  const getBookChapterCount = useCallback((book: string) => {
    const data = loadedData[globalTranslation];
    if (data) return getChapterCount(data, book) || BIBLE_BOOKS.find(b => b.name === book)?.chapters || 1;
    return BIBLE_BOOKS.find(b => b.name === book)?.chapters || 1;
  }, [loadedData, globalTranslation]);

  const getVerseText = useCallback((book: string, chapter: number, verse: number) => {
    const key = `${book}:${chapter}:${verse}`;
    const abbr = verseOverrides[key] || globalTranslation;
    return loadedData[abbr]?.books?.[book]?.[chapter]?.[verse] ?? null;
  }, [loadedData, verseOverrides, globalTranslation]);

  const currentVerses = getChapter(loadedData[globalTranslation] ?? null, currentBook, currentChapter);
  const totalChapters = getBookChapterCount(currentBook);
  const isLoading = !loadedData[globalTranslation];
  const bookObj = BIBLE_BOOKS.find(b => b.name === currentBook);
  const shortRef = `${bookObj?.short ?? currentBook}.${currentChapter}`;

  const switchVerseTranslation = useCallback((book: string, ch: number, vs: number, abbr: string) => {
    setVerseOverrides(p => ({ ...p, [`${book}:${ch}:${vs}`]: abbr }));
  }, []);

  const switchAllTranslation = useCallback((abbr: string) => {
    setGlobalTranslation(abbr);
    setVerseOverrides({});
  }, []);

  const navigateTo = useCallback((book: string, chapter = 1) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setVerseOverrides({});
  }, []);

  const searchAllLoaded = useCallback((query: string, max = 200) => {
    const data = loadedData[globalTranslation];
    if (!data || !query.trim()) return [];
    return searchBible(data, query, max);
  }, [loadedData, globalTranslation]);

  return (
    <Ctx.Provider value={{
      manifest: TRANSLATIONS, loadedData, loadingStatus,
      currentBook, currentChapter, currentVerses,
      totalChapters, isLoading, shortRef,
      globalTranslation, verseOverrides,
      activeSheet, setActiveSheet,
      globalSearch, setGlobalSearch,
      getVerseText, switchVerseTranslation, switchAllTranslation,
      navigateTo, searchAllLoaded, getBookChapterCount,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBible() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBible outside BibleProvider");
  return c;
}
