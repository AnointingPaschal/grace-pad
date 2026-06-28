import { useParams, useNavigate } from "react-router-dom";
import { Search, Plus, Pin, Clock, StickyNote } from "lucide-react";
import { useState } from "react";
import { useNotes, NOTE_CATEGORIES, NOTE_COLORS } from "../contexts/NotesContext";
import NoteEditor from "../components/notes/NoteEditor";
import clsx from "clsx";

/* ── Single note card ── */
function NoteCard({ note, onOpen }) {
  const color = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0];
  const cat   = NOTE_CATEGORIES.find((c) => c.id === note.category);

  // Strip HTML for preview
  const preview = (() => {
    if (!note.content) return "";
    if (typeof note.content === "string")
      return note.content.replace(/<[^>]*>/g, "").slice(0, 100);
    // TipTap JSON
    const walk = (nodes) =>
      (nodes || []).flatMap((n) =>
        n.type === "text" ? [n.text] : walk(n.content)
      ).join(" ");
    return walk(note.content?.content).slice(0, 100);
  })();

  const dateStr = note.updatedAt?.toDate?.()
    ? new Date(note.updatedAt.toDate()).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <button
      onClick={() => onOpen(note.id)}
      className="flex flex-col text-left rounded-2xl border p-3.5 h-full min-h-[130px] active:scale-[0.97] transition-transform"
      style={{ background: color.bg, borderColor: color.border }}
    >
      {/* Pin badge */}
      {note.isPinned && (
        <Pin className="w-3 h-3 self-end mb-1 shrink-0" style={{ color: "#C8971B" }} fill="#C8971B" />
      )}

      {/* Title */}
      <p className="font-display font-semibold text-sm leading-snug line-clamp-2 flex-shrink-0"
        style={{ color: "#2D2418" }}>
        {note.title || "Untitled"}
      </p>

      {/* Preview */}
      {preview && (
        <p className="font-body text-xs text-gray-500 mt-1.5 line-clamp-3 leading-relaxed flex-1">
          {preview}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2">
        {cat ? (
          <span
            className="text-[9px] font-body font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ color: cat.color, background: cat.bg }}
          >
            {cat.label}
          </span>
        ) : <span />}
        <span className="text-[9px] font-body text-gray-400">{dateStr}</span>
      </div>
    </button>
  );
}

/* ── Notes grid ── */
function NotesGrid({ notes, onOpen }) {
  if (notes.length === 0) return null;
  return (
    /* 2 cols on mobile, 3 on md, 4 on lg, 5 on xl */
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onOpen={onOpen} />
      ))}
    </div>
  );
}

/* ── Main page ── */
export default function NotesPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { notes, loading, createNote } = useNotes();
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("all");

  const handleNew = async () => {
    const newId = await createNote({ title: "New Note" });
    navigate(`/notes/${newId}`);
  };

  // Show editor when :id param present
  if (id) return <NoteEditor />;

  /* Filter helpers */
  const filterNote = (n) => {
    const matchCat = filterCat === "all" || n.category === filterCat;
    const body =
      typeof n.content === "string"
        ? n.content.replace(/<[^>]*>/g, "")
        : "";
    const matchText =
      !search ||
      (n.title + " " + body).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchText;
  };

  const pinned   = notes.filter((n) => n.isPinned && filterNote(n));
  const unpinned = notes.filter((n) => !n.isPinned && filterNote(n));
  const empty    = pinned.length + unpinned.length === 0;

  return (
    <div className="min-h-full bg-parchment">

      {/* ── SEARCH + FILTER BAR ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="flex-1 bg-transparent text-sm font-body outline-none placeholder-gray-400 text-gray-700"
            />
          </div>
          <button
            onClick={handleNew}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ background: "#160A47" }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Category filter pills — horizontal scroll */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterCat("all")}
            className="shrink-0 text-xs font-body font-semibold px-3 py-1.5 rounded-full transition-all"
            style={filterCat === "all"
              ? { background: "#160A47", color: "#fff" }
              : { background: "#F3F4F6", color: "#6B7280" }}
          >
            All
          </button>
          {NOTE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className="shrink-0 text-xs font-body font-semibold px-3 py-1.5 rounded-full transition-all"
              style={filterCat === cat.id
                ? { background: cat.color, color: "#fff" }
                : { background: cat.bg, color: cat.color, opacity: 0.75 }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 py-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-100 animate-spin"
              style={{ borderTopColor: "#7B1515" }}
            />
          </div>
        ) : notes.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5"
              style={{ background: "#FFF0F0" }}>
              <StickyNote className="w-8 h-8" style={{ color: "#7B1515" }} />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "#2D2418" }}>
              No notes yet
            </h3>
            <p className="font-body text-gray-400 text-sm mb-6 max-w-xs">
              Start capturing your gospel insights, sermon notes, and Bible study reflections.
            </p>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 text-sm font-body font-semibold px-6 py-3 rounded-2xl text-white"
              style={{ background: "#160A47" }}
            >
              <Plus className="w-4 h-4" /> Create First Note
            </button>
          </div>
        ) : empty && search ? (
          <p className="text-center font-body text-sm text-gray-400 py-16">
            No notes match "{search}"
          </p>
        ) : (
          <>
            {/* Pinned section */}
            {pinned.length > 0 && (
              <section>
                <div className="flex items-center gap-1.5 mb-3">
                  <Pin className="w-3 h-3" style={{ color: "#C8971B" }} fill="#C8971B" />
                  <span className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
                    Pinned
                  </span>
                </div>
                <NotesGrid notes={pinned} onOpen={(id) => navigate(`/notes/${id}`)} />
              </section>
            )}

            {/* All / recent */}
            {unpinned.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
                      Notes
                    </span>
                  </div>
                )}
                <NotesGrid notes={unpinned} onOpen={(id) => navigate(`/notes/${id}`)} />
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
