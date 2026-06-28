import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import FontFamily from "@tiptap/extension-font-family";
import { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Quote, Link2,
  AlignLeft, AlignCenter, AlignRight,
  BookOpen, ChevronLeft, Tag, Pin, Save, Loader2,
  ImagePlus, Strikethrough, Type, ChevronDown, X,
  Highlighter,
} from "lucide-react";
import { useNotes, NOTE_CATEGORIES, NOTE_COLORS, HIGHLIGHT_COLORS } from "../../contexts/NotesContext";
import { useBible } from "../../contexts/BibleContext";
import VersePickerModal from "../ui/VersePickerModal";
import clsx from "clsx";
import toast from "react-hot-toast";

const SAVE_DELAY = 1500;

// Custom FontSize TipTap extension
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize || null,
          renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size) => ({ chain }) => chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const FONT_SIZES = ["8px","9px","10px","11px","12px","14px","16px","18px","20px","22px","24px","28px","32px","36px","48px","72px"];
const FONT_FAMILIES = [
  { label: "Inter (Default)", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "EB Garamond", value: "'EB Garamond', Georgia, serif" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
];
const TEXT_COLORS = [
  "#000000","#7B1515","#1D4ED8","#15803D","#D97706","#7C3AED","#DB2777","#6B7280","#ffffff",
];
const HIGHLIGHT_OPTIONS = [
  { bg: "#FFF3CC", label: "Yellow"  },
  { bg: "#D4F5E2", label: "Green"   },
  { bg: "#D4E8F5", label: "Blue"    },
  { bg: "#F5D4E8", label: "Pink"    },
  { bg: "#E5D4F5", label: "Purple"  },
];

// Custom dropdown component
function DropdownMenu({ label, width = "w-40", children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setOpen((p) => !p); }}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 text-xs font-body font-medium border border-gray-200 transition-colors"
      >
        {label}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div
          className={`absolute left-0 top-full mt-1 ${width} bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden`}
          style={{ maxHeight: "220px", overflowY: "auto" }}
        >
          {children(setOpen)}
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={clsx(
        "w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all",
        active ? "text-white" : "text-gray-600 hover:bg-gray-100"
      )}
      style={active ? { background: "#7B1515" } : {}}
    >
      {children}
    </button>
  );
}

function Div() { return <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />; }

export default function NoteEditor({ pendingVerse = null, onVerseClaimed = null, studyNoteId = null }) {
  const { id: routeId } = useParams();
  const id = studyNoteId || routeId;
  const navigate = useNavigate();
  const { notes, createNote, updateNote, deleteNote } = useNotes();
  const { manifest } = useBible();

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
  const [imageUrl, setImageUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const saveTimer = useRef(null);
  const isNew = id === "new";

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
      FontFamily,
      FontSize,
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: "Begin writing your gospel notes… let the Spirit guide your pen." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: note?.content ?? null,
    editorProps: {
      attributes: { class: "outline-none leading-relaxed min-h-[60vh] px-4 py-4 font-body text-gray-800" },
    },
  });

  useEffect(() => {
    if (editor && note?.content && editor.isEmpty) {
      editor.commands.setContent(note.content);
    }
  }, [editor, note]);

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
    } finally { setSaving(false); }
  }, [editor, title, category, tags, color, isPinned, isNew, note, createNote, updateNote, navigate]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => { clearTimeout(saveTimer.current); saveTimer.current = setTimeout(save, SAVE_DELAY); };
    editor.on("update", handler);
    return () => { editor.off("update", handler); clearTimeout(saveTimer.current); };
  }, [editor, save]);

  // Handle verse from StudyPage
  useEffect(() => {
    if (pendingVerse && editor && !editor.isDestroyed) {
      const { book, chapter, verse, text, abbr } = pendingVerse;
      insertVerse(book, chapter, verse, text, abbr);
      onVerseClaimed?.();
    }
  }, [pendingVerse, editor]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, SAVE_DELAY);
  };

  const addTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
      if (tag && !tags.includes(tag)) setTags((p) => [...p, tag]);
      setTagInput("");
    }
  };

  const insertVerse = useCallback((book, chapter, verse, text, abbr) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: "blockquote",
      content: [
        { type: "paragraph", content: [{ type: "text", text, marks: [{ type: "italic" }] }] },
        { type: "paragraph", content: [{ type: "text", text: `— ${book} ${chapter}:${verse} (${abbr})` }] },
      ],
    }).run();
    if (note?.id) updateNote(note.id, { bibleRefs: [...(note.bibleRefs ?? []), `${book} ${chapter}:${verse}`] });
    setVersePicker(false);
    toast.success(`${book} ${chapter}:${verse} inserted`);
  }, [editor, note, updateNote]);

  const insertImage = () => {
    if (!imageUrl.trim() || !editor) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageDialog(false);
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.chain().focus().setImage({ src: ev.target.result }).run();
    };
    reader.readAsDataURL(file);
    setShowImageDialog(false);
  };

  const colorStyle = NOTE_COLORS.find((c) => c.id === color) ?? NOTE_COLORS[0];

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full" style={{ background: colorStyle.bg }}>
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => navigate(studyNoteId ? "/study" : "/notes")}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title…"
          className="flex-1 bg-transparent font-display text-lg font-semibold text-scripture placeholder-gray-300 outline-none min-w-0"
        />
        <div className="flex items-center gap-1.5 shrink-0">
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
          ) : (
            <span className="text-[10px] font-body text-gray-300">Saved</span>
          )}
          <button onClick={() => setShowMeta((p) => !p)} title="Settings"
            className={clsx("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              showMeta ? "text-white" : "text-gray-400 hover:bg-gray-100")}
            style={showMeta ? { background: "#7B1515" } : {}}
          >
            <Tag className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setIsPinned((p) => !p); save(); }} title="Pin"
            className={clsx("w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              isPinned ? "bg-gold/20 text-gold" : "text-gray-400 hover:bg-gray-100")}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button onClick={save} title="Save"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
            style={{ background: "#7B1515" }}
          >
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta panel */}
      {showMeta && (
        <div className="flex flex-wrap gap-4 px-4 py-3 bg-white border-b border-gray-100">
          <div className="space-y-1">
            <label className="text-[10px] font-body text-gray-400 uppercase tracking-widest">Category</label>
            <div className="flex gap-1.5 flex-wrap">
              {NOTE_CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={clsx("text-xs font-body px-2.5 py-1 rounded-lg transition-all",
                    category === cat.id ? "font-semibold" : "opacity-40 hover:opacity-70")}
                  style={{ color: cat.color, background: cat.bg }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-body text-gray-400 uppercase tracking-widest">Color</label>
            <div className="flex gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button key={c.id} onClick={() => setColor(c.id)}
                  className={clsx("w-5 h-5 rounded-full border-2 transition-all",
                    color === c.id ? "scale-125" : "border-transparent")}
                  style={{ background: c.bg, borderColor: color === c.id ? c.border : "transparent" }}
                />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-body text-gray-400 uppercase tracking-widest">Tags</label>
            <div className="flex flex-wrap gap-1 items-center">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs text-royal bg-royal/8 px-2 py-0.5 rounded-full font-body">
                  #{tag}
                  <button onClick={() => setTags((p) => p.filter((t) => t !== tag))} className="text-royal/50 hover:text-red-400">×</button>
                </span>
              ))}
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder="Add tag…" className="text-xs font-body outline-none bg-transparent placeholder-gray-300 w-20" />
            </div>
          </div>
        </div>
      )}

      {/* ── TOOLBAR (MS WORD STYLE) ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[52px] z-10 overflow-x-auto">
        {/* Row 1: Font family, size, styles */}
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-gray-50 min-w-max">
          {/* Style dropdown */}
          <DropdownMenu label="Style" width="w-44">
            {(close) => (
              <>
                {[
                  { label: "Normal", cmd: () => editor.chain().focus().setParagraph().run() },
                  { label: "Heading 1", cmd: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
                  { label: "Heading 2", cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
                  { label: "Heading 3", cmd: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
                ].map(({ label, cmd }) => (
                  <button key={label} onMouseDown={(e) => { e.preventDefault(); cmd(); close(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 font-body text-gray-700">
                    {label}
                  </button>
                ))}
              </>
            )}
          </DropdownMenu>

          {/* Font family dropdown */}
          <DropdownMenu label="Font" width="w-52">
            {(close) => (
              <>
                {FONT_FAMILIES.map((f) => (
                  <button key={f.value}
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setFontFamily(f.value).run(); close(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    style={{ fontFamily: f.value, color: "#374151" }}
                  >
                    {f.label}
                  </button>
                ))}
              </>
            )}
          </DropdownMenu>

          {/* Font size dropdown */}
          <DropdownMenu label="Size" width="w-24">
            {(close) => (
              <>
                {FONT_SIZES.map((s) => (
                  <button key={s}
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setFontSize(s).run(); close(false); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 font-body text-sm text-gray-700"
                  >
                    {s.replace("px", "")}
                  </button>
                ))}
              </>
            )}
          </DropdownMenu>

          <Div />

          {/* Text Color */}
          <div className="relative group">
            <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100" title="Text Color">
              <Type className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute left-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-2 grid grid-cols-5 gap-1 hidden group-focus-within:grid group-hover:grid" style={{ width: "120px" }}>
              {TEXT_COLORS.map((c) => (
                <button key={c} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
                  className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                  style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Formatting buttons */}
        <div className="flex items-center gap-0.5 px-3 py-1.5 min-w-max overflow-x-auto">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
            <Bold className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
            <Italic className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarBtn>

          <Div />

          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
            <List className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
            <Quote className="w-3.5 h-3.5" />
          </ToolbarBtn>

          <Div />

          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Left">
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Right">
            <AlignRight className="w-3.5 h-3.5" />
          </ToolbarBtn>

          <Div />

          {/* Highlights */}
          {HIGHLIGHT_OPTIONS.map((h) => (
            <button key={h.bg} type="button" title={`Highlight ${h.label}`}
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: h.bg }).run(); }}
              className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform shrink-0"
              style={{ background: h.bg }} />
          ))}

          <Div />

          {/* Image insert */}
          <button type="button" title="Insert Image"
            onMouseDown={(e) => { e.preventDefault(); setShowImageDialog(true); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ImagePlus className="w-3.5 h-3.5" />
          </button>

          <Div />

          {/* Insert Bible verse */}
          <button type="button"
            onMouseDown={(e) => { e.preventDefault(); setVersePicker(true); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white text-xs font-body font-medium shrink-0"
            style={{ background: "#7B1515" }}
          >
            <BookOpen className="w-3 h-3" /> Verse
          </button>
        </div>
      </div>

      {/* ── EDITOR BODY ── */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="prose prose-sm max-w-none
          prose-headings:font-display prose-headings:text-scripture
          prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:bg-amber-50/40
          prose-blockquote:pl-4 prose-blockquote:rounded-r-lg
          prose-img:rounded-xl prose-img:shadow-md prose-img:max-w-full
          prose-a:text-royal" />
      </div>

      {/* Image dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-scripture">Insert Image</h3>
              <button onClick={() => setShowImageDialog(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex gap-3">
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL…"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body outline-none focus:border-red-900/50" />
              <button onMouseDown={(e) => { e.preventDefault(); insertImage(); }}
                className="px-4 py-2.5 rounded-xl text-sm font-body font-medium text-white"
                style={{ background: "#7B1515" }}>
                Insert
              </button>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 font-body mb-2">or upload from device</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-900/30 cursor-pointer text-sm font-body text-gray-500 transition-colors">
                <ImagePlus className="w-4 h-4" />
                Choose file
                <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Verse picker modal */}
      {versePicker && (
        <VersePickerModal onClose={() => setVersePicker(false)} onInsert={insertVerse} />
      )}
    </div>
  );
}
