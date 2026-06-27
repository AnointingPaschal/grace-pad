import { formatDistanceToNow } from "date-fns";
import { Pin, Trash2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { NOTE_CATEGORIES, NOTE_COLORS } from "../../contexts/NotesContext";
import clsx from "clsx";

function getPlainText(content) {
  if (!content || !content.content) return "";
  const extract = (nodes) =>
    nodes?.flatMap((n) => (n.text ? [n.text] : extract(n.content ?? []))).join(" ") ?? "";
  return extract(content.content).slice(0, 140);
}

export default function NoteCard({ note, onDelete, onPin }) {
  const category = NOTE_CATEGORIES.find((c) => c.id === note.category);
  const colorStyle = NOTE_COLORS.find((c) => c.id === note.color) ?? NOTE_COLORS[0];

  const updatedAt = note.updatedAt?.toDate?.() ?? new Date();
  const preview = getPlainText(note.content);

  return (
    <div
      className="group relative rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
      style={{ background: colorStyle.bg, borderColor: colorStyle.border }}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center shadow-sm">
          <Pin className="w-2.5 h-2.5 text-white fill-white" />
        </div>
      )}

      <Link to={`/notes/${note.id}`} className="block p-4 space-y-3">
        {/* Category badge */}
        {category && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-body font-medium"
            style={{ color: category.color, background: category.bg }}
          >
            {category.label}
          </span>
        )}

        <h3 className="font-display font-semibold text-scripture text-base leading-snug line-clamp-2">
          {note.title || "Untitled Note"}
        </h3>

        {preview && (
          <p className="font-body text-gray-500 text-sm leading-relaxed line-clamp-3">{preview}</p>
        )}

        {/* Bible refs */}
        {note.bibleRefs?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.bibleRefs.slice(0, 3).map((ref) => (
              <span key={ref} className="inline-flex items-center gap-1 text-xs text-royal/70 bg-royal/5 px-2 py-0.5 rounded-full font-body">
                <BookOpen className="w-2.5 h-2.5" />
                {ref}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 font-body">#{tag}</span>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 font-body">
          {formatDistanceToNow(updatedAt, { addSuffix: true })}
        </p>
      </Link>

      {/* Action buttons (reveal on hover) */}
      <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1">
        <button
          onClick={(e) => { e.preventDefault(); onPin?.(note.id, !note.isPinned); }}
          className={clsx(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
            note.isPinned ? "bg-gold/20 text-gold" : "bg-black/5 text-gray-400 hover:text-gold"
          )}
          title={note.isPinned ? "Unpin" : "Pin"}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); onDelete?.(note.id); }}
          className="w-7 h-7 rounded-lg bg-black/5 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
          title="Delete note"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
