import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, BookOpen, Columns } from "lucide-react";
import BibleViewer from "../components/bible/BibleViewer";
import NoteEditor from "../components/notes/NoteEditor";
import { useNotes } from "../contexts/NotesContext";

export default function StudyPage() {
  const { createNote, notes } = useNotes();
  const navigate = useNavigate();
  const [studyNoteId, setStudyNoteId] = useState(null);
  const [layout, setLayout] = useState("split"); // split | bible | notes
  const [pendingVerse, setPendingVerse] = useState(null);

  const startStudy = async () => {
    const id = await createNote({
      title: "Study Notes – " + new Date().toLocaleDateString(),
      category: "study",
    });
    setStudyNoteId(id);
  };

  const handleVerseSelect = useCallback((book, chapter, verse, text, abbr) => {
    setPendingVerse({ book, chapter, verse, text, abbr });
  }, []);

  const studyNote = notes.find((n) => n.id === studyNoteId);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Study toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-parchment-dark bg-white flex-wrap gap-y-2">
        <span className="text-xs font-body text-gray-400 uppercase tracking-wider">Layout:</span>
        {[
          { id: "split", icon: Columns, label: "Split View" },
          { id: "bible", icon: BookOpen, label: "Bible Only" },
          { id: "notes", icon: PenLine, label: "Notes Only" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setLayout(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-all ${
              layout === id ? "bg-royal text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}

        <div className="ml-auto">
          {!studyNoteId ? (
            <button
              onClick={startStudy}
              className="flex items-center gap-2 bg-royal text-white text-sm font-body font-medium px-4 py-2 rounded-lg hover:bg-royal-light transition-colors"
            >
              <PenLine className="w-4 h-4" />
              Start Study Session
            </button>
          ) : (
            <span className="text-xs font-body text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              ● Study session active
            </span>
          )}
        </div>
      </div>

      {/* Main study area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Bible panel */}
        {(layout === "split" || layout === "bible") && (
          <div
            className={`${
              layout === "split" ? "w-1/2 border-r border-parchment-dark" : "w-full"
            } overflow-hidden`}
          >
            <BibleViewer
              compact={layout === "split"}
              onVerseSelect={studyNoteId ? handleVerseSelect : undefined}
            />
          </div>
        )}

        {/* Notes panel */}
        {(layout === "split" || layout === "notes") && (
          <div
            className={`${
              layout === "split" ? "w-1/2" : "w-full"
            } overflow-hidden flex flex-col`}
          >
            {studyNoteId ? (
              /* Render NoteEditor directly for the study note */
              <NoteEditor
                key={studyNoteId}
                studyNoteId={studyNoteId}
                pendingVerse={pendingVerse}
                onVerseClaimed={() => setPendingVerse(null)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-parchment/50">
                <div className="w-16 h-16 rounded-2xl bg-royal/8 flex items-center justify-center mb-4">
                  <PenLine className="w-8 h-8 text-royal/40" />
                </div>
                <h3 className="font-display text-xl font-semibold text-scripture mb-2">
                  Study Room
                </h3>
                <p className="font-body text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
                  Read the Bible on the left and take notes on the right. Click
                  verses to insert them directly into your notes.
                </p>
                <button
                  onClick={startStudy}
                  className="flex items-center gap-2 bg-royal text-white text-sm font-body font-medium px-5 py-2.5 rounded-xl hover:bg-royal-light transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  Begin Study Session
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
