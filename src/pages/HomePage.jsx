import { Link, useNavigate } from "react-router-dom";
import { PenLine, BookOpen, BookMarked, Plus, Pin, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNotes, NOTE_CATEGORIES } from "../contexts/NotesContext";
import { useBible } from "../contexts/BibleContext";
import NoteCard from "../components/notes/NoteCard";
import { format } from "date-fns";

// Curated daily verses (cycles by day of year)
const DAILY_VERSES = [
  { ref: "John 3:16",      text: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life." },
  { ref: "Psalm 23:1",     text: "The Lord is my shepherd; I shall not want." },
  { ref: "Romans 8:28",    text: "And we know that all things work together for good to those who love God, to those who are the called according to His purpose." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope." },
  { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and lean not on your own understanding; in all your ways acknowledge Him, and He shall direct your paths." },
  { ref: "Isaiah 40:31",   text: "But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint." },
];

function getDailyVerse() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

const QUICK_LINKS = [
  { to: "/bible",  icon: BookOpen,   label: "Open Bible",    desc: "Read and study scripture" },
  { to: "/notes/new", icon: PenLine, label: "New Note",      desc: "Capture your thoughts" },
  { to: "/study",  icon: BookMarked, label: "Study Room",    desc: "Bible + notes side by side" },
];

export default function HomePage() {
  const { user } = useAuth();
  const { notes, loading, deleteNote, pinNote, pinnedNotes, recentNotes } = useNotes();
  const navigate = useNavigate();
  const verse = getDailyVerse();
  const today = format(new Date(), "EEEE, MMMM d");

  const firstName = user?.displayName?.split(" ")[0] ?? "Friend";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-10">
      {/* Greeting */}
      <div className="space-y-1">
        <p className="font-body text-gray-400 text-sm">{today}</p>
        <h1 className="font-display text-3xl text-scripture font-semibold">
          {greeting}, {firstName}. 👋
        </h1>
      </div>

      {/* Daily verse banner */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{ background: "linear-gradient(135deg, #160A47 0%, #3B1D8C 100%)" }}
      >
        {/* Decorative cross */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5">
          <svg viewBox="0 0 100 100" className="w-32 h-32" fill="white">
            <path d="M45 5v35H10v20h35v35h10V60h35V40H55V5z"/>
          </svg>
        </div>

        <p className="text-gold/80 text-xs font-body uppercase tracking-[0.2em] mb-3">Verse of the Day</p>
        <blockquote className="font-scripture text-white text-lg sm:text-xl leading-relaxed max-w-2xl italic mb-3">
          "{verse.text}"
        </blockquote>
        <cite className="text-white/50 font-body text-sm not-italic">{verse.ref} — NKJV</cite>

        <Link
          to="/bible"
          className="mt-4 inline-flex items-center gap-2 text-gold text-sm font-body font-medium hover:gap-3 transition-all"
        >
          Read in Bible <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {QUICK_LINKS.map(({ to, icon: Icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-parchment-dark hover:border-royal/20 hover:shadow-card transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-royal/8 group-hover:bg-royal flex items-center justify-center transition-colors shrink-0">
              <Icon className="w-5 h-5 text-royal group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-body font-semibold text-scripture text-sm">{label}</p>
              <p className="font-body text-gray-400 text-xs">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pinned notes */}
      {pinnedNotes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-gold" fill="#C8971B" />
            <h2 className="font-display font-semibold text-scripture">Pinned</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onPin={pinNote} />
            ))}
          </div>
        </section>
      )}

      {/* Recent notes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-scripture">Recent Notes</h2>
          <Link to="/notes" className="text-royal text-sm font-body hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white border border-parchment-dark animate-pulse" />
            ))}
          </div>
        ) : recentNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-parchment-dark">
            <PenLine className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="font-body text-gray-500 font-medium">No notes yet</p>
            <p className="font-body text-gray-400 text-sm mb-4">Start capturing your gospel insights</p>
            <Link
              to="/notes/new"
              className="inline-flex items-center gap-2 bg-royal text-white text-sm font-body font-medium px-4 py-2 rounded-lg hover:bg-royal-light transition-colors"
            >
              <Plus className="w-4 h-4" />
              Write your first note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentNotes.slice(0, 6).map((note) => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onPin={pinNote} />
            ))}
          </div>
        )}
      </section>

      {/* Stats */}
      {notes.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Notes",    value: notes.length },
            { label: "Pinned",         value: pinnedNotes.length },
            { label: "Categories",     value: [...new Set(notes.map((n) => n.category))].length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-parchment-dark p-4 text-center">
              <p className="font-display text-3xl font-bold text-royal">{value}</p>
              <p className="font-body text-gray-400 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
