import { useState, useRef, useEffect } from "react";
import { Search, X, BookOpen, ListOrdered, List, PenLine } from "lucide-react";
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
    navigateTo, loadedData, manifest, switchAllTranslation,
  } = useBible();

  const [bookOpen,    setBookOpen]    = useState(false);
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
    if (jumpVerse !== null) {
      setTimeout(() => {
        document.getElementById(`verse-${jumpVerse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        setJumpVerse(null);
      }, 120);
    }
  }, [jumpVerse]);

  const doSearch = () => {
    const data = loadedData[globalTranslation];
    if (!data || !query.trim()) return;
    setResults(searchBible(data, query, 100));
  };

  const bookObj    = BIBLE_BOOKS.find(b => b.name === currentBook);
  const shortRef   = `${bookObj?.short ?? currentBook}.${currentChapter}`;
  const chapters   = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <div className="flex flex-col" style={{ height: "100%" }}>

      {/* ── BIBLE SUB-HEADER (dark blue) ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 shrink-0"
        style={{ background: DARK_BLUE }}
      >
        {/* Book tap → book picker */}
        <button onClick={() => setBookOpen(true)} className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen className="w-4 h-4 text-white/60 shrink-0" />
          <span className="font-display font-semibold text-white text-base truncate">{shortRef}</span>
        </button>
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
            <input
              autoFocus value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder="Search scripture…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-body outline-none"
            />
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
                <button key={i} onClick={() => { navigateTo(r.book, r.chapter); setJumpVerse(r.verse); setSearchOpen(false); setResults([]); }}
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
            <div className="w-8 h-8 rounded-full border-2 border-gray-100 animate-spin" style={{ borderTopColor: DARK_BLUE }} />
            <p className="font-body text-sm text-gray-400">Loading {globalTranslation}…</p>
          </div>
        ) : currentVerses.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="font-body text-gray-400 text-sm">No verses found.</p>
          </div>
        ) : (
          currentVerses.map(v => (
            <div id={`verse-${v.verse}`} key={v.verse}>
              <VerseCard
                book={currentBook} chapter={currentChapter}
                verse={v.verse} text={v.text}
                onInsertToNote={onInsertToNote}
              />
            </div>
          ))
        )}
      </div>

      {/* ── FLOATING ACTION BAR ── */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white border-t border-gray-100">
        {[
          { label: "Chapters", icon: ListOrdered, action: () => setChapterOpen(true) },
          { label: "Verses",   icon: List,        action: () => setVerseOpen(true)   },
        ].map(({ label, icon: Icon, action }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-body font-semibold text-gray-600 hover:border-gray-300 active:bg-gray-50 transition-colors shadow-sm">
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
        {/* OT / NT quick circles */}
        <div className="flex gap-2 ml-auto">
          {[{ t:"OT", bg:"#1D4ED8" }, { t:"NT", bg:"#7C3AED" }].map(({ t, bg }) => (
            <button key={t} onClick={() => navigateTo((t==="OT" ? OT_BOOKS : NT_BOOKS)[0].name, 1)}
              className="w-9 h-9 rounded-full text-[11px] font-body font-bold text-white flex items-center justify-center shadow-sm"
              style={{ background: bg }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ══ BOOK SHEET ══ */}
      <BottomSheet open={bookOpen} onClose={() => setBookOpen(false)} title="Select Book" maxHeight="85vh">
        <div className="flex rounded-xl overflow-hidden mb-4 border border-white/15">
          {["OT","NT"].map(t => (
            <button key={t} onClick={() => setTestament(t)}
              className="flex-1 py-2.5 text-sm font-body font-semibold transition-colors"
              style={testament===t ? { background:"rgba(255,255,255,0.18)", color:"#fff" } : { color:"rgba(255,255,255,0.45)" }}>
              {t==="OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(testament==="OT" ? OT_BOOKS : NT_BOOKS).map(b => {
            const active = b.name === currentBook;
            return (
              <button key={b.code}
                onClick={() => { navigateTo(b.name, 1); setBookOpen(false); }}
                className="text-left px-3 py-2.5 rounded-xl text-sm font-body transition-colors"
                style={active
                  ? { background:"rgba(255,255,255,0.22)", color:"#fff", fontWeight:700 }
                  : { background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.75)" }}>
                {b.name}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* ══ CHAPTER SHEET ══ */}
      <BottomSheet open={chapterOpen} onClose={() => setChapterOpen(false)} title="Chapters">
        <div className="grid grid-cols-5 gap-2.5 pt-1">
          {chapters.map(c => {
            const active = c === currentChapter;
            return (
              <button key={c}
                onClick={() => { navigateTo(currentBook, c); setChapterOpen(false); }}
                className="aspect-square rounded-xl text-sm font-body font-bold border-2 flex items-center justify-center transition-all"
                style={active
                  ? { background:"#fff", color:DARK_BLUE, borderColor:"#fff" }
                  : { background:"transparent", color:"#fff", borderColor:"rgba(255,255,255,0.3)" }}>
                {c}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* ══ VERSE JUMP SHEET ══ */}
      <BottomSheet open={verseOpen} onClose={() => setVerseOpen(false)} title={`${bookObj?.short ?? currentBook} ${currentChapter} — Verses`}>
        <div className="grid grid-cols-5 gap-2.5 pt-1">
          {currentVerses.map(({ verse: v }) => (
            <button key={v}
              onClick={() => { setVerseOpen(false); setJumpVerse(v); }}
              className="aspect-square rounded-xl text-sm font-body font-bold border-2 flex items-center justify-center transition-all"
              style={{ background:"transparent", color:"#fff", borderColor:"rgba(255,255,255,0.3)" }}>
              {v}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
