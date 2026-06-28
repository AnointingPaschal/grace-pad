import { useState, useCallback, useRef } from "react";
import { PenLine } from "lucide-react";
import BibleReader from "../components/bible/BibleReader";
import NoteEditor from "../components/notes/NoteEditor";
import { useNotes } from "../contexts/NotesContext";

export default function StudyPage() {
  const { createNote } = useNotes();
  const [studyNoteId,  setStudyNoteId]  = useState(null);
  const [pendingVerse, setPendingVerse] = useState(null);

  // Resizable split — top panel height as percent
  const [splitPct, setSplitPct] = useState(48);
  const containerRef = useRef(null);
  const dragging     = useRef(false);

  const startDrag = (e) => {
    dragging.current = true;
    const onMove = (ev) => {
      if (!dragging.current || !containerRef.current) return;
      const clientY  = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const rect     = containerRef.current.getBoundingClientRect();
      const pct      = Math.min(80, Math.max(20, ((clientY - rect.top) / rect.height) * 100));
      setSplitPct(pct);
    };
    const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
  };

  const startStudy = async () => {
    const id = await createNote({
      title: "Study — " + new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
      category: "study",
    });
    setStudyNoteId(id);
  };

  const handleVerseSelect = useCallback((book, chapter, verse, text, abbr) => {
    setPendingVerse({ book, chapter, verse, text, abbr });
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100dvh - 52px - 64px)" }}
    >
      {/* ── TOP: BIBLE ── */}
      <div style={{ height: `${splitPct}%` }} className="overflow-hidden flex flex-col">
        <BibleReader
          compact
          onInsertToNote={studyNoteId ? handleVerseSelect : undefined}
        />
      </div>

      {/* ── DRAG HANDLE ── */}
      <div
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        className="shrink-0 flex items-center justify-center cursor-row-resize select-none z-10"
        style={{ height: "20px", background: "#F3F4F6", borderTop:"1px solid #E5E7EB", borderBottom:"1px solid #E5E7EB" }}
      >
        <div className="flex gap-1">
          {[0,1,2].map(i => <div key={i} className="w-5 h-0.5 rounded-full bg-gray-300" />)}
        </div>
      </div>

      {/* ── BOTTOM: NOTES ── */}
      <div style={{ height: `${100 - splitPct}%` }} className="overflow-hidden flex flex-col">
        {studyNoteId ? (
          <NoteEditor
            key={studyNoteId}
            studyNoteId={studyNoteId}
            pendingVerse={pendingVerse}
            onVerseClaimed={() => setPendingVerse(null)}
          />
        ) : (
          /* Empty state when no session started */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-parchment">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <PenLine className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="font-display text-base font-semibold mb-1.5" style={{ color:"#2D2418" }}>
              No Study Session
            </h3>
            <p className="font-body text-gray-400 text-sm mb-5 max-w-xs leading-relaxed">
              Read scripture above, then start a session to take notes side by side.
              Tap a verse → <strong>Add to note</strong> to insert it automatically.
            </p>
            <button
              onClick={startStudy}
              className="flex items-center gap-2 text-sm font-body font-semibold px-5 py-3 rounded-2xl text-white shadow-sm"
              style={{ background: "#160A47" }}
            >
              <PenLine className="w-4 h-4" /> Start Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
