import { useState, useEffect, useRef } from "react";
import {
  getCommentaryChapter, getVerseCommentary,
  getCrossReferences, getVerseCrossRefs,
  COMMENTARIES,
} from "../../services/commentaryService";
import { BookOpen, Link2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const MAROON = "#7B1515";

export default function CommentaryPanel({ book, chapter, verse }) {
  const [open,       setOpen]       = useState(false);
  const [activeTab,  setActiveTab]  = useState("tyndale");
  const [commentary, setCommentary] = useState(null);
  const [crossRefs,  setCrossRefs]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  // Abort controller to cancel in-flight requests on unmount
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    load();
    return () => abortRef.current?.abort();
  }, [open, activeTab, book, chapter, verse]);

  const load = async () => {
    setLoading(true);
    setCommentary(null);
    setCrossRefs([]);
    setError(null);

    try {
      const [commentaryData, xrefData] = await Promise.all([
        getCommentaryChapter(activeTab, book, chapter),
        getCrossReferences(book, chapter),
      ]);

      const text = commentaryData
        ? getVerseCommentary(commentaryData, verse)
        : null;

      setCommentary(text);
      setCrossRefs(xrefData ? getVerseCrossRefs(xrefData, verse) : []);
    } catch (e) {
      if (e.name !== "AbortError") setError("Failed to load commentary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-1.5 border-t border-gray-100 pt-1">
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 py-1 text-[11px] font-body font-semibold text-amber-700 hover:text-amber-900 transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        Commentary & Cross-refs
        {open
          ? <ChevronUp className="w-2.5 h-2.5" />
          : <ChevronDown className="w-2.5 h-2.5" />}
      </button>

      {open && (
        <div className="pb-3 pt-1">
          {/* Tabs */}
          <div className="flex gap-1 mb-2.5 flex-wrap">
            {COMMENTARIES.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className="text-[10px] font-body font-bold px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: activeTab === c.id ? MAROON : "#F3F4F6",
                  color:      activeTab === c.id ? "#fff"  : "#6B7280",
                }}
              >
                {c.short}
              </button>
            ))}
            <button
              onClick={() => setActiveTab("xref")}
              className="text-[10px] font-body font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
              style={{
                background: activeTab === "xref" ? "#1D4ED8" : "#F3F4F6",
                color:      activeTab === "xref" ? "#fff"    : "#6B7280",
              }}
            >
              <Link2 className="w-2.5 h-2.5" />
              Cross-refs {crossRefs.length > 0 && `(${crossRefs.length})`}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span className="text-xs text-gray-400 font-body">Loading…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <p className="text-xs text-red-400 font-body italic">{error}</p>
          )}

          {/* Commentary text */}
          {!loading && !error && activeTab !== "xref" && (
            commentary ? (
              <div className="bg-amber-50 rounded-xl p-3 border-l-2 border-amber-400">
                <p className="text-[12px] font-body text-gray-700 leading-relaxed whitespace-pre-line">
                  {commentary}
                </p>
                <p className="text-[9px] font-body text-amber-600 mt-2 font-semibold uppercase tracking-wide">
                  {COMMENTARIES.find(c => c.id === activeTab)?.name}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-body italic">
                No commentary available for this verse.
              </p>
            )
          )}

          {/* Cross-references */}
          {!loading && !error && activeTab === "xref" && (
            crossRefs.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {crossRefs.slice(0, 15).map((ref, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 cursor-default select-all"
                    title={`Score: ${ref.score ?? "?"}`}
                  >
                    {ref.book} {ref.chapter}:{ref.verse}
                    {ref.endVerse && `–${ref.endVerse}`}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-body italic">
                No cross-references found.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
