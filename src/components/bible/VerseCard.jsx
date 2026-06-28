import { useState } from "react";
import { MoreHorizontal, Copy, PenLine } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { formatShortRef } from "../../utils/bibleParser";
import toast from "react-hot-toast";

const MAROON = "#7B1515";

const HIGHLIGHT_COLORS = [
  "#FFF3CC","#D4F5E2","#D4E8F5","#F5D4E8","#E5D4F5",
];

export default function VerseCard({ book, chapter, verse, text, onInsertToNote }) {
  const {
    manifest, globalTranslation, verseOverrides,
    getVerseText, switchVerseTranslation, switchAllTranslation, ensureLoaded,
  } = useBible();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [highlight,  setHighlight]  = useState(null);

  const key         = `${book}:${chapter}:${verse}`;
  const activeTrans = verseOverrides[key] || globalTranslation;
  const displayText = getVerseText(book, chapter, verse) ?? text;
  const shortRef    = formatShortRef(book, chapter, verse);

  const copyVerse = () => {
    navigator.clipboard.writeText(
      `${displayText} — ${shortRef.replace(/\./g, " ")} (${activeTrans})`
    );
    toast.success("Verse copied");
    setMenuOpen(false);
  };

  return (
    <div
      className="px-4 py-3.5 border-b border-gray-100 last:border-0"
      style={{ background: highlight ?? "white" }}
    >
      {/* Ref + menu row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-body font-bold text-sm tracking-wide" style={{ color: MAROON }}>
          {shortRef}
        </span>
        <div className="relative">
          <button onClick={() => setMenuOpen(p => !p)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-6 z-30 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-sm font-body">
                <button onClick={copyVerse}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700">
                  <Copy className="w-3.5 h-3.5" /> Copy verse
                </button>
                {onInsertToNote && (
                  <button
                    onClick={() => { onInsertToNote(book, chapter, verse, displayText, activeTrans); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700">
                    <PenLine className="w-3.5 h-3.5" /> Add to note
                  </button>
                )}
                {/* Highlight colours */}
                <div className="px-3 py-2 flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 mr-0.5">Highlight</span>
                  {HIGHLIGHT_COLORS.map(c => (
                    <button key={c} onClick={() => { setHighlight(highlight === c ? null : c); setMenuOpen(false); }}
                      className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform ring-2 ring-offset-1"
                      style={{ background: c, ringColor: highlight === c ? "#374151" : "transparent" }} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Verse text */}
      <p className="font-scripture text-gray-900 text-base leading-relaxed mb-2.5">
        {displayText ?? (
          <span className="text-gray-300 italic text-sm">Not available in this translation</span>
        )}
      </p>

      {/* Translation switcher row — always shown, lazy-loads on tap */}
      {manifest.length > 0 && (
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          {manifest.map(t => {
            const isActive = t.abbr === activeTrans;
            return (
              <button
                key={t.abbr}
                onClick={() => { ensureLoaded(t.abbr); switchVerseTranslation(book, chapter, verse, t.abbr); }}
                className="text-xs font-body font-bold transition-colors"
                style={{ color: isActive ? MAROON : "#9CA3AF" }}
              >
                {t.abbr}
              </button>
            );
          })}
          <span className="text-gray-200 text-xs">|</span>
          <button
            onClick={() => switchAllTranslation(activeTrans === globalTranslation ? manifest.find(t => t.abbr !== globalTranslation)?.abbr ?? globalTranslation : globalTranslation)}
            className="text-xs font-body font-bold text-gray-300 hover:text-gray-500 transition-colors"
            title="Switch all verses"
          >ALL</button>
        </div>
      )}
    </div>
  );
}
