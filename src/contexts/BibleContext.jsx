import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { loadTWFromURL, getChapter, getChapterCount, searchBible } from "../utils/bibleParser";
import { BIBLE_BOOKS } from "../utils/bibleBooks";

const BibleContext = createContext(null);

export const ALL_TRANSLATIONS = [
  { id:"amp",  abbr:"AMP",  name:"Amplified Bible",             file:"AMP.tw"  },
  { id:"asv",  abbr:"ASV",  name:"American Standard Version",   file:"ASV.tw"  },
  { id:"esv",  abbr:"ESV",  name:"English Standard Version",    file:"ESV.tw"  },
  { id:"kjv",  abbr:"KJV",  name:"King James Version",          file:"KJV.tw"  },
  { id:"msg",  abbr:"MSG",  name:"The Message",                 file:"MSG.tw"  },
  { id:"nasb", abbr:"NASB", name:"New American Standard Bible", file:"NASB.tw" },
  { id:"niv",  abbr:"NIV",  name:"New International Version",   file:"NIV.tw"  },
  { id:"nkjv", abbr:"NKJV", name:"New King James Version",      file:"NKJV.tw" },
  { id:"nlt",  abbr:"NLT",  name:"New Living Translation",      file:"NLT.tw"  },
  { id:"rsv",  abbr:"RSV",  name:"Revised Standard Version",    file:"RSV.tw"  },
];

export function BibleProvider({ children }) {
  const [manifest]   = useState(ALL_TRANSLATIONS);
  const [loadedData, setLoadedData] = useState({});
  const loading      = useRef({});

  const [currentBook,        setCurrentBook]        = useState("John");
  const [currentChapter,     setCurrentChapter]     = useState(3);
  const [globalTranslation,  setGlobalTranslation]  = useState("KJV");
  const [verseOverrides,     setVerseOverrides]     = useState({});

  // Pre-load ALL translations on mount for instant switching
  useEffect(() => {
    ALL_TRANSLATIONS.forEach(t => _load(t.abbr, t.file));
  }, []);

  const _load = useCallback(async (abbr, file) => {
    if (loadedData[abbr] || loading.current[abbr]) return;
    loading.current[abbr] = true;
    try {
      const data = await loadTWFromURL(`/bibles/${file}?v=4`, abbr);
      setLoadedData(prev => ({ ...prev, [abbr]: data }));
    } catch(e) { console.error(`${abbr}:`, e); }
    loading.current[abbr] = false;
  }, [loadedData]);

  const ensureLoaded = useCallback((abbr) => {
    const t = ALL_TRANSLATIONS.find(t => t.abbr === abbr);
    if (t) _load(t.abbr, t.file);
  }, [_load]);

  // Instant: reads from already-loaded data
  const getVerseText = useCallback((book, chapter, verse) => {
    const key  = `${book}:${chapter}:${verse}`;
    const abbr = verseOverrides[key] || globalTranslation;
    return loadedData[abbr]?.books?.[book]?.[chapter]?.[verse] ?? null;
  }, [loadedData, verseOverrides, globalTranslation]);

  const getChapterVerses = useCallback((book, chapter, abbr) => {
    return getChapter(loadedData[abbr || globalTranslation], book, chapter);
  }, [loadedData, globalTranslation]);

  const getBookChapterCount = useCallback((book) => {
    const data = loadedData[globalTranslation];
    if (data) return getChapterCount(data, book) || BIBLE_BOOKS.find(b => b.name === book)?.chapters || 1;
    return BIBLE_BOOKS.find(b => b.name === book)?.chapters || 1;
  }, [loadedData, globalTranslation]);

  // Instant switch — data already loaded
  const switchVerseTranslation = useCallback((book, chapter, verse, abbr) => {
    setVerseOverrides(prev => ({ ...prev, [`${book}:${chapter}:${verse}`]: abbr }));
  }, []);

  const switchAllTranslation = useCallback((abbr) => {
    setGlobalTranslation(abbr);
    setVerseOverrides({});
  }, []);

  const navigateTo = useCallback((book, chapter = 1) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setVerseOverrides({});
  }, []);

  const searchAllLoaded = useCallback((query, max = 200) => {
    const data = loadedData[globalTranslation];
    if (!data || !query.trim()) return [];
    return searchBible(data, query, max);
  }, [loadedData, globalTranslation]);

  const books = Object.keys(loadedData[globalTranslation]?.books || {}).sort((a, b) => {
    const ai = BIBLE_BOOKS.findIndex(x => x.name === a);
    const bi = BIBLE_BOOKS.findIndex(x => x.name === b);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });

  const currentVerses   = getChapterVerses(currentBook, currentChapter);
  const totalChapters   = getBookChapterCount(currentBook);
  const isLoading       = !loadedData[globalTranslation];
  const currentBookData = BIBLE_BOOKS.find(b => b.name === currentBook);

  return (
    <BibleContext.Provider value={{
      manifest, loadedData, books,
      currentBook, setCurrentBook,
      currentChapter, setCurrentChapter,
      currentVerses, currentBookData, totalChapters, isLoading,
      globalTranslation, verseOverrides,
      getVerseText, getChapterVerses, getBookChapterCount,
      switchVerseTranslation, switchAllTranslation,
      navigateTo, ensureLoaded, searchAllLoaded,
    }}>
      {children}
    </BibleContext.Provider>
  );
}

export function useBible() {
  const ctx = useContext(BibleContext);
  if (!ctx) throw new Error("useBible must be inside BibleProvider");
  return ctx;
}
