import { useState, useEffect } from "react";
import { X, BookOpen, ChevronRight } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { BIBLE_BOOKS, OT_BOOKS, NT_BOOKS, range } from "../../utils/bibleBooks";
import { getChapter, getVerseCount } from "../../utils/bibleParser";
import clsx from "clsx";

export default function VersePickerModal({ onClose, onInsert }) {
  const { bibleData, activeTranslation, translations, activeTranslationId, setActiveTranslationId } = useBible();
  const [step, setStep] = useState("book"); // book | chapter | verse
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [testament, setTestament] = useState("NT");

  const chapters = book
    ? Array.from({ length: book.chapters }, (_, i) => i + 1)
    : [];

  const verses = book && chapter && bibleData
    ? getChapter(bibleData, book.code, chapter)
    : [];

  const handleBook = (b) => { setBook(b); setChapter(null); setStep("chapter"); };
  const handleChapter = (c) => { setChapter(c); setStep("verse"); };
  const handleVerse = (v) => {
    onInsert(book.short, chapter, v.verse, v.text, activeTranslation?.abbr ?? "");
  };

  const breadcrumb = [
    { label: "Book", onClick: () => setStep("book") },
    book && { label: book.name, onClick: () => setStep("chapter") },
    chapter && { label: `Chapter ${chapter}`, onClick: () => setStep("verse") },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <BookOpen className="w-5 h-5 text-royal shrink-0" />
          <div className="flex-1">
            <h2 className="font-display font-semibold text-scripture">Insert Bible Verse</h2>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 mt-0.5">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                  <button onClick={crumb.onClick} className="text-xs text-royal/70 hover:text-royal font-body transition-colors">
                    {crumb.label}
                  </button>
                </span>
              ))}
            </div>
          </div>
          {/* Translation switcher */}
          <select
            value={activeTranslationId}
            onChange={(e) => setActiveTranslationId(e.target.value)}
            className="text-xs font-body border border-gray-200 rounded-lg px-2 py-1 text-gray-600 outline-none bg-white"
          >
            {translations.map((t) => (
              <option key={t.id} value={t.id}>{t.abbr}</option>
            ))}
          </select>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Book selection */}
          {step === "book" && (
            <div>
              <div className="flex gap-2 mb-4">
                {["OT", "NT"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTestament(t)}
                    className={clsx(
                      "flex-1 py-2 rounded-xl text-sm font-body font-medium transition-all",
                      testament === t ? "bg-royal text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    {t === "OT" ? "Old Testament" : "New Testament"}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(testament === "OT" ? OT_BOOKS : NT_BOOKS).map((b) => (
                  <button
                    key={b.code}
                    onClick={() => handleBook(b)}
                    className="text-left px-3 py-2 rounded-lg hover:bg-parchment hover:text-royal text-sm font-body text-gray-700 transition-colors"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chapter selection */}
          {step === "chapter" && (
            <div>
              <p className="text-sm font-body text-gray-500 mb-3">Select chapter in {book.name}</p>
              <div className="grid grid-cols-6 gap-2">
                {chapters.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleChapter(c)}
                    className="aspect-square rounded-xl bg-gray-50 hover:bg-royal hover:text-white text-sm font-body font-medium text-gray-700 transition-all"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verse selection */}
          {step === "verse" && (
            <div className="space-y-2">
              {verses.length === 0 ? (
                <p className="text-center text-gray-400 font-body text-sm py-8">
                  No verses found for {book?.name} {chapter} in this translation.
                </p>
              ) : (
                verses.map((v) => (
                  <button
                    key={v.verse}
                    onClick={() => handleVerse(v)}
                    className="w-full text-left flex gap-3 px-4 py-3 rounded-xl hover:bg-parchment border border-transparent hover:border-gold/20 transition-all group"
                  >
                    <span className="text-gold font-display font-semibold text-sm w-6 shrink-0 pt-0.5">
                      {v.verse}
                    </span>
                    <span className="font-scripture text-gray-700 text-sm leading-relaxed group-hover:text-scripture">
                      {v.text}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
