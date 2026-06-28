import { Home, BookOpen, PenLine, BookMarked, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotes } from "../../contexts/NotesContext";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

const NAV = [
  { to: "/",       icon: Home,       label: "Home"    },
  { to: "/bible",  icon: BookOpen,   label: "Bible"   },
  { to: "/notes",  icon: PenLine,    label: "Notes"   },
  { to: "/study",  icon: BookMarked, label: "Study"   },
];

export default function MobileLayout({ children }) {
  const { user, signOut } = useAuth();
  const { createNote } = useNotes();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-parchment">
      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 h-13"
        style={{
          background: "linear-gradient(135deg, #160A47 0%, #2D1777 100%)",
          minHeight: "52px",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-gold/40 bg-gold/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
              <path d="M12 2L12 22M7 7L17 7M7 17L17 17" stroke="#C8971B" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-white font-semibold text-base tracking-wide">
            Grace Pad
          </span>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-1.5"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full ring-2 ring-gold/50"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
                <User className="w-4 h-4 text-gold" />
              </div>
            )}
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-sidebar to-royal">
                  {user?.photoURL && (
                    <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full mb-2" />
                  )}
                  <p className="text-white font-body font-medium text-sm truncate">
                    {user?.displayName}
                  </p>
                  <p className="text-white/50 font-body text-xs truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => { signOut(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm font-body text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main className="flex-1 overflow-auto pb-20">
        {children}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 flex"
        style={{ background: "#ffffff", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map(({ to, icon: Icon, label }) => {
          const active =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            >
              <Icon
                className="w-5 h-5"
                style={{ color: active ? "#7B1515" : "#9CA3AF" }}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className="text-[10px] font-body font-medium"
                style={{ color: active ? "#7B1515" : "#9CA3AF" }}
              >
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
          success: { iconTheme: { primary: "#7B1515", secondary: "#fff" } },
        }}
      />
    </div>
  );
}
