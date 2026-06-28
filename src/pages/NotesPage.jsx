import { useParams, useNavigate } from "react-router-dom";
import { Plus, Search, Pin, Clock, Tag } from "lucide-react";
import { useState } from "react";
import { useNotes, NOTE_CATEGORIES, NOTE_COLORS } from "../contexts/NotesContext";
import NoteEditor from "../components/notes/NoteEditor";
import clsx from "clsx";

function NoteCard({ note, onOpen }) {
  const color = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0];
  const cat   = NOTE_CATEGORIES.find((c) => c.id === note.category);
  const preview = typeof note.content === "string"
    ? note.content.replace(/<[^>]*>/g, "").slice(0, 120)
    : "";

  return (
    <div
      onClick={() => onOpen(note.id)}
      className="rounded-2xl border p-4 cursor-pointer active:scale-98 transition-all"
      style={{ background: color.bg, borderColor: color.border }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display font-semibold text-sm text-scripture line-clamp-2 flex-1">
          {note.title || "Untitled"}
        </h3>
        {note.isPinned && <Pin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" fill="#C8971B" />}
      </div>
      {preview && (
        <p className="font-body text-xs text-gray-500 line-clamp-3 mb-3 leading-relaxed">{preview}</p>
      )}
      <div className="flex items-center justify-between">
        {cat && (
          <span className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full"
            style={{ color: cat.color, background: cat.bg }}>
            {cat.label}
          </span>
        )}
        <span className="text-[10px] font-body text-gray-400 ml-auto">
          {note.updatedAt?.toDate?.()
            ? new Date(note.updatedAt.toDate()).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : ""}
        </span>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, loading, createNote } = useNotes();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const handleNew = async () => {
    const newId = await createNote({ title: "New Note" });
    navigate(`/notes/${newId}`);
  };

  // If there's an :id param, show editor
  if (id) return <NoteEditor />;

  const pinned   = notes.filter((n) => n.isPinned);
  const unpinned = notes.filter((n) => !n.isPinned);

  const filtered = (list) =>
    list.filter((n) => {
      const matchCat  = filterCat === "all" || n.category === filterCat;
      const matchText = !search || (n.title + " " + (typeof n.content === "string" ? n.content.replace(/<[^>]*>/g,"") : ""))
        .toLowerCase().includes(search.toLowerCase());
      return matchCat && matchText;
    });

  return (
    <div className="min-h-full bg-parchment">
      {/* Search + Filter bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="flex-1 bg-transparent text-sm font-body outline-none placeholder-gray-400 text-gray-700" />
          </div>
          <button onClick={handleNew}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: "#7B1515" }}>
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setFilterCat("all")}
            className={clsx("shrink-0 text-xs font-body font-semibold px-3 py-1.5 rounded-full transition-all",
              filterCat === "all" ? "text-white" : "text-gray-500 bg-gray-100")}
            style={filterCat === "all" ? { background: "#7B1515" } : {}}>
            All
          </button>
          {NOTE_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)}
              className={clsx("shrink-0 text-xs font-body font-semibold px-3 py-1.5 rounded-full transition-all",
                filterCat === cat.id ? "font-semibold" : "opacity-60")}
              style={filterCat === cat.id
                ? { color: cat.color, background: cat.bg, opacity: 1 }
                : { color: cat.color, background: cat.bg }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-gray-100 animate-spin"
              style={{ borderTopColor: "#7B1515" }} />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <PenLine className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-display text-lg font-semibold text-scripture mb-2">No notes yet</h3>
            <p className="font-body text-gray-400 text-sm mb-5">Start your first gospel note</p>
            <button onClick={handleNew}
              className="flex items-center gap-2 text-sm font-body font-semibold px-5 py-3 rounded-xl text-white"
              style={{ background: "#7B1515" }}>
              <Plus className="w-4 h-4" /> New Note
            </button>
          </div>
        ) : (
          <>
            {/* Pinned */}
            {filtered(pinned).length > 0 && (
              <div>
                <p className="text-[10px] font-body font-semibold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                  <Pin className="w-3 h-3" /> Pinned
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {filtered(pinned).map((n) => <NoteCard key={n.id} note={n} onOpen={(id) => navigate(`/notes/${id}`)} />)}
                </div>
              </div>
            )}

            {/* All notes */}
            {filtered(unpinned).length > 0 && (
              <div>
                {filtered(pinned).length > 0 && (
                  <p className="text-[10px] font-body font-semibold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Recent
                  </p>
                )}
                <div className="grid grid-cols-1 gap-3">
                  {filtered(unpinned).map((n) => <NoteCard key={n.id} note={n} onOpen={(id) => navigate(`/notes/${id}`)} />)}
                </div>
              </div>
            )}

            {filtered([...pinned, ...unpinned]).length === 0 && (
              <p className="text-center font-body text-sm text-gray-400 py-12">No notes match your filter.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PenLine(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
    </svg>
  );
}
