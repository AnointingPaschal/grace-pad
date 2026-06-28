import { useNavigate } from "react-router-dom";
import { BookOpen, PenLine, BookMarked, Plus, Pin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotes, NOTE_COLORS } from "../contexts/NotesContext";
import { useBible } from "../contexts/BibleContext";

const DAILY = [
  { ref: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path." },
  { ref: "Proverbs 3:5",  text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
  { ref: "Isaiah 40:31",  text: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles." },
  { ref: "John 3:16",     text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { ref: "Romans 8:28",   text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
  { ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end." },
];
const daily = DAILY[new Date().getDay()];

export default function HomePage() {
  const { user } = useAuth();
  const { notes, createNote } = useNotes();
  const { currentBook, currentChapter, globalTranslation, navigateTo } = useBible();
  const navigate = useNavigate();

  const firstName = user?.displayName?.split(" ")[0] ?? "Beloved";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const recent = notes.slice(0, 4);
  const pinned = notes.filter((n) => n.isPinned).slice(0, 2);

  const handleNewNote = async () => {
    const id = await createNote({ title: "New Note" });
    navigate(`/notes/${id}`);
  };

  return (
    <div className="min-h-full bg-parchment pb-6">
      {/* Hero banner */}
      <div className="px-5 pt-6 pb-5"
        style={{ background: "linear-gradient(160deg, #160A47 0%, #3B1D8C 100%)" }}>
        <p className="font-body text-white/50 text-sm mb-0.5">{greeting},</p>
        <h1 className="font-display text-2xl font-bold text-white mb-4">{firstName}</h1>

        {/* Daily verse card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <p className="text-[10px] font-body text-gold/80 uppercase tracking-widest mb-2">
            ✦ Verse of the Day
          </p>
          <p className="font-scripture text-white text-sm leading-relaxed italic mb-2">
            "{daily.text}"
          </p>
          <p className="text-[11px] font-body font-semibold" style={{ color: "#C8971B" }}>
            — {daily.ref} (KJV)
          </p>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: PenLine, label: "New Note", sub: "Write & reflect", color: "#7B1515", light: "#FFF0F0", action: handleNewNote },
            { icon: BookOpen, label: "Read Bible", sub: `${currentBook} ${currentChapter}`, color: "#1D4ED8", light: "#EFF6FF", action: () => navigate("/bible") },
            { icon: BookMarked, label: "Study Room", sub: "Bible + Notes", color: "#15803D", light: "#F0FDF4", action: () => navigate("/study") },
            { icon: Plus, label: "All Notes", sub: `${notes.length} saved`, color: "#7C3AED", light: "#F5F3FF", action: () => navigate("/notes") },
          ].map(({ icon: Icon, label, sub, color, light, action }) => (
            <button key={label} onClick={action}
              className="flex flex-col items-start gap-2.5 bg-white rounded-2xl p-4 border border-gray-100 active:scale-95 transition-transform text-left shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: light }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-body font-semibold text-sm text-gray-800">{label}</p>
                <p className="font-body text-xs text-gray-400">{sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Pinned notes */}
        {pinned.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-body font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Pin className="w-3 h-3" /> Pinned
              </p>
            </div>
            <div className="space-y-2.5">
              {pinned.map((note) => {
                const color = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0];
                return (
                  <button key={note.id} onClick={() => navigate(`/notes/${note.id}`)}
                    className="w-full text-left rounded-2xl p-4 border active:scale-98 transition-transform"
                    style={{ background: color.bg, borderColor: color.border }}>
                    <p className="font-display font-semibold text-sm text-scripture line-clamp-1">{note.title || "Untitled"}</p>
                    <p className="font-body text-xs text-gray-500 mt-1 line-clamp-2">
                      {typeof note.content === "string" ? note.content.replace(/<[^>]*>/g, "").slice(0, 80) : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent notes */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-body font-semibold text-gray-400 uppercase tracking-widest">Recent Notes</p>
              <button onClick={() => navigate("/notes")}
                className="text-xs font-body font-semibold" style={{ color: "#7B1515" }}>
                See all
              </button>
            </div>
            <div className="space-y-2.5">
              {recent.map((note) => {
                const color = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0];
                return (
                  <button key={note.id} onClick={() => navigate(`/notes/${note.id}`)}
                    className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-gray-100 active:scale-98 transition-transform text-left shadow-sm">
                    <div className="w-2 h-10 rounded-full shrink-0" style={{ background: color.border }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-scripture truncate">{note.title || "Untitled"}</p>
                      <p className="font-body text-xs text-gray-400 mt-0.5">
                        {note.updatedAt?.toDate?.()
                          ? new Date(note.updatedAt.toDate()).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="font-body text-gray-400 text-sm">No notes yet — start writing!</p>
          </div>
        )}
      </div>
    </div>
  );
}
