import { useState, useRef, useEffect } from "react";
import { Search, X, BookOpen, ListOrdered, List, PenLine, ArrowLeft, Compass } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS, BIBLE_BOOKS } from "../../utils/bibleBooks";
import { searchBible } from "../../utils/bibleParser";
import VerseCard from "./VerseCard";
import BottomSheet from "../ui/BottomSheet";

export default function BibleReader({ compact = false, onInsertToNote }) {
  const {
    books, currentBook, currentChapter, currentVerses,
    totalChapters, isLoading, globalTranslation,
    navigateTo, loadedData, manifest, switchAllTranslation,
  } = useBible();

  const [showBookSheet,    setShowBookSheet]    = useState(false);
  const [showChapterSheet, setShowChapterSheet] = useState(false);
  const [showVerseSheet,   setShowVerseSheet]   = useState(false);
  const [showSearch,       setShowSearch]       = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [searchResults,    setSearchResults]    = useState([]);
  const [testament,        setTestament]        = useState("NT");
  const [jumpVerse,        setJumpVerse]        = useState(null);
  const verseListRef = useRef(null);

  // Scroll to verse when jumping
  useEffect(() => {
    verseListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentBook, currentChapter]);

  useEffect(() => {
    if (jumpVerse !== null) {
      const el = document.getElementById(`verse-${jumpVerse}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setJumpVerse(null);
    }
  }, [jumpVerse, currentVerses]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const data = loadedData[globalTranslation];
    if (!data) return;
    setSearchResults(searchBible(data, searchQuery, 100));
  };

  const currentBookObj = BIBLE_BOOKS.find((b) => b.name === currentBook);
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);
  const shortRef  = `${currentBookObj?.short ?? currentBook}.${currentChapter}`;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── BIBLE HEADER (dark maroon) ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 shrink-0"
        style={{ background: "#7B1515" }}
      >
        {/* Book name tap → book picker */}
        <button
          onClick={() => setShowBookSheet(true)}
          className="flex items-center gap-1.5 flex-1 min-w-0"
        >
          <BookOpen className="w-4 h-4 text-white/70 shrink-0" />
          <span className="font-display font-semibold text-white text-base truncate">
            {shortRef}
          </span>
        </button>

        {/* Search */}
        <button
          onClick={() => setShowSearch((p) => !p)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10"
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-2.5 bg-white border-b border-gray-100">
          <div className="flex gap-2">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search scripture…"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-body outline-none focus:border-red-900/40"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-xl text-sm font-body font-medium text-white shrink-0"
              style={{ background: "#7B1515" }}
            >
              Go
            </button>
            <button onClick={() => { setShowSearch(false); setSearchResults([]); }}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    navigateTo(r.book, r.chapter);
                    setJumpVerse(r.verse);
                    setShowSearch(false);
                    setSearchResults([]);
                  }}
                  className="w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <span
                    className="text-xs font-body font-bold"
                    style={{ color: "#7B1515" }}
                  >
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
      <div ref={verseListRef} className="flex-1 overflow-y-auto pb-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-100 animate-spin"
              style={{ borderTopColor: "#7B1515" }}
            />
            <p className="font-body text-sm text-gray-400">
              Loading {globalTranslation}…
            </p>
          </div>
        ) : currentVerses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <BookOpen className="w-10 h-10 text-gray-200 mb-3" />
            <p className="font-body text-gray-400 text-sm">No verses found.</p>
          </div>
        ) : (
          currentVerses.map((v) => (
            <div id={`verse-${v.verse}`} key={v.verse}>
              <VerseCard
                book={currentBook}
                chapter={currentChapter}
                verse={v.verse}
                text={v.text}
                onInsertToNote={onInsertToNote}
              />
            </div>
          ))
        )}
      </div>

      {/* ── BIBLE BOTTOM BAR ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-t border-gray-100 bg-white"
      >
        {[
          { label: "Chapters", icon: ListOrdered, action: () => setShowChapterSheet(true) },
          { label: "Verses",   icon: List,        action: () => setShowVerseSheet(true)   },
        ].map(({ label, icon: Icon, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 font-body text-xs font-semibold text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}

        {/* Testament quick jumps */}
        <div className="flex gap-1.5 ml-auto">
          {["OT", "NT"].map((t) => (
            <button
              key={t}
              onClick={() => {
                const list = t === "OT" ? OT_BOOKS : NT_BOOKS;
                navigateTo(list[0].name, 1);
              }}
              className="w-9 h-9 rounded-full text-[11px] font-body font-bold text-white flex items-center justify-center"
              style={{ background: t === "OT" ? "#1D4ED8" : "#7C3AED" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ══ BOOK PICKER SHEET ══ */}
      <BottomSheet open={showBookSheet} onClose={() => setShowBookSheet(false)} title="Select Book" maxHeight="85vh">
        {/* OT / NT tabs */}
        <div className="flex rounded-xl overflow-hidden mb-4 border border-white/20">
          {["OT", "NT"].map((t) => (
            <button
              key={t}
              onClick={() => setTestament(t)}
              className="flex-1 py-2.5 text-sm font-body font-semibold transition-colors"
              style={testament === t
                ? { background: "rgba(255,255,255,0.2)", color: "#fff" }
                : { color: "rgba(255,255,255,0.5)" }}
            >
              {t === "OT" ? "Old Testament" : "New Testament"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(testament === "OT" ? OT_BOOKS : NT_BOOKS).map((b) => {
            const isActive = b.name === currentBook;
            return (
              <button
                key={b.code}
                onClick={() => { navigateTo(b.name, 1); setShowBookSheet(false); }}
                className="text-left px-3 py-2.5 rounded-xl text-sm font-body transition-colors"
                style={isActive
                  ? { background: "rgba(255,255,255,0.25)", color: "#fff", fontWeight: 700 }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* ══ CHAPTER PICKER SHEET ══ */}
      <BottomSheet open={showChapterSheet} onClose={() => setShowChapterSheet(false)} title="Chapters">
        <div className="grid grid-cols-5 gap-2.5 pt-1">
          {chapters.map((c) => {
            const isActive = c === currentChapter;
            return (
              <button
                key={c}
                onClick={() => { navigateTo(currentBook, c); setShowChapterSheet(false); }}
                className="aspect-square rounded-xl font-body text-sm font-bold flex items-center justify-center border-2 transition-all"
                style={isActive
                  ? { background: "#fff", color: "#7B1515", borderColor: "#fff" }
                  : { background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* ══ VERSE JUMP SHEET ══ */}
      <BottomSheet open={showVerseSheet} onClose={() => setShowVerseSheet(false)} title={`${currentBook} ${currentChapter} — Verses`}>
        <div className="grid grid-cols-5 gap-2.5 pt-1">
          {currentVerses.map(({ verse }) => (
            <button
              key={verse}
              onClick={() => {
                setShowVerseSheet(false);
                setTimeout(() => {
                  document.getElementById(`verse-${verse}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }}
              className="aspect-square rounded-xl font-body text-sm font-bold flex items-center justify-center border-2 transition-all"
              style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}
            >
              {verse}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
