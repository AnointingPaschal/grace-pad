import { useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS } from "../../utils/bibleBooks";

export default function VersePickerModal({ onClose, onInsert }) {
  const { globalTranslation, getChapterVerses, getBookChapterCount } = useBible();
  const [step, setStep] = useState("book");
  const [book, setBook]       = useState(null);
  const [chapter, setChapter] = useState(null);
  const [testament, setTestament] = useState("NT");

  const chapterCount = book ? getBookChapterCount(book) : 0;
  const verses = book && chapter ? getChapterVerses(book, chapter) : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {step !== "book" && (
            <button onClick={() => step === "verse" ? setStep("chapter") : setStep("book")}
              className="p-1.5 rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <h2 className="font-display font-semibold text-scripture text-base">
            {step === "book" ? "Select Book" : step === "chapter" ? `${book} — Chapter` : `${book} ${chapter}`}
          </h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Book step */}
      {step === "book" && (
        <>
          <div className="flex border-b border-gray-100">
            {["OT", "NT"].map((t) => (
              <button key={t} onClick={() => setTestament(t)}
                className="flex-1 py-2.5 text-sm font-body font-semibold border-b-2 transition-colors"
                style={{ color: testament === t ? "#7B1515" : "#9CA3AF", borderColor: testament === t ? "#7B1515" : "transparent" }}>
                {t === "OT" ? "Old Testament" : "New Testament"}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2">
              {(testament === "OT" ? OT_BOOKS : NT_BOOKS).map((b) => (
                <button key={b.code} onClick={() => { setBook(b.name); setStep("chapter"); }}
                  className="text-left px-4 py-3 border-b border-r border-gray-50 font-body text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Chapter step */}
      {step === "chapter" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: chapterCount }, (_, i) => i + 1).map((c) => (
              <button key={c} onClick={() => { setChapter(c); setStep("verse"); }}
                className="aspect-square rounded-xl font-body text-sm font-medium flex items-center justify-center border border-gray-200 hover:border-red-900/30 hover:text-white transition-all"
                style={{ background: chapter === c ? "#7B1515" : undefined, color: chapter === c ? "#fff" : "#374151" }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verse step */}
      {step === "verse" && (
        <div className="flex-1 overflow-y-auto">
          {verses.map(({ verse, text }) => (
            <button key={verse} onClick={() => { onInsert(book, chapter, verse, text, globalTranslation); onClose(); }}
              className="w-full flex gap-3 px-4 py-3 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors active:bg-gray-100">
              <span className="text-xs font-body font-semibold shrink-0 mt-1 w-5 text-right"
                style={{ color: "#7B1515" }}>{verse}</span>
              <p className="font-scripture text-sm text-gray-700 leading-relaxed">{text}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
