import { useParams, useNavigate } from "react-router-dom";
import { Search, Plus, Pin, MoreVertical, StickyNote } from "lucide-react";
import { useState } from "react";
import { useNotes, NOTE_CATEGORIES, NOTE_COLORS } from "../contexts/NotesContext";
import NoteEditor from "../components/notes/NoteEditor";
import clsx from "clsx";

/* Strip HTML / TipTap JSON → plain text */
function toPlain(content) {
  if (!content) return "";
  if (typeof content === "string") return content.replace(/<[^>]*>/g, " ").replace(/\s+/g," ").trim();
  const walk = ns => (ns || []).flatMap(n => n.type === "text" ? [n.text] : walk(n.content)).join(" ");
  return walk(content?.content).replace(/\s+/g," ").trim();
}

/* ── Google-Docs-style note card ── */
function NoteCard({ note, onOpen }) {
  const [menu, setMenu] = useState(false);
  const { deleteNote } = useNotes();
  const cat   = NOTE_CATEGORIES.find(c => c.id === note.category);
  const color = NOTE_COLORS.find(c => c.id === note.color) ?? NOTE_COLORS[0];
  const plain = toPlain(note.content);
  const date  = note.updatedAt?.toDate?.()
    ? new Date(note.updatedAt.toDate()).toLocaleDateString("en-US", { month:"short", day:"numeric" })
    : "";

  return (
    <div
      onClick={() => onOpen(note.id)}
      className="group flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-150 active:scale-[0.97] bg-white"
      style={{
        border: "1.5px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        height: "220px",
      }}
    >
      {/* ── Document preview area (like Google Docs thumbnail) ── */}
      <div
        className="flex-1 overflow-hidden relative p-2.5"
        style={{ background: color.bg || "#fff" }}
      >
        {/* Pinned badge */}
        {note.isPinned && (
          <Pin className="absolute top-2 right-2 w-3 h-3 z-10" style={{ color:"#C8971B" }} fill="#C8971B" />
        )}

        {plain ? (
          /* Miniature document text — like Google Docs preview */
          <p
            className="font-body text-gray-600 leading-tight select-none pointer-events-none"
            style={{ fontSize: "6.5px", lineHeight: "1.6", wordBreak:"break-word" }}
          >
            {plain.slice(0, 800)}
          </p>
        ) : (
          <div className="h-full flex items-center justify-center">
            <StickyNote className="w-8 h-8 text-gray-200" />
          </div>
        )}

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${color.bg || "#fff"})` }}
        />
      </div>

      {/* ── Bottom bar (like Google Docs) ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-2.5 py-2 border-t"
        style={{ borderColor:"#E5E7EB", background:"#F9FAFB" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Category icon dot */}
        <div
          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
          style={{ background: cat?.bg || "#EEF2FF" }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: cat?.color || "#4F46E5" }} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-xs font-semibold text-gray-700 truncate">{note.title || "Untitled"}</p>
          <p className="font-body text-[9px] text-gray-400">{date}</p>
        </div>

        {/* 3-dot menu */}
        <div className="relative shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setMenu(m => !m); }}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenu(false)} />
              <div className="absolute right-0 bottom-full mb-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 text-xs font-body">
                <button onClick={e => { e.stopPropagation(); onOpen(note.id); setMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700">Open</button>
                <button onClick={e => { e.stopPropagation(); deleteNote(note.id); setMenu(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-500">Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function NotesPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { notes, loading, createNote } = useNotes();
  const [search,    setSearch]    = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const handleNew = async () => {
    const newId = await createNote({ title: "New Note" });
    navigate(`/notes/${newId}`);
  };

  if (id) return <NoteEditor />;

  const filterFn = n => {
    const matchCat  = filterCat === "all" || n.category === filterCat;
    const matchText = !search || (n.title + " " + toPlain(n.content)).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchText;
  };

  const pinned   = notes.filter(n => n.isPinned && filterFn(n));
  const unpinned = notes.filter(n => !n.isPinned && filterFn(n));

  return (
    <div className="min-h-full" style={{ background:"#ffffff" }}>

      {/* ── SEARCH + FILTER ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 pt-3 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search in notes"
              className="flex-1 bg-transparent text-sm font-body outline-none placeholder-gray-400 text-gray-700" />
          </div>
          <button onClick={handleNew}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0"
            style={{ background:"#160A47" }}>
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button onClick={() => setFilterCat("all")}
            className="shrink-0 text-xs font-body font-semibold px-3 py-1 rounded-full"
            style={filterCat==="all" ? { background:"#160A47", color:"#fff" } : { background:"#F3F4F6", color:"#6B7280" }}>
            All
          </button>
          {NOTE_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFilterCat(cat.id)}
              className="shrink-0 text-xs font-body font-semibold px-3 py-1 rounded-full"
              style={filterCat===cat.id ? { background:cat.color, color:"#fff" } : { background:cat.bg, color:cat.color }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID ── */}
      <div className="px-3 py-4 space-y-5">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor:"#160A47" }} />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5" style={{ background:"#EEF2FF" }}>
              <StickyNote className="w-8 h-8" style={{ color:"#160A47" }} />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2 text-gray-800">No notes yet</h3>
            <p className="font-body text-gray-400 text-sm mb-6 max-w-xs">
              Capture gospel insights, sermon notes and Bible study reflections.
            </p>
            <button onClick={handleNew}
              className="flex items-center gap-2 text-sm font-body font-semibold px-6 py-3 rounded-2xl text-white"
              style={{ background:"#160A47" }}>
              <Plus className="w-4 h-4" /> Create First Note
            </button>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <section>
                <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Pin className="w-3 h-3" fill="#9CA3AF" /> Pinned
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {pinned.map(n => <NoteCard key={n.id} note={n} onOpen={id => navigate(`/notes/${id}`)} />)}
                </div>
              </section>
            )}
            {unpinned.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-3">Notes</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {unpinned.map(n => <NoteCard key={n.id} note={n} onOpen={id => navigate(`/notes/${id}`)} />)}
                </div>
              </section>
            )}
            {pinned.length + unpinned.length === 0 && (
              <p className="text-center font-body text-sm text-gray-400 py-12">No notes match your search.</p>
            )}
          </>
        )}
      </div>

      {/* FAB (like Google Docs green +) */}
      <button
        onClick={handleNew}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg z-20 transition-transform active:scale-95"
        style={{ background:"#160A47" }}
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}
