import { useState, useRef, useEffect } from "react";
import { Search, X, BookOpen, ListOrdered, List, MapPin } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS, BIBLE_BOOKS } from "../../utils/bibleBooks";
import { searchBible } from "../../utils/bibleParser";
import VerseCard from "./VerseCard";
import BottomSheet from "../ui/BottomSheet";

const DARK_BLUE = "#160A47";
const MAROON    = "#7B1515";

export default function BibleReader({ compact = false, onInsertToNote }) {
  const {
    currentBook, currentChapter, currentVerses,
    totalChapters, isLoading, globalTranslation,
    navigateTo, loadedData, switchAllTranslation,
  } = useBible();

  const [bookOpen,    setBookOpen]    = useState(false);
  const [otBookOpen,  setOtBookOpen]  = useState(false);  // OT direct
  const [ntBookOpen,  setNtBookOpen]  = useState(false);  // NT direct
  const [chapterOpen, setChapterOpen] = useState(false);
  const [verseOpen,   setVerseOpen]   = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState([]);
  const [testament,   setTestament]   = useState("NT");
  const [jumpVerse,   setJumpVerse]   = useState(null);
  const listRef = useRef(null);

  useEffect(() => { listRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [currentBook, currentChapter]);
  useEffect(() => {
    if (jumpVerse === null) return;
    const timer = setTimeout(() => {
      document.getElementById(`verse-${jumpVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      setJumpVerse(null);
    }, 120);
    return () => clearTimeout(timer);
  }, [jumpVerse]);

  const doSearch = () => {
    const data = loadedData[globalTranslation];
    if (!data || !query.trim()) return;
    setResults(searchBible(data, query, 100));
  };

  const bookObj  = BIBLE_BOOKS.find(b => b.name === currentBook);
  const shortRef = `${bookObj?.short ?? currentBook}.${currentChapter}`;
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  /* ── Book list shared render ── */
  const BookGrid = ({ list, onClose }) => (
    <div className="grid grid-cols-2 gap-1.5">
      {list.map(b => {
        const active = b.name === currentBook;
        return (
          <button key={b.code}
            onClick={() => { navigateTo(b.name, 1); onClose(); }}
            className="text-left px-3 py-2 rounded-xl text-sm font-body transition-colors"
            style={active
              ? { background:"rgba(255,255,255,0.22)", color:"#fff", fontWeight:700 }
              : { background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.75)" }}>
            {b.name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full">

      {/* ── BIBLE SUB-HEADER ── */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ background: DARK_BLUE }}>
        {/* 📍 Book icon → opens combined OT+NT picker */}
        <button
          onClick={() => { setTestament("NT"); setBookOpen(true); }}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"
          title="Choose book"
        >
          <MapPin className="w-4 h-4 text-white" />
        </button>

        {/* Chapter.Verse reference (also tappable → chapter picker) */}
        <button
          onClick={() => setChapterOpen(true)}
          className="flex items-center gap-1 flex-1 min-w-0"
        >
          <span className="font-display font-semibold text-white text-base truncate">
            {shortRef}
          </span>
        </button>

        {/* Search */}
        <button
          onClick={() => { setSearchOpen(p => !p); setResults([]); setQuery(""); }}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0"
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="px-4 py-2.5 bg-white border-b border-gray-100 shrink-0">
          <div className="flex gap-2">
            <input autoFocus value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="Search scripture…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-body outline-none" />
            <button onClick={doSearch}
              className="px-4 py-2 rounded-xl text-sm font-body font-medium text-white"
              style={{ background: DARK_BLUE }}>Go</button>
            <button onClick={() => { setSearchOpen(false); setResults([]); }}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          {results.length > 0 && (
            <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
              {results.map((r, i) => (
                <button key={i}
                  onClick={() => { navigateTo(r.book, r.chapter); setJumpVerse(r.verse); setSearchOpen(false); setResults([]); }}
                  className="w-full text-left px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <span className="text-xs font-body font-bold" style={{ color: MAROON }}>
                    {r.book} {r.chapter}:{r.verse}
                  </span>
                  <p className="font-scripture text-gray-600 text-sm mt-0.5 line-clamp-2">{r.text}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VERSE LIST ── */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-gray-100 animate-spin" style={{ borderTopColor: DARK_BLUE }} />
            <p className="font-body text-sm text-gray-400">Loading {globalTranslation}…</p>
          </div>
        ) : currentVerses.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="font-body text-gray-400 text-sm">No verses found.</p>
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
        <button onClick={() => setChapterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-body font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
          <ListOrdered className="w-3.5 h-3.5" /> Chapters
        </button>
        <button onClick={() => setVerseOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-body font-semibold text-gray-600 hover:bg-gray-50 shadow-sm">
          <List className="w-3.5 h-3.5" /> Verses
        </button>

        {/* OT and NT quick-open circles */}
        <div className="flex gap-1.5 ml-auto">
          <button onClick={() => setOtBookOpen(true)}
            className="w-9 h-9 rounded-full text-[11px] font-body font-bold text-white flex items-center justify-center shadow-sm"
            style={{ background: "#1D4ED8" }}>OT</button>
          <button onClick={() => setNtBookOpen(true)}
            className="w-9 h-9 rounded-full text-[11px] font-body font-bold text-white flex items-center justify-center shadow-sm"
            style={{ background: "#7C3AED" }}>NT</button>
        </div>
      </div>

      {/* ══ BOOK SHEET (combined OT+NT with tabs) ══ */}
      <BottomSheet open={bookOpen} onClose={() => setBookOpen(false)} title="Choose Book" maxHeight="85vh">
        <div className="flex rounded-xl overflow-hidden mb-3 border border-white/15">
          {["OT","NT"].map(t => (
            <button key={t} onClick={() => setTestament(t)}
              className="flex-1 py-2 text-sm font-body font-semibold transition-colors"
              style={testament===t
                ? { background:"rgba(255,255,255,0.18)", color:"#fff" }
                : { color:"rgba(255,255,255,0.45)" }}>
              {t === "OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>
        <BookGrid list={testament==="OT" ? OT_BOOKS : NT_BOOKS} onClose={() => setBookOpen(false)} />
      </BottomSheet>

      {/* ══ OT BOOK SHEET ══ */}
      <BottomSheet open={otBookOpen} onClose={() => setOtBookOpen(false)} title="Old Testament" maxHeight="85vh">
        <BookGrid list={OT_BOOKS} onClose={() => setOtBookOpen(false)} />
      </BottomSheet>

      {/* ══ NT BOOK SHEET ══ */}
      <BottomSheet open={ntBookOpen} onClose={() => setNtBookOpen(false)} title="New Testament" maxHeight="85vh">
        <BookGrid list={NT_BOOKS} onClose={() => setNtBookOpen(false)} />
      </BottomSheet>

      {/* ══ CHAPTER SHEET — smaller grid (6 cols) ══ */}
      <BottomSheet open={chapterOpen} onClose={() => setChapterOpen(false)} title="Chapters">
        <div className="grid grid-cols-6 gap-2 pt-1">
          {chapters.map(c => {
            const active = c === currentChapter;
            return (
              <button key={c}
                onClick={() => { navigateTo(currentBook, c); setChapterOpen(false); }}
                className="h-9 rounded-lg text-sm font-body font-bold border-2 flex items-center justify-center transition-all"
                style={active
                  ? { background:"#fff", color:DARK_BLUE, borderColor:"#fff" }
                  : { background:"transparent", color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.25)" }}>
                {c}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* ══ VERSE SHEET — smaller grid (7 cols) ══ */}
      <BottomSheet open={verseOpen} onClose={() => setVerseOpen(false)}
        title={`${bookObj?.short ?? currentBook} ${currentChapter} — Verses`}>
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {currentVerses.map(({ verse: v }) => (
            <button key={v}
              onClick={() => { setVerseOpen(false); setJumpVerse(v); }}
              className="h-8 rounded-lg text-xs font-body font-bold border flex items-center justify-center transition-all"
              style={{ background:"transparent", color:"rgba(255,255,255,0.85)", borderColor:"rgba(255,255,255,0.25)" }}>
              {v}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
