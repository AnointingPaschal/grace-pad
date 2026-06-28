import { useState, useRef, useEffect, useCallback } from "react";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS, BIBLE_BOOKS } from "../../utils/bibleBooks";
import VerseCard from "./VerseCard";
import BottomSheet from "../ui/BottomSheet";

const DARK_BLUE = "#160A47";
const OT_SET = new Set(OT_BOOKS.map(b => b.name));
const NT_SET = new Set(NT_BOOKS.map(b => b.name));

// Highlighted text component
function HL({ text, query }) {
  if (!query) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return <>{parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{background:"#FEF3C7",borderRadius:"2px",padding:"0 1px"}}>{p}</mark>
      : <span key={i}>{p}</span>
  )}</>;
}

export default function BibleReader({ onInsertToNote }) {
  const {
    currentBook, currentChapter, currentVerses, totalChapters,
    isLoading, globalTranslation, navigateTo,
    activeSheet, setActiveSheet, globalSearch, setGlobalSearch,
    searchAllLoaded,
  } = useBible();

  const [testament,   setTestament]   = useState("NT");
  const [bookOpen,    setBookOpen]    = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [verseOpen,   setVerseOpen]   = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilter,  setSearchFilter]  = useState("ALL"); // ALL | OT | NT
  const listRef   = useRef(null);
  const debouncer = useRef(null);

  // Sync context activeSheet → open the right modal
  useEffect(() => {
    if (!activeSheet) return;
    if (activeSheet === "book")    { setTestament("NT"); setBookOpen(true); }
    if (activeSheet === "chapter") setChapterOpen(true);
    if (activeSheet === "verse")   setVerseOpen(true);
    setActiveSheet(null);
  }, [activeSheet, setActiveSheet]);

  // Scroll to top on chapter change
  useEffect(() => { listRef.current?.scrollTo({ top: 0 }); }, [currentBook, currentChapter]);

  // Real-time search from globalSearch context
  useEffect(() => {
    clearTimeout(debouncer.current);
    if (!globalSearch.trim()) { setSearchResults([]); return; }
    debouncer.current = setTimeout(() => setSearchResults(searchAllLoaded(globalSearch, 500)), 150);
  }, [globalSearch, searchAllLoaded]);

  // Book → auto chapter → auto verse cascade
  const selectBook = (name) => {
    navigateTo(name, 1);
    setBookOpen(false);
    setTimeout(() => setChapterOpen(true), 280);
  };
  const selectChapter = (ch) => {
    navigateTo(currentBook, ch);
    setChapterOpen(false);
    setTimeout(() => setVerseOpen(true), 280);
  };
  const selectVerse = (v) => {
    setVerseOpen(false);
    setTimeout(() => {
      document.getElementById(`verse-${v}`)?.scrollIntoView({ block: "start" });
    }, 100);
  };

  const bookObj  = BIBLE_BOOKS.find(b => b.name === currentBook);
  const shortRef = `${bookObj?.short ?? currentBook}.${currentChapter}`;
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
  const isSearching = !!globalSearch.trim();

  const filteredResults = !isSearching ? [] : (
    searchFilter === "OT" ? searchResults.filter(r => OT_SET.has(r.book)) :
    searchFilter === "NT" ? searchResults.filter(r => NT_SET.has(r.book)) :
    searchResults
  );

  const BookGrid = ({ list }) => (
    <div className="grid grid-cols-2 gap-1.5">
      {list.map(b => (
        <button key={b.code} onClick={() => selectBook(b.name)}
          className="text-left px-3 py-2 rounded-xl text-sm font-body transition-colors"
          style={b.name===currentBook
            ? {background:"rgba(255,255,255,0.22)",color:"#fff",fontWeight:700}
            : {background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.85)"}}>
          {b.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col bg-white h-full">
      {/* Bible sub-header */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ background: DARK_BLUE }}>
        <button onClick={() => { setTestament("NT"); setBookOpen(true); }}
          className="flex-1 text-left min-w-0">
          <span className="font-display font-semibold text-white text-base">{shortRef}</span>
        </button>
        {isSearching && (
          <span className="text-white/50 text-xs font-body shrink-0">
            {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* OT / NT / ALL filter tabs — only when searching */}
      {isSearching && (
        <div className="flex border-b border-gray-100 bg-white shrink-0">
          {["ALL","OT","NT"].map(f => (
            <button key={f} onClick={() => setSearchFilter(f)}
              className="flex-1 py-2 text-xs font-body font-semibold transition-colors border-b-2"
              style={searchFilter===f
                ? {color:DARK_BLUE, borderColor:DARK_BLUE}
                : {color:"#9CA3AF", borderColor:"transparent"}}>
              {f === "ALL" ? "All Results" : f === "OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>
      )}

      {/* Verses / Search results */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isSearching ? (
          filteredResults.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-body text-gray-400 text-sm">No results for "{globalSearch}"</p>
            </div>
          ) : (
            filteredResults.map((r, i) => (
              <div key={i} onClick={() => { navigateTo(r.book, r.chapter); setGlobalSearch(""); }}>
                <VerseCard
                  book={r.book} chapter={r.chapter} verse={r.verse}
                  text={r.text} onInsertToNote={onInsertToNote}
                  searchHighlight={globalSearch}
                />
              </div>
            ))
          )
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-gray-100 animate-spin" style={{ borderTopColor: DARK_BLUE }} />
            <p className="font-body text-sm text-gray-400">Loading {globalTranslation}…</p>
          </div>
        ) : (
          currentVerses.map(v => (
            <div id={`verse-${v.verse}`} key={v.verse}>
              <VerseCard book={currentBook} chapter={currentChapter}
                verse={v.verse} text={v.text} onInsertToNote={onInsertToNote} />
            </div>
          ))
        )}
      </div>

      {/* ══ SHEETS ══ */}
      <BottomSheet open={bookOpen} onClose={() => setBookOpen(false)} title="Choose Book" maxHeight="85vh">
        <div className="flex rounded-xl overflow-hidden mb-3 border border-white/15">
          {["OT","NT"].map(t => (
            <button key={t} onClick={() => setTestament(t)}
              className="flex-1 py-2 text-sm font-body font-semibold"
              style={testament===t ? {background:"rgba(255,255,255,0.18)",color:"#fff"} : {color:"rgba(255,255,255,0.45)"}}>
              {t==="OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>
        <BookGrid list={testament==="OT" ? OT_BOOKS : NT_BOOKS} />
      </BottomSheet>

      <BottomSheet open={chapterOpen} onClose={() => setChapterOpen(false)} title="Chapters">
        <div className="grid grid-cols-6 gap-2 pt-1">
          {chapters.map(c => (
            <button key={c} onClick={() => selectChapter(c)}
              className="h-9 rounded-lg text-sm font-body font-bold border-2 flex items-center justify-center"
              style={c===currentChapter
                ? {background:"#fff",color:DARK_BLUE,borderColor:"#fff"}
                : {background:"transparent",color:"rgba(255,255,255,0.9)",borderColor:"rgba(255,255,255,0.25)"}}>
              {c}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={verseOpen} onClose={() => setVerseOpen(false)}
        title={`${bookObj?.short ?? currentBook} ${currentChapter} — Verses`}>
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {currentVerses.map(({ verse: v }) => (
            <button key={v} onClick={() => selectVerse(v)}
              className="h-8 rounded-lg text-xs font-body font-bold border flex items-center justify-center"
              style={{background:"transparent",color:"rgba(255,255,255,0.9)",borderColor:"rgba(255,255,255,0.25)"}}>
              {v}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
