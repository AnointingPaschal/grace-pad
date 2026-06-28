import { useState, useEffect } from "react";
import { MoreHorizontal, Copy, PenLine } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { formatShortRef } from "../../utils/bibleParser";
import toast from "react-hot-toast";

const MAROON = "#7B1515";
const HIGHLIGHTS = ["#FFF3CC","#D4F5E2","#D4E8F5","#F5D4E8","#E5D4F5"];
const HL_KEY = "grace-pad-highlights";

function getStoredHL(key) {
  try { return JSON.parse(localStorage.getItem(HL_KEY) || "{}")[key] || null; } catch { return null; }
}
function saveStoredHL(key, color) {
  try {
    const all = JSON.parse(localStorage.getItem(HL_KEY) || "{}");
    if (color) all[key] = color; else delete all[key];
    localStorage.setItem(HL_KEY, JSON.stringify(all));
  } catch {}
}

export default function VerseCard({ book, chapter, verse, text, onInsertToNote }) {
  const { manifest, globalTranslation, verseOverrides, getVerseText, switchVerseTranslation } = useBible();
  const [menuOpen, setMenuOpen] = useState(false);
  const storageKey = `${book}:${chapter}:${verse}`;
  const [highlight, setHighlightState] = useState(() => getStoredHL(storageKey));

  // Sync highlight when navigating back to same verse
  useEffect(() => { setHighlightState(getStoredHL(storageKey)); }, [storageKey]);

  const setHighlight = (color) => {
    const next = highlight === color ? null : color;
    setHighlightState(next);
    saveStoredHL(storageKey, next);
  };

  const key         = storageKey;
  const activeTrans = verseOverrides[key] || globalTranslation;
  const displayText = getVerseText(book, chapter, verse) ?? text;
  const shortRef    = formatShortRef(book, chapter, verse);

  const copyVerse = () => {
    navigator.clipboard.writeText(`${displayText} — ${shortRef.replace(/\./g," ")} (${activeTrans})`);
    toast.success("Verse copied"); setMenuOpen(false);
  };

  return (
    <div className="px-5 pt-4 pb-3 border-b border-gray-100 last:border-0"
      style={{ background: highlight ?? "white" }}>
      <div className="flex items-start justify-between mb-1.5">
        <span className="font-body font-bold text-sm tracking-wide" style={{ color: MAROON }}>{shortRef}</span>
        <div className="relative ml-2 shrink-0">
          <button onClick={() => setMenuOpen(p => !p)} className="p-1 rounded-full hover:bg-gray-100 -mr-1">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-6 z-30 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-sm font-body">
                <button onClick={copyVerse} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700">
                  <Copy className="w-3.5 h-3.5" /> Copy verse
                </button>
                {onInsertToNote && (
                  <button onClick={() => { onInsertToNote(book, chapter, verse, displayText, activeTrans); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700">
                    <PenLine className="w-3.5 h-3.5" /> Add to note
                  </button>
                )}
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-400 mb-1.5">Highlight</p>
                  <div className="flex gap-1.5">
                    {HIGHLIGHTS.map(c => (
                      <button key={c} onClick={() => { setHighlight(c); setMenuOpen(false); }}
                        className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                        style={{ background: c, borderColor: highlight === c ? "#374151" : "#E5E7EB" }} />
                    ))}
                    {highlight && (
                      <button onClick={() => { setHighlight(null); setMenuOpen(false); }}
                        className="w-6 h-6 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-400">
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="font-scripture text-gray-900 leading-[1.85] text-[15px] mb-2.5">
        {displayText ?? <span className="text-gray-300 italic text-sm">Not in this translation</span>}
      </p>

      {/* Translation row — LEFT aligned, black text, instant switch */}
      {manifest.length > 0 && (
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          {manifest.map(t => {
            const isActive = t.abbr === activeTrans;
            return (
              <button key={t.abbr}
                onClick={() => switchVerseTranslation(book, chapter, verse, t.abbr)}
                className="text-[11px] font-body font-bold tracking-wide transition-colors"
                style={{ color: isActive ? MAROON : "#374151" }}>
                {t.abbr}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
