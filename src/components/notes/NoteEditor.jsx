import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bold, Italic, Underline as UnderlineIcon, Highlighter,
  Heading1, Heading2, List, ListOrdered, Quote, Link2,
  AlignLeft, AlignCenter, AlignRight, BookOpen,
  ChevronLeft, Tag, Pin, Palette, Save, Loader2,
} from "lucide-react";
import { useNotes, NOTE_CATEGORIES, NOTE_COLORS, HIGHLIGHT_COLORS } from "../../contexts/NotesContext";
import { useBible } from "../../contexts/BibleContext";
import VersePickerModal from "../ui/VersePickerModal";
import clsx from "clsx";
import toast from "react-hot-toast";

// Auto-save delay
const SAVE_DELAY = 1500;

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        "w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-100",
        active
          ? "bg-royal text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-royal"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />;
}

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notes, createNote, updateNote, deleteNote } = useNotes();
  const { translations, activeTranslationId } = useBible();

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [color, setColor] = useState("white");
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [versePicker, setVersePicker] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const saveTimer = useRef(null);
  const isNew = id === "new";

  // Load note
  useEffect(() => {
    if (isNew) {
      setNote(null); setTitle(""); setCategory("general"); setTags([]); setColor("white"); setIsPinned(false);
      return;
    }
    const found = notes.find((n) => n.id === id);
    if (found) {
      setNote(found);
      setTitle(found.title ?? "");
      setCategory(found.category ?? "general");
      setTags(found.tags ?? []);
      setColor(found.color ?? "white");
      setIsPinned(found.isPinned ?? false);
    }
  }, [id, notes, isNew]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Begin writing your notes…" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: note?.content ?? null,
    editorProps: {
      attributes: {
        class: "outline-none font-body text-gray-800 leading-relaxed min-h-[400px]",
      },
    },
  });

  // Update editor content when note loads
  useEffect(() => {
    if (editor && note?.content && editor.isEmpty) {
      editor.commands.setContent(note.content);
    }
  }, [editor, note]);

  // Auto-save
  const save = useCallback(async () => {
    if (!editor) return;
    const content = editor.getJSON();
    setSaving(true);
    try {
      if (isNew) {
        const newId = await createNote({ title, content, category, tags, color, isPinned });
        navigate(`/notes/${newId}`, { replace: true });
      } else if (note?.id) {
        await updateNote(note.id, { title, content, category, tags, color, isPinned });
      }
    } finally {
      setSaving(false);
    }
  }, [editor, title, category, tags, color, isPinned, isNew, note, createNote, updateNote, navigate]);

  // Debounced auto-save
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(save, SAVE_DELAY);
    };
    editor.on("update", handler);
    return () => { editor.off("update", handler); clearTimeout(saveTimer.current); };
  }, [editor, save]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, SAVE_DELAY);
  };

  const addTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const insertVerse = useCallback((book, chapter, verse, text, abbr) => {
    if (!editor) return;
    const ref = `${book} ${chapter}:${verse}`;
    editor.chain().focus()
      .insertContent({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: `${text}`, marks: [{ type: "italic" }] },
            ],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: `— ${ref} ${abbr}` }],
          },
        ],
      })
      .run();

    // Track bible ref
    const newRef = `${book} ${chapter}:${verse}`;
    if (!note?.bibleRefs?.includes(newRef)) {
      updateNote(note?.id, { bibleRefs: [...(note?.bibleRefs ?? []), newRef] });
    }
    setVersePicker(false);
    toast.success(`${ref} inserted`);
  }, [editor, note, updateNote]);

  const colorStyle = NOTE_COLORS.find((c) => c.id === color) ?? NOTE_COLORS[0];

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 lg:px-6 py-3 border-b border-parchment-dark bg-parchment/80 backdrop-blur-sm">
        <button onClick={() => navigate("/notes")} className="text-gray-400 hover:text-royal transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={handleTitleChange}
            placeholder="Note title…"
            className="w-full bg-transparent font-display text-xl font-semibold text-scripture placeholder-gray-300 outline-none truncate"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {saving ? (
            <span className="text-xs text-gray-400 font-body flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving…
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-body">Saved</span>
          )}
          <button
            onClick={() => setShowMeta((p) => !p)}
            className={clsx("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", showMeta ? "bg-royal text-white" : "text-gray-400 hover:text-royal")}
            title="Note settings"
          >
            <Tag className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setIsPinned((p) => !p); save(); }}
            className={clsx("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", isPinned ? "bg-gold/20 text-gold" : "text-gray-400 hover:text-gold")}
            title="Pin note"
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={save}
            className="w-8 h-8 rounded-lg bg-royal text-white flex items-center justify-center"
            title="Save now"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metadata panel */}
      {showMeta && (
        <div className="flex flex-wrap gap-4 px-4 lg:px-6 py-3 bg-white border-b border-parchment-dark">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-body text-gray-400 uppercase tracking-wide">Category</label>
            <div className="flex gap-1.5">
              {NOTE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={clsx("text-xs font-body px-2.5 py-1 rounded-lg transition-all", category === cat.id ? "font-semibold" : "opacity-50 hover:opacity-80")}
                  style={{ color: cat.color, background: cat.bg }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1">
            <label className="text-xs font-body text-gray-400 uppercase tracking-wide">Color</label>
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={clsx("w-6 h-6 rounded-full border-2 transition-all", color === c.id ? "scale-125" : "border-transparent")}
                  style={{ background: c.bg, borderColor: color === c.id ? c.border : "transparent" }}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex-1 space-y-1">
            <label className="text-xs font-body text-gray-400 uppercase tracking-wide">Tags</label>
            <div className="flex flex-wrap gap-1 items-center">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs text-royal bg-royal/8 px-2 py-0.5 rounded-full font-body">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="text-royal/50 hover:text-red-400 ml-0.5">×</button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add tag…"
                className="text-xs font-body outline-none bg-transparent placeholder-gray-300 w-20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Editor toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-4 lg:px-6 py-2 bg-white border-b border-gray-100 sticky top-14 z-10">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote block">
          <Quote className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Highlight colors */}
        {HIGHLIGHT_COLORS.map((hc) => (
          <button
            key={hc.id}
            title={`Highlight: ${hc.label}`}
            onClick={() => editor.chain().focus().toggleHighlight({ color: hc.bg }).run()}
            className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform"
            style={{ background: hc.bg }}
          />
        ))}

        <Divider />

        {/* Insert Bible verse */}
        <button
          onClick={() => setVersePicker(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-royal/8 text-royal hover:bg-royal hover:text-white text-xs font-body font-medium transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Insert Verse
        </button>
      </div>

      {/* Editor body */}
      <div
        className="flex-1 overflow-auto px-4 lg:px-12 py-8"
        style={{ background: colorStyle.bg }}
      >
        <div className="max-w-3xl mx-auto">
          <EditorContent editor={editor} className="prose prose-lg max-w-none
            prose-headings:font-display prose-headings:text-scripture
            prose-p:font-body prose-p:text-gray-700
            prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:bg-amber-50/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
            prose-strong:text-scripture
            prose-a:text-royal prose-a:no-underline hover:prose-a:underline
          " />
        </div>
      </div>

      {/* Verse picker modal */}
      {versePicker && (
        <VersePickerModal
          onClose={() => setVersePicker(false)}
          onInsert={insertVerse}
        />
      )}
    </div>
  );
}
