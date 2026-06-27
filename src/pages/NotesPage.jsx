import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Pin } from "lucide-react";
import { useNotes, NOTE_CATEGORIES } from "../contexts/NotesContext";
import NoteCard from "../components/notes/NoteCard";
import NoteEditor from "../components/notes/NoteEditor";
import { useParams } from "react-router-dom";
import clsx from "clsx";

function getPlainText(content) {
  if (!content?.content) return "";
  const extract = (nodes) =>
    nodes?.flatMap((n) => (n.text ? [n.text] : extract(n.content ?? []))).join(" ") ?? "";
  return extract(content.content);
}

export default function NotesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, loading, deleteNote, pinNote, createNote } = useNotes();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPin, setFilterPin] = useState(false);

  const handleNewNote = async () => {
    const newId = await createNote();
    navigate(`/notes/${newId}`);
  };

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      const text = getPlainText(note.content);
      const matchesSearch = !search
        || (note.title ?? "").toLowerCase().includes(search.toLowerCase())
        || text.toLowerCase().includes(search.toLowerCase())
        || (note.tags ?? []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = filterCategory === "all" || note.category === filterCategory;
      const matchesPin = !filterPin || note.isPinned;
      return matchesSearch && matchesCat && matchesPin;
    });
  }, [notes, search, filterCategory, filterPin]);

  // If editing a note
  if (id) {
    return (
      <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
        <NoteEditor />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-scripture">My Notes</h1>
          <p className="font-body text-gray-400 text-sm mt-0.5">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={handleNewNote}
          className="flex items-center gap-2 bg-royal hover:bg-royal-light text-white text-sm font-body font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, tags…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-parchment-dark rounded-xl font-body text-sm outline-none focus:border-royal transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterPin((p) => !p)}
            className={clsx("flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all border",
              filterPin ? "bg-gold/15 text-gold border-gold/30" : "bg-white text-gray-500 border-parchment-dark hover:border-gold/20"
            )}
          >
            <Pin className="w-3.5 h-3.5" />
            Pinned
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory("all")}
          className={clsx("px-3 py-1.5 rounded-xl text-sm font-body font-medium transition-all",
            filterCategory === "all" ? "bg-royal text-white" : "bg-white text-gray-500 border border-parchment-dark hover:border-royal/20"
          )}
        >
          All
        </button>
        {NOTE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={clsx("px-3 py-1.5 rounded-xl text-sm font-body font-medium transition-all border",
              filterCategory === cat.id ? "font-semibold" : "bg-white border-parchment-dark text-gray-500 hover:border-current/20"
            )}
            style={filterCategory === cat.id ? { color: cat.color, background: cat.bg, borderColor: cat.color + "40" } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white border border-parchment-dark animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-parchment-dark">
          {search || filterCategory !== "all" ? (
            <>
              <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="font-body text-gray-500 font-medium">No matching notes</p>
              <p className="font-body text-gray-400 text-sm">Try adjusting your search or filters</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-royal/5 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                  <path d="M12 2L12 22M7 7L17 7M7 17L17 17" stroke="#3B1D8C" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4"/>
                </svg>
              </div>
              <p className="font-body text-gray-500 font-medium">Your journal awaits</p>
              <p className="font-body text-gray-400 text-sm mb-4">Write your first gospel note</p>
              <button onClick={handleNewNote}
                className="inline-flex items-center gap-2 bg-royal text-white text-sm font-body font-medium px-4 py-2 rounded-lg hover:bg-royal-light transition-colors">
                <Plus className="w-4 h-4" />
                Create note
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={deleteNote} onPin={pinNote} />
          ))}
        </div>
      )}
    </div>
  );
}
