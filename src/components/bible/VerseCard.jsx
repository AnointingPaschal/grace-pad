import { useState } from "react";
import { MoreHorizontal, Copy, PenLine, BookOpen } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { formatShortRef } from "../../utils/bibleParser";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function VerseCard({ book, chapter, verse, text, onInsertToNote }) {
  const { manifest, globalTranslation, verseOverrides, getVerseText, switchVerseTranslation, switchAllTranslation, ensureLoaded } = useBible();
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlight, setHighlight] = useState(null);

  const key = `${book}:${chapter}:${verse}`;
  const activeTranslation = verseOverrides[key] || globalTranslation;
  const shortRef = formatShortRef(book, chapter, verse);
  const displayText = getVerseText(book, chapter, verse) ?? text;

  const HIGHLIGHT_COLORS = [
    { bg: "#FFF3CC", label: "Yellow" },
    { bg: "#D4F5E2", label: "Green"  },
    { bg: "#D4E8F5", label: "Blue"   },
    { bg: "#F5D4E8", label: "Pink"   },
    { bg: "#E5D4F5", label: "Purple" },
  ];

  const copyVerse = () => {
    navigator.clipboard.writeText(`${displayText} — ${shortRef.replace(/\./g, " ")} (${activeTranslation})`);
    toast.success("Verse copied");
    setMenuOpen(false);
  };

  return (
    <div
      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
      style={{ background: highlight || "white" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="font-body font-semibold text-sm tracking-wide"
          style={{ color: "#7B1515" }}
        >
          {shortRef}
        </span>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-6 z-30 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-sm font-body">
                <button
                  onClick={copyVerse}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy verse
                </button>
                {onInsertToNote && (
                  <button
                    onClick={() => { onInsertToNote(book, chapter, verse, displayText, activeTranslation); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    <PenLine className="w-3.5 h-3.5" /> Add to note
                  </button>
                )}
                {/* Highlight row */}
                <div className="px-3 py-2 flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 mr-1">Highlight</span>
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.bg}
                      onClick={() => { setHighlight(highlight === c.bg ? null : c.bg); setMenuOpen(false); }}
                      className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                      style={{ background: c.bg }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Verse text */}
      <p className="font-scripture text-gray-900 text-base leading-relaxed mb-3">
        {displayText || <span className="text-gray-300 italic text-sm">Not available in this translation</span>}
      </p>

      {/* Translation switcher row */}
      {manifest.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {manifest.map((t) => {
            const isActive = t.abbr === activeTranslation;
            return (
              <button
                key={t.abbr}
                onClick={() => {
                  ensureLoaded(t.abbr);
                  switchVerseTranslation(book, chapter, verse, t.abbr);
                }}
                className="text-xs font-body font-semibold transition-colors px-0.5"
                style={{ color: isActive ? "#7B1515" : "#9CA3AF" }}
              >
                {t.abbr}
              </button>
            );
          })}
          {/* Separator */}
          {manifest.length > 0 && (
            <span className="text-gray-200 text-xs">|</span>
          )}
          {/* ALL — switches global */}
          <button
            onClick={() => switchAllTranslation(manifest.find(t => t.abbr !== globalTranslation)?.abbr || globalTranslation)}
            className="text-xs font-body font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            title="Switch all verses"
          >
            ALL
          </button>
        </div>
      )}
    </div>
  );
}
