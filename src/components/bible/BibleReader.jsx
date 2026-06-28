import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, BookOpen, ListOrdered, List, MapPin } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS, BIBLE_BOOKS } from "../../utils/bibleBooks";
import VerseCard from "./VerseCard";
import BottomSheet from "../ui/BottomSheet";

const DARK_BLUE = "#160A47";
const MAROON    = "#7B1515";

export default function BibleReader({ compact = false, onInsertToNote }) {
  const {
    currentBook, currentChapter, currentVerses,
    totalChapters, isLoading, globalTranslation,
    navigateTo, loadedData, searchAllLoaded,
  } = useBible();

  const [bookOpen,    setBookOpen]    = useState(false);
  const [otBookOpen,  setOtBookOpen]  = useState(false);
  const [ntBookOpen,  setNtBookOpen]  = useState(false);
  const [chapterOpen, setChapterOpen] = useState(false);
  const [verseOpen,   setVerseOpen]   = useState(false);
  const [testament,   setTestament]   = useState("NT");

  // Real-time search state
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchActive,  setSearchActive]  = useState(false);
  const [jumpVerse,     setJumpVerse]     = useState(null);
  const listRef  = useRef(null);
  const searchRef = useRef(null);
  const debounce = useRef(null);

  useEffect(() => { listRef.current?.scrollTo({ top:0, behavior:"smooth" }); }, [currentBook, currentChapter]);
  useEffect(() => {
    if (jumpVerse === null) return;
    const t = setTimeout(() => {
      document.getElementById(`verse-${jumpVerse}`)?.scrollIntoView({ behavior:"smooth", block:"center" });
      setJumpVerse(null);
    }, 100);
    return () => clearTimeout(t);
  }, [jumpVerse]);

  // Real-time search with 150ms debounce
  const handleSearchInput = useCallback((val) => {
    setSearchQuery(val);
    clearTimeout(debounce.current);
    if (!val.trim()) { setSearchResults([]); setSearchActive(false); return; }
    setSearchActive(true);
    debounce.current = setTimeout(() => {
      const results = searchAllLoaded(val, 300);
      setSearchResults(results);
    }, 150);
  }, [searchAllLoaded]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchActive(false);
    searchRef.current?.focus();
  };

  const bookObj  = BIBLE_BOOKS.find(b => b.name === currentBook);
  const shortRef = `${bookObj?.short ?? currentBook}.${currentChapter}`;
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  const BookGrid = ({ list, onClose }) => (
    <div className="grid grid-cols-2 gap-1.5">
      {list.map(b => (
        <button key={b.code} onClick={() => { navigateTo(b.name, 1); onClose(); }}
          className="text-left px-3 py-2 rounded-xl text-sm font-body transition-colors"
          style={b.name === currentBook
            ? { background:"rgba(255,255,255,0.22)", color:"#fff", fontWeight:700 }
            : { background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.75)" }}>
          {b.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── BIBLE HEADER ── */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ background: DARK_BLUE }}>
        <button onClick={() => { setTestament("NT"); setBookOpen(true); }}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-white" />
        </button>
        <button onClick={() => setChapterOpen(true)} className="flex-1 min-w-0 text-left">
          <span className="font-display font-semibold text-white text-base truncate">{shortRef}</span>
        </button>
        {/* Search input always visible in header */}
        <div className="flex items-center gap-1 bg-white/10 rounded-xl px-2 py-1">
          <Search className="w-3.5 h-3.5 text-white/60 shrink-0" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={e => handleSearchInput(e.target.value)}
            placeholder="Search…"
            className="bg-transparent text-white text-xs font-body w-24 outline-none placeholder-white/40"
          />
          {searchQuery && (
            <button onClick={clearSearch}>
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          )}
        </div>
      </div>

      {/* ── CONTENT: either chapter verses OR live search results ── */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {searchActive ? (
          /* Real-time search results — inline, replaces chapter view */
          searchResults.length === 0 && searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-body text-gray-400 text-sm">No results for "{searchQuery}"</p>
            </div>
          ) : (
            <div>
              {searchResults.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs font-body text-gray-400">
                    {searchResults.length} result{searchResults.length > 1 ? "s" : ""} in {globalTranslation}
                    {searchResults.length === 300 ? "+" : ""}
                  </p>
                </div>
              )}
              {searchResults.map((r, i) => (
                <button key={i}
                  onClick={() => { navigateTo(r.book, r.chapter); clearSearch(); }}
                  className="w-full text-left">
                  <VerseCard
                    book={r.book} chapter={r.chapter} verse={r.verse}
                    text={r.text} onInsertToNote={onInsertToNote}
                  />
                </button>
              ))}
            </div>
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

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white border-t border-gray-100">
        <button onClick={() => { setTestament("NT"); setBookOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-body font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
          <MapPin className="w-3.5 h-3.5" /> Book
        </button>
        <button onClick={() => setChapterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-body font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
          <ListOrdered className="w-3.5 h-3.5" /> Chapters
        </button>
        <button onClick={() => setVerseOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-body font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
          <List className="w-3.5 h-3.5" /> Verses
        </button>
      </div>

      {/* ══ SHEETS ══ */}
      <BottomSheet open={bookOpen} onClose={() => setBookOpen(false)} title="Choose Book" maxHeight="85vh">
        <div className="flex rounded-xl overflow-hidden mb-3 border border-white/15">
          {["OT","NT"].map(t => (
            <button key={t} onClick={() => setTestament(t)}
              className="flex-1 py-2 text-sm font-body font-semibold"
              style={testament===t ? { background:"rgba(255,255,255,0.18)", color:"#fff" } : { color:"rgba(255,255,255,0.45)" }}>
              {t==="OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>
        <BookGrid list={testament==="OT" ? OT_BOOKS : NT_BOOKS} onClose={() => setBookOpen(false)} />
      </BottomSheet>

      <BottomSheet open={otBookOpen} onClose={() => setOtBookOpen(false)} title="Old Testament" maxHeight="85vh">
        <BookGrid list={OT_BOOKS} onClose={() => setOtBookOpen(false)} />
      </BottomSheet>

      <BottomSheet open={ntBookOpen} onClose={() => setNtBookOpen(false)} title="New Testament" maxHeight="85vh">
        <BookGrid list={NT_BOOKS} onClose={() => setNtBookOpen(false)} />
      </BottomSheet>

      <BottomSheet open={chapterOpen} onClose={() => setChapterOpen(false)} title="Chapters">
        <div className="grid grid-cols-6 gap-2 pt-1">
          {chapters.map(c => (
            <button key={c} onClick={() => { navigateTo(currentBook, c); setChapterOpen(false); }}
              className="h-9 rounded-lg text-sm font-body font-bold border-2 flex items-center justify-center"
              style={c===currentChapter
                ? { background:"#fff", color:DARK_BLUE, borderColor:"#fff" }
                : { background:"transparent", color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.25)" }}>
              {c}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={verseOpen} onClose={() => setVerseOpen(false)}
        title={`${bookObj?.short ?? currentBook} ${currentChapter} — Verses`}>
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {currentVerses.map(({ verse: v }) => (
            <button key={v} onClick={() => { setVerseOpen(false); setJumpVerse(v); }}
              className="h-8 rounded-lg text-xs font-body font-bold border flex items-center justify-center"
              style={{ background:"transparent", color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.25)" }}>
              {v}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
