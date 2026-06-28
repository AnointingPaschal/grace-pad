import { Link, useLocation } from "react-router-dom";
import { BookOpen, PenLine, Home, BookMarked, LogOut, Upload, X, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useBible } from "../../contexts/BibleContext";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import clsx from "clsx";

const NAV = [
  { to: "/",       icon: Home,       label: "Home" },
  { to: "/bible",  icon: BookOpen,   label: "Bible" },
  { to: "/notes",  icon: PenLine,    label: "My Notes" },
  { to: "/study",  icon: BookMarked, label: "Study Room" },
];

export default function Sidebar({ open, onClose }) {
  const { user, signOut } = useAuth();
  const { translations, activeTranslationId, setActiveTranslationId, uploadTranslation } = useBible();
  const location = useLocation();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadTranslation(file);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 left-0 h-full w-64 z-40 flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "linear-gradient(180deg, #160A47 0%, #1E0E5A 60%, #160A47 100%)" }}
      >
        {/* Gold illumination top bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

        {/* Logo */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-gold/30 bg-gold/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M12 2L12 22M7 7L17 7M7 17L17 17" stroke="#C8971B" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display text-white font-semibold text-lg tracking-wide">Grace Pad</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white/80 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="px-3 flex-1 space-y-0.5 mt-2">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-gold/15 text-gold border border-gold/20"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Translations section */}
        <div className="px-3 pb-2 border-t border-white/10 pt-4">
          <p className="text-white/30 text-xs font-body font-medium uppercase tracking-widest px-2 mb-2">
            Translations
          </p>
          <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
            {translations.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTranslationId(t.id)}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-150",
                  activeTranslationId === t.id
                    ? "bg-gold/15 text-gold"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <span className="text-xs font-body font-semibold w-8 shrink-0 uppercase">{t.abbr}</span>
                <span className="text-xs font-body truncate">{t.name}</span>
              </button>
            ))}
          </div>

          {/* Upload translation */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all text-xs font-body"
          >
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Add translation (.tw)"}
          </button>
          <input ref={fileRef} type="file" accept=".tw" className="hidden" onChange={handleFileUpload} />
        </div>

        {/* User profile */}
        <div className="px-4 pb-5 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || "G")}&background=C8971B&color=160A47`}
              alt={user?.displayName}
              className="w-8 h-8 rounded-full border border-gold/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-body text-sm font-medium truncate">{user?.displayName}</p>
              <p className="text-white/40 text-xs font-body truncate">{user?.email}</p>
            </div>
            <button onClick={signOut} title="Sign out" className="text-white/30 hover:text-red-400 transition-colors ml-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
