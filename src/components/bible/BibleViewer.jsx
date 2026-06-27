import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Copy, PenLine, Search, X, BookOpen } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { BIBLE_BOOKS, OT_BOOKS, NT_BOOKS, range } from "../../utils/bibleBooks";
import { searchBible } from "../../utils/bibleParser";
import { useNotes } from "../../contexts/NotesContext";
import clsx from "clsx";
import toast from "react-hot-toast";

const HIGHLIGHT_COLORS = [
  { id: "yellow", bg: "#FFF3CC" },
  { id: "green",  bg: "#D4F5E2" },
  { id: "blue",   bg: "#D4E8F5" },
  { id: "pink",   bg: "#F5D4E8" },
  { id: "purple", bg: "#E5D4F5" },
];

export default function BibleViewer({ compact = false, onVerseSelect }) {
  const {
    bibleData, loadingBible,
    currentBook, currentChapter, currentBookData,
    verses, navigateTo,
    activeTranslation, translations, activeTranslationId, setActiveTranslationId,
    setCurrentBook, setCurrentChapter,
  } = useBible();

  const { createNote } = useNotes();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [highlights, setHighlights] = useState({}); // { "GEN:1:1": "#FFF3CC" }
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [testament, setTestament] = useState("NT");

  const totalChapters = currentBookData?.chapters ?? 1;

  const prevChapter = useCallback(() => {
    if (currentChapter > 1) {
      navigateTo(currentBook, currentChapter - 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex((b) => b.code === currentBook);
      if (idx > 0) {
        const prev = BIBLE_BOOKS[idx - 1];
        navigateTo(prev.code, prev.chapters);
      }
    }
  }, [currentBook, currentChapter, navigateTo]);

  const nextChapter = useCallback(() => {
    if (currentChapter < totalChapters) {
      navigateTo(currentBook, currentChapter + 1);
    } else {
      const idx = BIBLE_BOOKS.findIndex((b) => b.code === currentBook);
      if (idx < BIBLE_BOOKS.length - 1) {
        navigateTo(BIBLE_BOOKS[idx + 1].code, 1);
      }
    }
  }, [currentBook, currentChapter, totalChapters, navigateTo]);

  const copyVerse = (v) => {
    const ref = `${currentBookData?.short ?? currentBook} ${currentChapter}:${v.verse} (${activeTranslation?.abbr ?? ""})`;
    navigator.clipboard.writeText(`${v.text} — ${ref}`);
    toast.success("Verse copied!");
  };

  const handleSearch = () => {
    if (!searchQuery.trim() || !bibleData) return;
    setSearching(true);
    setTimeout(() => {
      setSearchResults(searchBible(bibleData, searchQuery));
      setSearching(false);
    }, 50);
  };

  const toggleHighlight = (key, color) => {
    setHighlights((prev) => {
      if (prev[key] === color) {
        const next = { ...prev }; delete next[key]; return next;
      }
      return { ...prev, [key]: color };
    });
  };

  const handleVerseClick = (v) => {
    if (compact && onVerseSelect) {
      onVerseSelect(currentBookData?.short ?? currentBook, currentChapter, v.verse, v.text, activeTranslation?.abbr ?? "");
      return;
    }
    setSelectedVerse(selectedVerse?.verse === v.verse ? null : v);
  };

  return (
    <div className={clsx("flex flex-col h-full bg-white", compact && "rounded-xl border border-parchment-dark overflow-hidden")}>
      {/* Navigation bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 flex-wrap gap-y-2">
        {/* Book selector */}
        <button
          onClick={() => setShowBookPicker((p) => !p)}
          className="flex items-center gap-2 font-display font-semibold text-scripture hover:text-royal transition-colors text-lg"
        >
          <BookOpen className="w-5 h-5 text-royal" />
          {currentBookData?.name ?? currentBook}
        </button>

        <span className="text-gray-300 mx-1">·</span>

        {/* Chapter selector */}
        <div className="flex items-center gap-1">
          <button onClick={prevChapter} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-royal transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <select
            value={currentChapter}
            onChange={(e) => navigateTo(currentBook, +e.target.value)}
            className="font-body text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-2 py-1 outline-none bg-white"
          >
            {range(totalChapters).map((c) => (
              <option key={c} value={c}>Ch. {c}</option>
            ))}
          </select>
          <button onClick={nextChapter} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-royal transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Translation picker */}
          <select
            value={activeTranslationId}
            onChange={(e) => setActiveTranslationId(e.target.value)}
            className="text-xs font-body border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none bg-white font-medium"
          >
            {translations.map((t) => (
              <option key={t.id} value={t.id}>{t.abbr}</option>
            ))}
          </select>

          <button
            onClick={() => { setShowSearch((p) => !p); setSearchResults([]); setSearchQuery(""); }}
            className={clsx("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", showSearch ? "bg-royal text-white" : "text-gray-400 hover:text-royal hover:bg-gray-100")}
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Book picker */}
      {showBookPicker && (
        <div className="border-b border-gray-100 bg-parchment px-4 py-3 space-y-2">
          <div className="flex gap-2">
            {["OT", "NT"].map((t) => (
              <button key={t} onClick={() => setTestament(t)}
                className={clsx("px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all", testament === t ? "bg-royal text-white" : "bg-white text-gray-500 border border-gray-200")}>
                {t === "OT" ? "Old Testament" : "New Testament"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-36 overflow-y-auto">
            {(testament === "OT" ? OT_BOOKS : NT_BOOKS).map((b) => (
              <button key={b.code}
                onClick={() => { navigateTo(b.code, 1); setShowBookPicker(false); }}
                className={clsx("text-xs font-body px-2 py-1.5 rounded-lg text-left transition-all truncate",
                  currentBook === b.code ? "bg-royal text-white" : "hover:bg-white text-gray-600 hover:text-royal")}>
                {b.short}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search bar */}
      {showSearch && (
        <div className="border-b border-gray-100 px-4 py-3 space-y-3">
          <div className="flex gap-2">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search the Bible…"
              className="flex-1 font-body text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-royal"
            />
            <button onClick={handleSearch} disabled={searching}
              className="px-4 py-2 bg-royal text-white rounded-lg text-sm font-body font-medium hover:bg-royal-light transition-colors disabled:opacity-50">
              {searching ? "…" : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {searchResults.map((r, i) => {
                const bookName = BIBLE_BOOKS.find((b) => b.code === r.book)?.short ?? r.book;
                return (
                  <button key={i} onClick={() => { navigateTo(r.book, r.chapter); setShowSearch(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-parchment transition-colors group">
                    <span className="text-gold text-xs font-body font-semibold">{bookName} {r.chapter}:{r.verse}</span>
                    <span className="font-scripture text-gray-600 text-sm ml-2 group-hover:text-scripture">
                      {r.text.slice(0, 100)}{r.text.length > 100 ? "…" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Verse display */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-1">
        {loadingBible ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-royal animate-spin mb-3" />
            <p className="font-body text-sm">Loading translation…</p>
          </div>
        ) : verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <BookOpen className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-body text-sm">No verses found for this chapter.</p>
            <p className="font-body text-xs mt-1 text-gray-300">Upload a .tw Bible file from the sidebar.</p>
          </div>
        ) : (
          verses.map((v) => {
            const key = `${currentBook}:${currentChapter}:${v.verse}`;
            const highlight = highlights[key];
            const isSelected = selectedVerse?.verse === v.verse;

            return (
              <div key={v.verse}
                onClick={() => handleVerseClick(v)}
                className={clsx(
                  "group flex gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150",
                  isSelected ? "bg-parchment border border-gold/20" : "hover:bg-parchment/60"
                )}
                style={highlight ? { background: highlight } : {}}
              >
                {/* Verse number */}
                <span className="text-gold font-display font-semibold text-sm w-6 shrink-0 pt-1 select-none">
                  {v.verse}
                </span>

                {/* Verse text */}
                <p className="font-scripture text-gray-800 leading-relaxed text-base flex-1">
                  {v.text}
                </p>

                {/* Verse actions */}
                <div className={clsx(
                  "flex items-start gap-1 shrink-0 transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  {/* Highlight buttons */}
                  {HIGHLIGHT_COLORS.map((hc) => (
                    <button key={hc.id}
                      onClick={(e) => { e.stopPropagation(); toggleHighlight(key, hc.bg); }}
                      className="w-4 h-4 rounded-full border border-gray-200 hover:scale-125 transition-transform shrink-0"
                      style={{ background: hc.bg }}
                    />
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); copyVerse(v); }}
                    className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-royal hover:text-white text-gray-500 flex items-center justify-center transition-colors ml-1">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chapter nav footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <button onClick={prevChapter}
          className="flex items-center gap-1.5 text-sm font-body text-gray-500 hover:text-royal transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        <span className="text-xs font-body text-gray-400">
          {currentBookData?.short} {currentChapter} / {totalChapters}
        </span>
        <button onClick={nextChapter}
          className="flex items-center gap-1.5 text-sm font-body text-gray-500 hover:text-royal transition-colors">
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
