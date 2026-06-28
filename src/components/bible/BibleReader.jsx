import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, X, BookOpen } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { BIBLE_BOOKS, OT_BOOKS, NT_BOOKS } from "../../utils/bibleBooks";
import { searchBible } from "../../utils/bibleParser";
import VerseCard from "./VerseCard";
import clsx from "clsx";

export default function BibleReader({ compact = false, onInsertToNote }) {
  const {
    books, currentBook, currentChapter, currentVerses,
    totalChapters, isLoading, globalTranslation, navigateTo,
    loadedData, manifest, switchAllTranslation,
  } = useBible();

  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [testament, setTestament] = useState("NT");
  const verseListRef = useRef(null);

  // Scroll to top when chapter changes
  useEffect(() => {
    verseListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentBook, currentChapter]);

  const prevChapter = () => {
    if (currentChapter > 1) {
      navigateTo(currentBook, currentChapter - 1);
    } else {
      const idx = books.indexOf(currentBook);
      if (idx > 0) {
        const prev = books[idx - 1];
        const prevObj = BIBLE_BOOKS.find((b) => b.name === prev);
        navigateTo(prev, prevObj?.chapters ?? 1);
      }
    }
  };

  const nextChapter = () => {
    if (currentChapter < totalChapters) {
      navigateTo(currentBook, currentChapter + 1);
    } else {
      const idx = books.indexOf(currentBook);
      if (idx < books.length - 1) navigateTo(books[idx + 1], 1);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const data = loadedData[globalTranslation];
    if (!data) return;
    setSearchResults(searchBible(data, searchQuery, 100));
  };

  const currentBookObj = BIBLE_BOOKS.find((b) => b.name === currentBook);
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1);

  return (
    <div className={`flex flex-col h-full bg-white ${compact ? "" : ""}`}>
      {/* ── NAVIGATION BAR ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        {/* Book + Chapter row */}
        <div className="flex items-center gap-2 px-4 py-2.5">
          {/* Book selector */}
          <button
            onClick={() => setShowBookPicker((p) => !p)}
            className="flex items-center gap-1.5 font-display font-semibold text-scripture text-lg"
            style={{ color: "#1A0A2E" }}
          >
            <BookOpen className="w-4 h-4" style={{ color: "#7B1515" }} />
            {currentBook}
          </button>

          <div className="flex items-center gap-1 ml-auto">
            {/* Chapter nav */}
            <button onClick={prevChapter} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>

            {/* Chapter dropdown */}
            <div className="relative">
              <select
                value={currentChapter}
                onChange={(e) => navigateTo(currentBook, parseInt(e.target.value))}
                className="appearance-none font-body font-medium text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white pr-6 cursor-pointer outline-none"
                style={{ color: "#7B1515" }}
              >
                {chapters.map((c) => (
                  <option key={c} value={c}>Ch. {c}</option>
                ))}
              </select>
              <ChevronLeft className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none" />
            </div>

            <button onClick={nextChapter} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            {/* Search toggle */}
            <button
              onClick={() => { setShowSearch((p) => !p); setSearchResults([]); setSearchQuery(""); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-1"
            >
              <Search className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="px-4 pb-2.5">
            <div className="flex gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search scripture…"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-body outline-none focus:border-red-900/50"
              />
              <button
                onClick={handleSearch}
                className="px-3 py-2 rounded-xl text-sm font-body font-medium text-white"
                style={{ background: "#7B1515" }}
              >
                Search
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                {searchResults.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { navigateTo(r.book, r.chapter); setShowSearch(false); }}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                  >
                    <span className="text-xs font-body font-semibold" style={{ color: "#7B1515" }}>
                      {r.book} {r.chapter}:{r.verse}
                    </span>
                    <p className="font-scripture text-gray-600 text-sm mt-0.5 line-clamp-2">{r.text}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Translation tabs */}
        {manifest.length > 1 && (
          <div className="flex gap-3 px-4 pb-2 overflow-x-auto">
            {manifest.map((t) => (
              <button
                key={t.abbr}
                onClick={() => switchAllTranslation(t.abbr)}
                className="text-xs font-body font-semibold shrink-0 pb-0.5 border-b-2 transition-colors"
                style={{
                  color: t.abbr === globalTranslation ? "#7B1515" : "#9CA3AF",
                  borderColor: t.abbr === globalTranslation ? "#7B1515" : "transparent",
                }}
              >
                {t.abbr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── BOOK PICKER ── */}
      {showBookPicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-display text-lg font-semibold text-scripture">Select Book</h2>
            <button onClick={() => setShowBookPicker(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* OT / NT tabs */}
          <div className="flex gap-0 border-b border-gray-100">
            {["OT", "NT"].map((t) => (
              <button
                key={t}
                onClick={() => setTestament(t)}
                className="flex-1 py-3 text-sm font-body font-semibold transition-colors border-b-2"
                style={{
                  color: testament === t ? "#7B1515" : "#9CA3AF",
                  borderColor: testament === t ? "#7B1515" : "transparent",
                }}
              >
                {t === "OT" ? "Old Testament" : "New Testament"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-0">
              {(testament === "OT" ? OT_BOOKS : NT_BOOKS).map((b) => (
                <button
                  key={b.code}
                  onClick={() => { navigateTo(b.name, 1); setShowBookPicker(false); }}
                  className={clsx(
                    "text-left px-4 py-3 border-b border-r border-gray-50 font-body text-sm transition-colors",
                    currentBook === b.name ? "font-semibold" : "text-gray-700 hover:bg-gray-50"
                  )}
                  style={{ color: currentBook === b.name ? "#7B1515" : undefined }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── VERSE LIST ── */}
      <div ref={verseListRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-gray-100 animate-spin"
              style={{ borderTopColor: "#7B1515" }} />
            <p className="font-body text-sm text-gray-400">Loading {globalTranslation}…</p>
          </div>
        ) : currentVerses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <BookOpen className="w-10 h-10 text-gray-200 mb-3" />
            <p className="font-body text-gray-400 text-sm">No verses found.</p>
          </div>
        ) : (
          <div>
            {currentVerses.map((v) => (
              <VerseCard
                key={v.verse}
                book={currentBook}
                chapter={currentChapter}
                verse={v.verse}
                text={v.text}
                onInsertToNote={onInsertToNote}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── CHAPTER FOOTER ── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
        <button
          onClick={prevChapter}
          className="flex items-center gap-1.5 text-sm font-body transition-colors"
          style={{ color: "#7B1515" }}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-xs font-body text-gray-400">
          {currentBookObj?.short ?? currentBook} {currentChapter} / {totalChapters}
        </span>
        <button
          onClick={nextChapter}
          className="flex items-center gap-1.5 text-sm font-body transition-colors"
          style={{ color: "#7B1515" }}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
