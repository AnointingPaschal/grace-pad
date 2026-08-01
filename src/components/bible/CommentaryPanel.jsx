import { useState, useEffect } from "react";
import {
  getCommentaryChapter, getVerseCommentary, getChapterIntro,
  getCrossReferences, getVerseCrossRefs,
  COMMENTARIES,
} from "../../services/commentaryService";
import { BookOpen, Link2, ChevronDown, ChevronUp, Loader2, Info } from "lucide-react";

const MAROON = "#7B1515";

export default function CommentaryPanel({ book, chapter, verse }) {
  const [open,        setOpen]        = useState(false);
  const [activeTab,   setActiveTab]   = useState("tyndale");
  const [commentary,  setCommentary]  = useState(null);
  const [chapterNote, setChapterNote] = useState(null);
  const [crossRefs,   setCrossRefs]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [triedBoth,   setTriedBoth]   = useState(false);

  useEffect(() => {
    if (!open) return;
    setTriedBoth(false);
    load(activeTab);
  }, [open, activeTab, book, chapter, verse]);

  const load = async (tabId) => {
    setLoading(true);
    setCommentary(null);
    setChapterNote(null);

    const [commentaryData, xrefData] = await Promise.all([
      getCommentaryChapter(tabId, book, chapter),
      crossRefs.length === 0 ? getCrossReferences(book, chapter) : Promise.resolve(null),
    ]);

    if (commentaryData) {
      setCommentary(getVerseCommentary(commentaryData, verse));
      setChapterNote(getChapterIntro(commentaryData));
    }

    if (xrefData) {
      setCrossRefs(getVerseCrossRefs(xrefData, verse));
    }

    setLoading(false);
  };

  // Auto-switch to Clarke if Tyndale has nothing
  useEffect(() => {
    if (!loading && !commentary && activeTab === "tyndale" && !triedBoth) {
      setTriedBoth(true);
      // Don't auto-switch — let user choose, but show hint
    }
  }, [loading, commentary, activeTab, triedBoth]);

  return (
    <div className="mt-1.5 border-t border-gray-100 pt-1">
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 py-1 text-[11px] font-body font-semibold transition-colors"
        style={{ color: MAROON }}
      >
        <BookOpen className="w-3 h-3" />
        Commentary & Cross-refs
        {crossRefs.length > 0 && !open && (
          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
            {crossRefs.length} refs
          </span>
        )}
        {open ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
      </button>

      {open && (
        <div className="pb-3 pt-1.5">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {COMMENTARIES.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className="text-[11px] font-body font-bold px-3 py-1.5 rounded-lg transition-all"
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
              className="text-[11px] font-body font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
              style={{
                background: activeTab === "xref" ? "#1D4ED8" : "#F3F4F6",
                color:      activeTab === "xref" ? "#fff"    : "#6B7280",
              }}
            >
              <Link2 className="w-3 h-3" />
              Cross-refs {crossRefs.length > 0 && `(${crossRefs.length})`}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span className="text-xs text-gray-400 font-body">Loading commentary…</span>
            </div>
          )}

          {/* Commentary text */}
          {!loading && activeTab !== "xref" && (
            commentary ? (
              <div>
                {/* Chapter intro note */}
                {chapterNote && (
                  <div className="flex gap-2 bg-blue-50 rounded-lg p-2.5 mb-3 border border-blue-100">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-body text-blue-700 leading-relaxed line-clamp-3">
                      {chapterNote}
                    </p>
                  </div>
                )}
                {/* Verse commentary */}
                <div className="bg-amber-50 rounded-xl p-3.5 border-l-4 border-amber-400">
                  <p className="text-[12.5px] font-body text-gray-800 leading-[1.75] whitespace-pre-line">
                    {commentary}
                  </p>
                  <p className="text-[9px] font-body text-amber-700 mt-2.5 font-bold uppercase tracking-wider">
                    {COMMENTARIES.find(c => c.id === activeTab)?.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-body italic">
                  No commentary for this verse in {COMMENTARIES.find(c => c.id === activeTab)?.short}.
                </p>
                {/* Suggest switching */}
                {activeTab === "tyndale" && (
                  <button
                    onClick={() => setActiveTab("adam-clarke")}
                    className="text-[11px] font-body font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2"
                  >
                    Try Adam Clarke Commentary →
                  </button>
                )}
                {/* Chapter intro even if no verse commentary */}
                {chapterNote && (
                  <div className="flex gap-2 bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wide mb-1">Chapter Introduction</p>
                      <p className="text-[11px] font-body text-blue-700 leading-relaxed">
                        {chapterNote.slice(0, 300)}{chapterNote.length > 300 ? "…" : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Cross-references */}
          {!loading && activeTab === "xref" && (
            crossRefs.length > 0 ? (
              <div>
                <p className="text-[10px] font-body text-gray-400 mb-2">
                  {crossRefs.length} related passages, sorted by relevance
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {crossRefs.map((ref, i) => (
                    <span
                      key={i}
                      title={`Relevance score: ${ref.score ?? "?"}`}
                      className="text-[11px] font-body font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 cursor-default"
                    >
                      {ref.book} {ref.chapter}:{ref.verse}
                      {ref.endVerse ? `–${ref.endVerse}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-body italic">
                No cross-references found for this verse.
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}
