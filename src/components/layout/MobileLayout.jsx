import { MapPin, BookOpen, PenLine, Search, LogOut, User, Plus, ListOrdered, List } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotes } from "../../contexts/NotesContext";
import { useBible } from "../../contexts/BibleContext";
import { useState, useRef } from "react";
import { Toaster } from "react-hot-toast";

const DARK_BLUE = "#160A47";
const MID_BLUE  = "#2D1777";
const GOLD      = "#C8971B";

export default function MobileLayout({ children }) {
  const { user, signOut } = useAuth();
  const { createNote }    = useNotes();
  const { setActiveSheet, setGlobalSearch, globalSearch } = useBible();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showSearch,  setShowSearch]  = useState(false);
  const searchRef = useRef(null);

  const isNotes   = location.pathname.startsWith("/notes");
  const isBible   = !isNotes;

  const handleNew = async () => {
    const id = await createNote({ title:"New Note" });
    navigate(`/notes/${id}`);
  };

  const openSheet = (sheet) => {
    if (!isBible) { navigate("/"); setTimeout(() => setActiveSheet(sheet), 200); }
    else setActiveSheet(sheet);
  };

  const handleSearch = () => {
    setShowSearch(s => !s);
    if (!isBible) navigate("/");
    setTimeout(() => searchRef.current?.focus(), 150);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── TOP NAV: Bible | Notes | Search | Profile ── */}
      <header className="sticky top-0 z-30 shrink-0"
        style={{ background:`linear-gradient(135deg,${DARK_BLUE},${MID_BLUE})`, minHeight:"52px" }}>
        <div className="flex items-center h-[52px] px-2 gap-1">
          {/* Bible tab */}
          <Link to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-body font-semibold transition-all"
            style={isBible ? { background:"rgba(255,255,255,0.18)", color:"#fff" } : { color:"rgba(255,255,255,0.5)" }}>
            <BookOpen className="w-4 h-4" /> Bible
          </Link>
          {/* Notes tab */}
          {isNotes && !location.pathname.match(/\/notes\/.+/) ? (
            <button onClick={handleNew}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-body font-semibold"
              style={{ background:"rgba(255,255,255,0.18)", color:"#fff" }}>
              <PenLine className="w-4 h-4" /> <Plus className="w-3 h-3 -ml-0.5" />
            </button>
          ) : null}
          <Link to="/notes"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-body font-semibold transition-all"
            style={isNotes ? { background:"rgba(255,255,255,0.18)", color:"#fff" } : { color:"rgba(255,255,255,0.5)" }}>
            <PenLine className="w-4 h-4" /> Notes
          </Link>
          {/* Search tab */}
          <button onClick={handleSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-body font-semibold transition-all"
            style={showSearch ? { background:"rgba(255,255,255,0.18)", color:"#fff" } : { color:"rgba(255,255,255,0.5)" }}>
            <Search className="w-4 h-4" /> Search
          </button>

          {/* Profile */}
          <div className="ml-auto relative">
            <button onClick={() => setProfileOpen(p => !p)}>
              {user?.photoURL
                ? <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-white/30" />
                : <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>}
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3" style={{ background:`linear-gradient(135deg,${DARK_BLUE},${MID_BLUE})` }}>
                    {user?.photoURL && <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full mb-2" />}
                    <p className="text-white font-body font-semibold text-sm truncate">{user?.displayName}</p>
                    <p className="text-white/50 font-body text-xs truncate">{user?.email}</p>
                  </div>
                  <button onClick={() => { signOut(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-body text-red-500 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Expandable search bar */}
        {showSearch && (
          <div className="px-3 pb-2.5 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-white/60 shrink-0" />
              <input
                ref={searchRef}
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                onKeyDown={e => e.key === "Escape" && setShowSearch(false)}
                placeholder="Search scripture…"
                className="flex-1 bg-transparent text-white text-sm font-body outline-none placeholder-white/40"
              />
              {globalSearch && <button onClick={() => setGlobalSearch("")} className="text-white/60 text-lg leading-none">×</button>}
            </div>
            <button onClick={() => { setShowSearch(false); setGlobalSearch(""); }}
              className="text-white/60 text-xs font-body">Cancel</button>
          </div>
        )}
      </header>

      {/* ── CONTENT ── */}
      <main className="flex-1 overflow-auto pb-16 bg-white">{children}</main>

      {/* ── BOTTOM NAV: Book | Chapters | Verses ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex bg-white border-t border-gray-200"
        style={{ paddingBottom:"env(safe-area-inset-bottom)" }}>
        {[
          { label:"Book",     icon:MapPin,        sheet:"book"    },
          { label:"Chapters", icon:ListOrdered,   sheet:"chapter" },
          { label:"Verses",   icon:List,          sheet:"verse"   },
        ].map(({ label, icon:Icon, sheet }) => (
          <button key={sheet} onClick={() => openSheet(sheet)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5">
            <Icon className="w-5 h-5" style={{ color: DARK_BLUE }} strokeWidth={1.8} />
            <span className="text-[10px] font-body font-semibold" style={{ color: DARK_BLUE }}>{label}</span>
          </button>
        ))}
      </nav>

      <Toaster position="top-center" toastOptions={{ style:{ fontFamily:"Inter, sans-serif", fontSize:"13px", borderRadius:"12px" } }} />
    </div>
  );
}
