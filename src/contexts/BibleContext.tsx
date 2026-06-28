import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { parseTWFile, getChapter, getChapterCount, searchBible, BibleData, shortRef as mkShortRef } from "../utils/bibleParser";
import { BIBLE_BOOKS } from "../utils/bibleBooks";
import { TRANSLATIONS, BIBLE_ASSETS } from "../constants";

interface BibleCtx {
  manifest: typeof TRANSLATIONS;
  loadedData: Record<string, BibleData>;
  loadStatus: Record<string, "idle"|"loading"|"done"|"err">;
  currentBook: string; currentChapter: number;
  currentVerses: {verse:number;text:string}[];
  totalChapters: number; isLoading: boolean;
  globalTranslation: string;
  verseOverrides: Record<string,string>;
  activeSheet: string|null; setActiveSheet(s:string|null):void;
  globalSearch: string; setGlobalSearch(s:string):void;
  getVerseText(book:string,ch:number,vs:number):string|null;
  switchVerseTrans(book:string,ch:number,vs:number,abbr:string):void;
  switchAllTrans(abbr:string):void;
  navigateTo(book:string,ch?:number):void;
  doSearch(query:string,max?:number):{book:string;chapter:number;verse:number;text:string}[];
  getChapCount(book:string):number;
  shortRef(book:string,ch:number,vs:number):string;
}
const Ctx = createContext<BibleCtx|null>(null);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [loadedData, setLoadedData] = useState<Record<string,BibleData>>({});
  const [loadStatus, setLoadStatus] = useState<Record<string,string>>({});
  const [currentBook, setCurrentBook] = useState("John");
  const [currentChapter, setCurrentChapter] = useState(3);
  const [globalTranslation, setGlobalTranslation] = useState("KJV");
  const [verseOverrides, setVerseOverrides] = useState<Record<string,string>>({});
  const [activeSheet, setActiveSheet] = useState<string|null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const inFlight = useRef<Record<string,boolean>>({});

  const loadTrans = useCallback(async (abbr: string) => {
    if (loadedData[abbr] || inFlight.current[abbr]) return;
    inFlight.current[abbr] = true;
    setLoadStatus(p => ({...p,[abbr]:"loading"}));
    try {
      // Check cache
      const cacheFile = `${FileSystem.cacheDirectory}bible_${abbr}.json`;
      let text: string;
      const info = await FileSystem.getInfoAsync(cacheFile);
      if (info.exists) {
        text = await FileSystem.readAsStringAsync(cacheFile);
        const data: BibleData = JSON.parse(text);
        setLoadedData(p => ({...p,[abbr]:data}));
        setLoadStatus(p => ({...p,[abbr]:"done"}));
        inFlight.current[abbr] = false;
        return;
      }
      // Load from bundled asset
      const asset = Asset.fromModule(BIBLE_ASSETS[abbr]);
      await asset.downloadAsync();
      const raw = await FileSystem.readAsStringAsync(asset.localUri!);
      const data = parseTWFile(raw, abbr);
      // Cache parsed JSON for fast future loads
      await FileSystem.writeAsStringAsync(cacheFile, JSON.stringify(data));
      setLoadedData(p => ({...p,[abbr]:data}));
      setLoadStatus(p => ({...p,[abbr]:"done"}));
    } catch(e) {
      console.error(`Failed ${abbr}:`, e);
      setLoadStatus(p => ({...p,[abbr]:"err"}));
    }
    inFlight.current[abbr] = false;
  }, [loadedData]);

  useEffect(() => { TRANSLATIONS.forEach(t => loadTrans(t.abbr)); }, []);

  const getChapCount = useCallback((book: string) => {
    const data = loadedData[globalTranslation];
    if (data) return getChapterCount(data, book) || BIBLE_BOOKS.find(b=>b.name===book)?.chapters || 1;
    return BIBLE_BOOKS.find(b=>b.name===book)?.chapters || 1;
  }, [loadedData, globalTranslation]);

  const getVerseText = useCallback((book: string, ch: number, vs: number) => {
    const key = `${book}:${ch}:${vs}`;
    const abbr = verseOverrides[key] || globalTranslation;
    return loadedData[abbr]?.books?.[book]?.[ch]?.[vs] ?? null;
  }, [loadedData, verseOverrides, globalTranslation]);

  const currentVerses = getChapter(loadedData[globalTranslation]??null, currentBook, currentChapter);
  const totalChapters = getChapCount(currentBook);
  const isLoading = loadStatus[globalTranslation] !== "done";

  return (
    <Ctx.Provider value={{
      manifest: TRANSLATIONS, loadedData, loadStatus,
      currentBook, currentChapter, currentVerses, totalChapters, isLoading,
      globalTranslation, verseOverrides,
      activeSheet, setActiveSheet,
      globalSearch, setGlobalSearch,
      getVerseText,
      switchVerseTrans: (book,ch,vs,abbr) => setVerseOverrides(p=>({...p,[`${book}:${ch}:${vs}`]:abbr})),
      switchAllTrans: (abbr) => { setGlobalTranslation(abbr); setVerseOverrides({}); },
      navigateTo: (book, ch=1) => { setCurrentBook(book); setCurrentChapter(ch); setVerseOverrides({}); },
      doSearch: (q, max=300) => {
        const data = loadedData[globalTranslation];
        if (!data || !q.trim()) return [];
        return searchBible(data, q, max);
      },
      getChapCount,
      shortRef: mkShortRef,
    }}>
      {children}
    </Ctx.Provider>
  );
}
export const useBible = () => useContext(Ctx)!;
