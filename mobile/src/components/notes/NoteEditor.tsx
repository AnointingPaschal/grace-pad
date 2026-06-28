import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { Ionicons } from "@expo/vector-icons";
import { useNotes, NOTE_CATEGORIES, NOTE_COLORS } from "../../contexts/NotesContext";
import { useBible } from "../../contexts/BibleContext";
import type { Note } from "../../contexts/NotesContext";

const DARK_BLUE = "#160A47";
const MAROON    = "#7B1515";

interface Props {
  note: Note | null;
  noteId: string;
  onBack: () => void;
  pendingVerse?: { book:string;chapter:number;verse:number;text:string;abbr:string } | null;
  onVerseClaimed?: () => void;
}

export default function NoteEditor({ note, noteId, onBack, pendingVerse, onVerseClaimed }: Props) {
  const { updateNote } = useNotes();
  const [title, setTitle] = useState(note?.title ?? "");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(true);
  const editorRef = useRef<RichEditor>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Insert pending verse from Bible reader
  useEffect(() => {
    if (pendingVerse && editorRef.current) {
      const { book, chapter, verse, text, abbr } = pendingVerse;
      const html = `
        <blockquote style="border-left:4px solid #7B1515;background:#FFF8EF;padding:12px 16px;border-radius:0 12px 12px 0;margin:10px 0;font-style:italic;font-family:Georgia,serif">
          <p style="color:#1F2937;line-height:1.8;margin:0 0 6px 0">${text}</p>
          <p style="font-size:12px;font-style:normal;font-weight:700;color:#7B1515;margin:0">${book} ${chapter}:${verse} · ${abbr}</p>
        </blockquote>
      `;
      editorRef.current.insertHTML(html);
      onVerseClaimed?.();
    }
  }, [pendingVerse]);

  const triggerSave = useCallback(async () => {
    if (!noteId) return;
    setSaving(true);
    try {
      const content = await editorRef.current?.getContentHtml() ?? "";
      await updateNote(noteId, { title, content });
      setSaved(true);
    } catch (e) { console.error(e); }
    setSaving(false);
  }, [noteId, title, updateNote]);

  const handleChange = () => {
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(triggerSave, 1500);
  };

  const handleTitleChange = (t: string) => {
    setTitle(t);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(triggerSave, 1000);
  };

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS==="ios"?"padding":undefined}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#374151" />
        </TouchableOpacity>
        <TextInput
          value={title}
          onChangeText={handleTitleChange}
          placeholder="Note title…"
          placeholderTextColor="#D1D5DB"
          style={s.titleInput}
        />
        <Text style={s.saveStatus}>{saving ? "Saving…" : saved ? "Saved" : "Unsaved"}</Text>
        <TouchableOpacity onPress={triggerSave} style={[s.saveBtn, { backgroundColor: DARK_BLUE }]}>
          <Ionicons name="save-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Rich Toolbar */}
      <RichToolbar
        editor={editorRef}
        actions={[
          actions.setBold, actions.setItalic, actions.setUnderline, actions.setStrikethrough,
          actions.separator,
          actions.insertBulletsList, actions.insertOrderedList,
          actions.separator,
          actions.blockquote,
          actions.separator,
          actions.setTextColor, actions.setTextBackgroundColor,
          actions.separator,
          actions.heading1, actions.heading2,
          actions.separator,
          actions.undo, actions.redo,
        ]}
        style={s.toolbar}
        selectedButtonStyle={{ backgroundColor: "#E8EAF6", borderRadius:6 }}
        selectedIconTint={DARK_BLUE}
        iconTint="#374151"
        onPressAddImage={() => {
          Alert.prompt("Image URL", "Enter image URL", (url) => {
            if (url) editorRef.current?.insertImage(url);
          });
        }}
      />

      {/* Editor */}
      <ScrollView style={{ flex:1 }}>
        <RichEditor
          ref={editorRef}
          initialContentHTML={note?.content ?? ""}
          placeholder="Begin writing your gospel notes… let the Spirit guide your pen."
          style={s.editor}
          editorStyle={{
            color: "#111827",
            fontSize: 15,
            lineHeight: 26,
            fontFamily: "Georgia",
            backgroundColor: "white",
            contentCSSText: `
              blockquote {
                border-left: 4px solid #7B1515;
                background: linear-gradient(135deg, #FFF8EF, #FFF0F5);
                padding: 12px 16px;
                border-radius: 0 12px 12px 0;
                margin: 12px 0;
                font-style: italic;
                font-family: Georgia, serif;
              }
              blockquote p:last-child {
                font-size: 12px;
                font-style: normal;
                font-weight: 700;
                color: #7B1515;
                margin-top: 6px;
              }
            `,
          }}
          onChange={handleChange}
          useContainer={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  topBar:    { flexDirection:"row", alignItems:"center", gap:8, paddingHorizontal:12, paddingVertical:10, borderBottomWidth:1, borderBottomColor:"#F3F4F6", backgroundColor:"white" },
  backBtn:   { padding:4 },
  titleInput:{ flex:1, fontSize:16, fontWeight:"700", color:"#111827", fontFamily:"Georgia", padding:0 },
  saveStatus:{ fontSize:10, color:"#D1D5DB" },
  saveBtn:   { width:32, height:32, borderRadius:8, alignItems:"center", justifyContent:"center" },
  toolbar:   { backgroundColor:"white", borderBottomWidth:1, borderBottomColor:"#F3F4F6", flexWrap:"wrap", minHeight:44 },
  editor:    { flex:1, backgroundColor:"white", minHeight:400 },
});
