import { BookOpen, PenLine, BookMarked, LogOut, User, Plus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotes } from "../../contexts/NotesContext";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

const NAV = [
  { to: "/",      icon: PenLine,    label: "Notes" },
  { to: "/bible", icon: BookOpen,   label: "Bible" },
  { to: "/study", icon: BookMarked, label: "Study" },
];

const DARK_BLUE = "#160A47";
const MID_BLUE  = "#2D1777";
const GOLD      = "#C8971B";

export default function MobileLayout({ children }) {
  const { user, signOut } = useAuth();
  const { createNote }    = useNotes();
  const location          = useLocation();
  const navigate          = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleNewNote = async () => {
    const id = await createNote({ title: "New Note" });
    navigate(`/notes/${id}`);
  };

  const isNotes = location.pathname === "/" || location.pathname.startsWith("/notes");

  return (
    <div className="flex flex-col min-h-screen bg-parchment">

      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 shrink-0"
        style={{
          background: `linear-gradient(135deg, ${DARK_BLUE} 0%, ${MID_BLUE} 100%)`,
          minHeight: "52px",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
              <path d="M12 2L12 22M7 7L17 7M7 17L17 17" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-white font-semibold text-base tracking-wide">Grace Pad</span>
        </div>

        <div className="flex items-center gap-2">
          {isNotes && !location.pathname.match(/\/notes\/.+/) && (
            <button
              onClick={handleNewNote}
              className="flex items-center gap-1 text-white text-xs font-body font-semibold px-3 py-1.5 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          )}

          <div className="relative">
            <button onClick={() => setProfileOpen(p => !p)}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-white/30" />
                : <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
              }
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3" style={{ background: `linear-gradient(135deg, ${DARK_BLUE}, ${MID_BLUE})` }}>
                    {user?.photoURL && <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full mb-2" />}
                    <p className="text-white font-body font-semibold text-sm truncate">{user?.displayName}</p>
                    <p className="text-white/50 font-body text-xs truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { signOut(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-body text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-20">{children}</main>

      {/* ── BOTTOM NAV ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex bg-white border-t border-gray-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = to === "/" ? isNotes : location.pathname.startsWith(to);
          return (
            <Link key={to} to={to} className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5">
              <Icon className="w-5 h-5" style={{ color: active ? DARK_BLUE : "#9CA3AF" }} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[10px] font-body font-semibold" style={{ color: active ? DARK_BLUE : "#9CA3AF" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontFamily: "Inter, sans-serif", fontSize: "13px", borderRadius: "12px" },
          success: { iconTheme: { primary: DARK_BLUE, secondary: "#fff" } },
        }}
      />
    </div>
  );
}
