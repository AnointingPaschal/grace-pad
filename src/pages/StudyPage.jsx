import { useState, useCallback } from "react";
import { PenLine, BookOpen, Columns2, ChevronLeft } from "lucide-react";
import BibleReader from "../components/bible/BibleReader";
import NoteEditor from "../components/notes/NoteEditor";
import { useNotes } from "../contexts/NotesContext";

const LAYOUTS = [
  { id: "split",  label: "Split",  icon: Columns2  },
  { id: "bible",  label: "Bible",  icon: BookOpen  },
  { id: "notes",  label: "Notes",  icon: PenLine   },
];

export default function StudyPage() {
  const { createNote } = useNotes();
  const [studyNoteId, setStudyNoteId] = useState(null);
  const [layout, setLayout]           = useState("bible");
  const [pendingVerse, setPendingVerse] = useState(null);

  const startStudy = async () => {
    const id = await createNote({
      title: "Study — " + new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      category: "study",
    });
    setStudyNoteId(id);
    setLayout("split");
  };

  const handleVerseSelect = useCallback((book, chapter, verse, text, abbr) => {
    setPendingVerse({ book, chapter, verse, text, abbr });
    // Shift to notes view on mobile when verse is selected
    if (layout === "bible") setLayout("notes");
  }, [layout]);

  const handleVerseClaimed = useCallback(() => setPendingVerse(null), []);

  const showBible = layout === "split" || layout === "bible";
  const showNotes = layout === "split" || layout === "notes";

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 52px - 64px)" }}>
      {/* ── STUDY TOOLBAR ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white shrink-0 overflow-x-auto">
        <div className="flex gap-1 rounded-xl border border-gray-200 p-0.5 shrink-0">
          {LAYOUTS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setLayout(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all"
              style={layout === id
                ? { background: "#160A47", color: "#fff" }
                : { color: "#6B7280" }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto shrink-0">
          {!studyNoteId ? (
            <button
              onClick={startStudy}
              className="flex items-center gap-1.5 text-xs font-body font-semibold px-3 py-2 rounded-xl text-white"
              style={{ background: "#160A47" }}
            >
              <PenLine className="w-3.5 h-3.5" /> Start Session
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-body text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Session active
            </span>
          )}
        </div>
      </div>

      {/* Hint banner when no note started */}
      {!studyNoteId && layout !== "notes" && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-xs font-body text-amber-700 text-center">
          Tap a verse → ··· → <strong>Add to note</strong>, or press <strong>Start Session</strong> to write alongside the Bible.
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Bible panel */}
        {showBible && (
          <div className={`${layout === "split" ? "w-1/2 border-r border-gray-100" : "w-full"} overflow-hidden flex flex-col`}>
            <BibleReader
              compact={layout === "split"}
              onInsertToNote={studyNoteId ? handleVerseSelect : undefined}
            />
          </div>
        )}

        {/* Notes panel */}
        {showNotes && (
          <div className={`${layout === "split" ? "w-1/2" : "w-full"} overflow-hidden flex flex-col`}>
            {studyNoteId ? (
              <NoteEditor
                key={studyNoteId}
                studyNoteId={studyNoteId}
                pendingVerse={pendingVerse}
                onVerseClaimed={handleVerseClaimed}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <PenLine className="w-7 h-7 text-gray-300" />
                </div>
                <h3 className="font-display text-lg font-semibold text-scripture mb-2">
                  No Note Yet
                </h3>
                <p className="font-body text-gray-400 text-sm max-w-xs leading-relaxed mb-5">
                  Start a session to take notes while reading Scripture side by side.
                </p>
                <button
                  onClick={startStudy}
                  className="flex items-center gap-2 text-sm font-body font-semibold px-5 py-3 rounded-xl text-white"
                  style={{ background: "#160A47" }}
                >
                  <PenLine className="w-4 h-4" /> Start Study Session
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile: back to Bible button when in notes view */}
      {layout === "notes" && studyNoteId && (
        <div className="bg-white border-t border-gray-100 px-4 py-2 flex shrink-0">
          <button
            onClick={() => setLayout("bible")}
            className="flex items-center gap-1.5 text-xs font-body text-gray-500 hover:text-gray-800"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Bible
          </button>
        </div>
      )}
    </div>
  );
}
