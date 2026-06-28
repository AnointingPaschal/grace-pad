import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
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
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Extension } from "@tiptap/core";
import {
  useEffect, useCallback, useState, useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bold, Italic, Underline as ULIcon, Strikethrough, Subscript as SubIcon,
  Superscript as SupIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListTodo, Quote, Code2, Minus, Image as ImgIcon,
  Link2, Table2, Eraser, Undo2, Redo2, ChevronLeft, Tag, Pin, Save,
  Loader2, BookOpen, X, Type, Highlighter, ChevronDown,
} from "lucide-react";
import { useNotes, NOTE_CATEGORIES, NOTE_COLORS, HIGHLIGHT_COLORS } from "../../contexts/NotesContext";
import { useBible } from "../../contexts/BibleContext";
import VersePickerModal from "../ui/VersePickerModal";
import toast from "react-hot-toast";

const SAVE_DELAY = 1500;

// FontSize custom extension
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() { return { types: ["textStyle"] }; },
  addGlobalAttributes() {
    return [{ types: this.options.types, attributes: {
      fontSize: {
        default: null,
        parseHTML: el => el.style.fontSize || null,
        renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
      },
    }}];
  },
  addCommands() {
    return {
      setFontSize: size => ({ chain }) => chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const FONT_SIZES = ["8","9","10","11","12","14","16","18","20","22","24","28","32","36","48","72"];
const FONTS = [
  { label:"Default", value:"Inter, sans-serif" },
  { label:"Georgia", value:"Georgia, serif" },
  { label:"EB Garamond", value:"'EB Garamond', serif" },
  { label:"Playfair Display", value:"'Playfair Display', serif" },
  { label:"Courier New", value:"'Courier New', monospace" },
  { label:"Arial", value:"Arial, sans-serif" },
  { label:"Times New Roman", value:"'Times New Roman', serif" },
];
const TEXT_COLORS  = ["#000","#7B1515","#1D4ED8","#15803D","#B45309","#7C3AED","#DB2777","#374151","#fff"];
const HL_COLORS    = ["#FFF3CC","#D4F5E2","#D4E8F5","#F5D4E8","#E5D4F5","transparent"];

// Small custom dropdown
function Picker({ trigger, children, width = "w-40" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative inline-block">
      <div onMouseDown={e => { e.preventDefault(); setOpen(p => !p); }}>{trigger}</div>
      {open && (
        <div className={`absolute left-0 top-full mt-0.5 ${width} bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto`}>
          {children(setOpen)}
        </div>
      )}
    </div>
  );
}

function Btn({ onClick, active, title, children, className = "" }) {
  return (
    <button type="button" title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all shrink-0 ${
        active ? "text-white" : "text-gray-600 hover:bg-gray-100"
      } ${className}`}
      style={active ? { background:"#160A47" } : {}}>
      {children}
    </button>
  );
}

function Sep() { return <div className="w-px h-4 bg-gray-200 mx-0.5 shrink-0" />; }

export default function NoteEditor({ pendingVerse = null, onVerseClaimed = null, studyNoteId = null }) {
  const { id: routeId } = useParams();
  const id = studyNoteId || routeId;
  const navigate = useNavigate();
  const { notes, createNote, updateNote, deleteNote } = useNotes();
  const { manifest } = useBible();

  const [note,     setNote]     = useState(null);
  const [title,    setTitle]    = useState("");
  const [category, setCategory] = useState("general");
  const [tags,     setTags]     = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [color,    setColor]    = useState("white");
  const [isPinned, setIsPinned] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [versePicker, setVersePicker] = useState(false);
  const [showMeta,    setShowMeta]    = useState(false);
  const [imgDialog,   setImgDialog]   = useState(false);
  const [imgUrl,      setImgUrl]      = useState("");
  const [linkDialog,  setLinkDialog]  = useState(false);
  const [linkUrl,     setLinkUrl]     = useState("");
  const saveTimer = useRef(null);
  const isNew = id === "new";

  useEffect(() => {
    if (isNew) { setNote(null); setTitle(""); setCategory("general"); setTags([]); setColor("white"); setIsPinned(false); return; }
    const found = notes.find(n => n.id === id);
    if (found) { setNote(found); setTitle(found.title ?? ""); setCategory(found.category ?? "general"); setTags(found.tags ?? []); setColor(found.color ?? "white"); setIsPinned(found.isPinned ?? false); }
  }, [id, notes, isNew]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline, Subscript, Superscript,
      FontFamily, FontSize, TextStyle, Color,
      Placeholder.configure({ placeholder: "Begin writing your gospel notes… let the Spirit guide your pen." }),
      TextAlign.configure({ types: ["heading","paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      CharacterCount,
      Table.configure({ resizable: false }),
      TableRow, TableHeader, TableCell,
      TaskList, TaskItem.configure({ nested: true }),
    ],
    content: note?.content ?? null,
    editorProps: {
      attributes: { class: "outline-none leading-relaxed min-h-[60vh] px-4 py-4 font-body text-gray-800 text-sm" },
    },
  });

  useEffect(() => {
    if (editor && note?.content && editor.isEmpty) editor.commands.setContent(note.content);
  }, [editor, note]);

  const save = useCallback(async () => {
    if (!editor) return;
    setSaving(true);
    try {
      const content = editor.getJSON();
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
    const h = () => { clearTimeout(saveTimer.current); saveTimer.current = setTimeout(save, SAVE_DELAY); };
    editor.on("update", h);
    return () => { editor.off("update", h); clearTimeout(saveTimer.current); };
  }, [editor, save]);

  // Pending verse from StudyPage
  useEffect(() => {
    if (pendingVerse && editor && !editor.isDestroyed) {
      const { book, chapter, verse, text, abbr } = pendingVerse;
      insertVerse(book, chapter, verse, text, abbr);
      onVerseClaimed?.();
    }
  }, [pendingVerse, editor]);

  const handleTitleChange = e => {
    setTitle(e.target.value);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, SAVE_DELAY);
  };

  const insertVerse = useCallback((book, chapter, verse, text, abbr) => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type:"blockquote",
      content:[
        { type:"paragraph", content:[{ type:"text", text, marks:[{ type:"italic" }] }] },
        { type:"paragraph", content:[{ type:"text", text:`— ${book} ${chapter}:${verse} (${abbr})` }] },
      ],
    }).run();
    setVersePicker(false);
    toast.success(`${book} ${chapter}:${verse} inserted`);
  }, [editor]);

  const insertImage = () => {
    if (imgUrl.trim() && editor) { editor.chain().focus().setImage({ src: imgUrl }).run(); setImgUrl(""); setImgDialog(false); }
  };

  const handleImgFile = e => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const r = new FileReader();
    r.onload = ev => { editor.chain().focus().setImage({ src: ev.target.result }).run(); };
    r.readAsDataURL(file);
    setImgDialog(false);
  };

  const insertLink = () => {
    if (!editor) return;
    if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
    else editor.chain().focus().unsetLink().run();
    setLinkUrl(""); setLinkDialog(false);
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows:3, cols:3, withHeaderRow:true }).run();
  };

  const colorStyle = NOTE_COLORS.find(c => c.id === color) ?? NOTE_COLORS[0];

  if (!editor) return null;

  // Shared toolbar button groups
  const renderToolbar = (bubbleMode = false) => {
    const sz = bubbleMode ? "w-6 h-6" : "w-7 h-7";
    const ic = bubbleMode ? "w-3 h-3" : "w-3.5 h-3.5";
    return (
      <>
        {/* Clear formatting */}
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting" className={sz}>
          <Eraser className={ic} />
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold" className={sz}>
          <Bold className={ic} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic" className={sz}>
          <Italic className={ic} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline" className={sz}>
          <ULIcon className={ic} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough" className={sz}>
          <Strikethrough className={ic} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript" className={sz}>
          <SubIcon className={ic} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript" className={sz}>
          <SupIcon className={ic} />
        </Btn>
        <Sep />
        {/* Text colour */}
        <Picker width="w-36" trigger={
          <button type="button" className={`${sz} rounded flex items-center justify-center hover:bg-gray-100`} title="Text colour">
            <Type className={ic} style={{ color: editor.getAttributes("textStyle").color || "#000" }} />
          </button>
        }>
          {close => (
            <div className="p-2 grid grid-cols-6 gap-1">
              {TEXT_COLORS.map(c => (
                <button key={c} onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); close(false); }}
                  className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110"
                  style={{ background: c }} />
              ))}
            </div>
          )}
        </Picker>
        {/* Highlight */}
        <Picker width="w-36" trigger={
          <button type="button" className={`${sz} rounded flex items-center justify-center hover:bg-gray-100`} title="Highlight">
            <Highlighter className={ic} />
          </button>
        }>
          {close => (
            <div className="p-2 grid grid-cols-6 gap-1">
              {HL_COLORS.map(c => (
                <button key={c} onMouseDown={e => { e.preventDefault(); c === "transparent" ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().toggleHighlight({ color: c }).run(); close(false); }}
                  className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110"
                  style={{ background: c === "transparent" ? "#fff" : c }}>
                  {c === "transparent" && <X className="w-2.5 h-2.5 text-gray-400 mx-auto" />}
                </button>
              ))}
            </div>
          )}
        </Picker>
        <Sep />
        {/* Link */}
        <Btn onClick={() => setLinkDialog(true)} active={editor.isActive("link")} title="Link" className={sz}>
          <Link2 className={ic} />
        </Btn>
        {/* Verse insert */}
        <button type="button" onMouseDown={e => { e.preventDefault(); setVersePicker(true); }}
          className={`${bubbleMode ? "px-2 h-6" : "px-2.5 h-7"} rounded font-body font-semibold text-white text-[10px] flex items-center gap-1 shrink-0`}
          style={{ background:"#7B1515" }}>
          <BookOpen className="w-3 h-3" /> Verse
        </button>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── TOP BAR ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white sticky top-0 z-20">
        <button onClick={() => navigate(studyNoteId ? "/study" : "/notes")} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <input value={title} onChange={handleTitleChange} placeholder="Note title…"
          className="flex-1 bg-transparent font-display text-base font-semibold text-gray-800 placeholder-gray-300 outline-none min-w-0" />
        <div className="flex items-center gap-1.5 shrink-0">
          {saving
            ? <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
            : <span className="text-[10px] font-body text-gray-300">Saved</span>}
          <button onClick={() => setShowMeta(p => !p)} title="Note settings"
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${showMeta ? "text-white" : "text-gray-400 hover:bg-gray-100"}`}
            style={showMeta ? { background:"#160A47" } : {}}>
            <Tag className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setIsPinned(p => !p); save(); }} title="Pin"
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${isPinned ? "bg-amber-100 text-amber-600" : "text-gray-400 hover:bg-gray-100"}`}>
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button onClick={save} className="w-7 h-7 rounded flex items-center justify-center text-white" style={{ background:"#160A47" }}>
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── META ── */}
      {showMeta && (
        <div className="flex flex-wrap gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="space-y-1">
            <p className="text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest">Category</p>
            <div className="flex gap-1 flex-wrap">
              {NOTE_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)}
                  className={`text-xs font-body px-2 py-0.5 rounded-lg transition-all ${category===cat.id?"font-bold":"opacity-40"}`}
                  style={{ color:cat.color, background:cat.bg }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest">Color</p>
            <div className="flex gap-1.5">
              {NOTE_COLORS.map(c => (
                <button key={c.id} onClick={() => setColor(c.id)}
                  className={`w-5 h-5 rounded-full border-2 ${color===c.id?"scale-125":""}`}
                  style={{ background:c.bg, borderColor:color===c.id?c.border:"transparent" }} />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-[9px] font-body font-bold text-gray-400 uppercase tracking-widest">Tags</p>
            <div className="flex flex-wrap gap-1 items-center">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-body">
                  #{tag}
                  <button onClick={() => setTags(p => p.filter(t => t !== tag))} className="text-indigo-400">×</button>
                </span>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key==="Enter"||e.key===",") { e.preventDefault(); const t=tagInput.trim().replace(/^#/,"").toLowerCase(); if(t&&!tags.includes(t))setTags(p=>[...p,t]); setTagInput(""); } }}
                placeholder="Add tag…" className="text-xs font-body outline-none bg-transparent placeholder-gray-300 w-20" />
            </div>
          </div>
        </div>
      )}

      {/* ══ TOOLBAR ROW 1 ══ */}
      <div className="border-b border-gray-100 bg-white sticky top-[52px] z-10">
        {/* Row 1: Style + Font + Size + Basic Format */}
        <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-50 overflow-x-auto no-scrollbar min-w-max">
          {/* Style */}
          <Picker width="w-36" trigger={
            <button type="button" className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-xs font-body text-gray-600 hover:bg-gray-50">
              Style <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          }>
            {close => ["Normal","Heading 1","Heading 2","Heading 3"].map((s, i) => (
              <button key={s} onMouseDown={e => { e.preventDefault(); i===0 ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({ level: i }).run(); close(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 font-body"
                style={i===0 ? {} : { fontSize:["1.2em","1.1em","1em"][i-1], fontWeight:700 }}>
                {s}
              </button>
            ))}
          </Picker>
          {/* Font */}
          <Picker width="w-48" trigger={
            <button type="button" className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-xs font-body text-gray-600 hover:bg-gray-50">
              Font <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          }>
            {close => FONTS.map(f => (
              <button key={f.value} onMouseDown={e => { e.preventDefault(); editor.chain().focus().setFontFamily(f.value).run(); close(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" style={{ fontFamily:f.value }}>
                {f.label}
              </button>
            ))}
          </Picker>
          {/* Size */}
          <Picker width="w-20" trigger={
            <button type="button" className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 text-xs font-body text-gray-600 hover:bg-gray-50">
              Size <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          }>
            {close => FONT_SIZES.map(s => (
              <button key={s} onMouseDown={e => { e.preventDefault(); editor.chain().focus().setFontSize(s+"px").run(); close(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 font-body">
                {s}
              </button>
            ))}
          </Picker>
          <Sep />
          <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 className="w-3.5 h-3.5" /></Btn>
        </div>

        {/* Row 2: All formatting tools */}
        <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto no-scrollbar min-w-max">
          {renderToolbar()}
          <Sep />
          {/* Alignment */}
          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({textAlign:"left"})} title="Left"><AlignLeft className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({textAlign:"center"})} title="Center"><AlignCenter className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({textAlign:"right"})} title="Right"><AlignRight className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({textAlign:"justify"})} title="Justify"><AlignJustify className="w-3.5 h-3.5" /></Btn>
          <Sep />
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Checklist"><ListTodo className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote"><Quote className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block"><Code2 className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="w-3.5 h-3.5" /></Btn>
          <Sep />
          <Btn onClick={() => setImgDialog(true)} title="Insert image"><ImgIcon className="w-3.5 h-3.5" /></Btn>
          <Btn onClick={insertTable} title="Insert table"><Table2 className="w-3.5 h-3.5" /></Btn>
        </div>
      </div>

      {/* ── EDITOR CONTENT ── */}
      <div className="flex-1 overflow-auto relative">
        {/* Floating BubbleMenu on text selection */}
        <BubbleMenu editor={editor} tippyOptions={{ duration:100 }}>
          <div className="flex items-center gap-0.5 bg-white rounded-xl border border-gray-200 shadow-xl px-1.5 py-1">
            {renderToolbar(true)}
          </div>
        </BubbleMenu>

        <EditorContent editor={editor} className="prose prose-sm max-w-none
          prose-headings:font-display prose-headings:text-gray-800
          prose-blockquote:border-l-4 prose-blockquote:border-amber-400
          prose-blockquote:bg-amber-50/40 prose-blockquote:pl-4 prose-blockquote:rounded-r-lg
          prose-img:rounded-xl prose-img:shadow-md prose-img:max-w-full
          prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
          prose-table:border-collapse prose-td:border prose-td:border-gray-200 prose-td:px-2 prose-td:py-1
          [&_.task-list-item]:list-none [&_.task-list-item_input]:mr-2" />

        {/* Char count */}
        <div className="sticky bottom-0 text-right px-4 py-1 text-[10px] font-body text-gray-300 bg-white/80">
          {editor.storage.characterCount?.characters() ?? 0} chars
        </div>
      </div>

      {/* Image dialog */}
      {imgDialog && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-gray-800">Insert Image</h3>
              <button onClick={() => setImgDialog(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex gap-2">
              <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="Paste image URL…"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body outline-none" />
              <button onMouseDown={e => { e.preventDefault(); insertImage(); }}
                className="px-4 py-2.5 rounded-xl text-sm font-body font-medium text-white" style={{ background:"#160A47" }}>
                Insert
              </button>
            </div>
            <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer text-sm font-body text-gray-400 hover:border-indigo-300">
              <ImgIcon className="w-4 h-4" /> Upload from device
              <input type="file" accept="image/*" className="hidden" onChange={handleImgFile} />
            </label>
          </div>
        </div>
      )}

      {/* Link dialog */}
      {linkDialog && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-gray-800">Insert Link</h3>
              <button onClick={() => setLinkDialog(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex gap-2">
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://…"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body outline-none" />
              <button onMouseDown={e => { e.preventDefault(); insertLink(); }}
                className="px-4 rounded-xl text-sm font-body font-medium text-white" style={{ background:"#160A47" }}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {versePicker && (
        <VersePickerModal onClose={() => setVersePicker(false)} onInsert={insertVerse} />
      )}
    </div>
  );
}
