import { useState } from "react";
import { X, ChevronLeft, Check } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS } from "../../utils/bibleBooks";

const DARK_BLUE = "#160A47";
const MAROON    = "#7B1515";

export default function VersePickerModal({ onClose, onInsert }) {
  const { globalTranslation, getChapterVerses, getBookChapterCount, manifest, loadedData } = useBible();
  const [step,       setStep]       = useState("book");
  const [testament,  setTestament]  = useState("NT");
  const [book,       setBook]       = useState(null);
  const [chapter,    setChapter]    = useState(null);
  const [verseData,  setVerseData]  = useState(null); // { verse, text }

  const chapterCount = book ? getBookChapterCount(book) : 0;
  const verses       = book && chapter ? getChapterVerses(book, chapter) : [];

  const getVerseInTrans = (abbr) => {
    if (!book || !chapter || !verseData) return "";
    return loadedData[abbr]?.books?.[book]?.[chapter]?.[verseData.verse] || verseData.text;
  };

  const stepBack = () => {
    if (step === "translation") setStep("verse");
    else if (step === "verse") setStep("chapter");
    else if (step === "chapter") setStep("book");
    else onClose();
  };

  const title =
    step === "book"        ? "Select Book" :
    step === "chapter"     ? `${book} — Chapter` :
    step === "verse"       ? `${book} ${chapter}` :
    /* translation */         `${book} ${chapter}:${verseData?.verse} — Translation`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0"
        style={{ background: DARK_BLUE }}>
        <button onClick={stepBack} className="p-1 text-white/70 hover:text-white">
          {step === "book" ? <X className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
        <h2 className="font-display font-semibold text-white text-base">{title}</h2>
      </div>

      {/* ── BOOK step ── */}
      {step === "book" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {["OT","NT"].map(t => (
              <button key={t} onClick={() => setTestament(t)}
                className="flex-1 py-2.5 text-sm font-body font-semibold border-b-2 transition-colors"
                style={testament===t ? {color:DARK_BLUE,borderColor:DARK_BLUE} : {color:"#9CA3AF",borderColor:"transparent"}}>
                {t==="OT" ? "Old Testament" : "New Testament"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-0">
              {(testament==="OT" ? OT_BOOKS : NT_BOOKS).map(b => (
                <button key={b.code}
                  onClick={() => { setBook(b.name); setStep("chapter"); }}
                  className="text-left px-4 py-3 border-b border-r border-gray-50 font-body text-sm text-gray-700 hover:bg-gray-50">
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CHAPTER step ── */}
      {step === "chapter" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: chapterCount }, (_, i) => i+1).map(c => (
              <button key={c}
                onClick={() => { setChapter(c); setStep("verse"); }}
                className="h-10 rounded-xl text-sm font-body font-bold border-2 flex items-center justify-center transition-all"
                style={c===chapter
                  ? {background:DARK_BLUE,color:"#fff",borderColor:DARK_BLUE}
                  : {background:"white",color:"#374151",borderColor:"#E5E7EB"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── VERSE step ── */}
      {step === "verse" && (
        <div className="flex-1 overflow-y-auto">
          {verses.map(({ verse: v, text: t }) => (
            <button key={v}
              onClick={() => { setVerseData({ verse: v, text: t }); setStep("translation"); }}
              className="w-full flex gap-3 px-4 py-3 border-b border-gray-50 text-left hover:bg-gray-50 active:bg-gray-100">
              <span className="text-xs font-body font-bold shrink-0 mt-1 w-5 text-right"
                style={{color:MAROON}}>{v}</span>
              <p className="font-scripture text-gray-700 text-sm leading-relaxed">{t}</p>
            </button>
          ))}
        </div>
      )}

      {/* ── TRANSLATION step ── */}
      {step === "translation" && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-body text-gray-500">Choose which translation to insert</p>
          </div>
          {manifest.map(t => {
            const verseText = getVerseInTrans(t.abbr);
            return (
              <button key={t.abbr}
                onClick={() => { onInsert(book, chapter, verseData.verse, verseText || verseData.text, t.abbr); onClose(); }}
                className="w-full flex items-start gap-3 px-4 py-4 border-b border-gray-50 text-left hover:bg-gray-50 active:bg-gray-100">
                <span className="text-sm font-body font-bold shrink-0 mt-0.5 w-11"
                  style={{color:t.abbr===globalTranslation ? MAROON : DARK_BLUE}}>
                  {t.abbr}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-body text-gray-400 mb-0.5">{t.name}</p>
                  <p className="font-scripture text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {verseText || <span className="text-gray-300 italic">Not loaded yet</span>}
                  </p>
                </div>
                {t.abbr === globalTranslation && (
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
