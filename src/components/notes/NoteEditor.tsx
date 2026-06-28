import { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { Ionicons } from "@expo/vector-icons";
import { useNotes } from "../../contexts/NotesContext";
import { NOTE_CATEGORIES, NOTE_COLORS } from "../../constants";
import { C } from "../../constants";
import type { Note } from "../../contexts/NotesContext";
import VersePickerModal from "../bible/VersePickerModal";

interface P { note:Note|null; noteId:string; onBack():void; pendingVerse?:any; onVerseClaimed?():void; }

export default function NoteEditor({ note, noteId, onBack, pendingVerse, onVerseClaimed }: P) {
  const { updateNote } = useNotes();
  const [title,       setTitle]       = useState(note?.title??"");
  const [category,    setCategory]    = useState(note?.category??"general");
  const [color,       setColor]       = useState(note?.color??"white");
  const [isPinned,    setIsPinned]    = useState(note?.isPinned??false);
  const [showMeta,    setShowMeta]    = useState(false);
  const [showVPicker, setShowVPicker] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const editorRef = useRef<RichEditor>(null);
  const saveTimer = useRef<any>();

  // Insert pending verse from Bible page
  useEffect(() => {
    if (pendingVerse && editorRef.current) {
      const { book, chapter, verse, text, abbr } = pendingVerse;
      const html = `<blockquote style="border-left:4px solid ${C.MAROON};background:#FFF8EF;padding:12px 16px;border-radius:0 12px 12px 0;margin:10px 0"><p style="font-style:italic;color:#1F2937;font-family:Georgia,serif;font-size:16px;line-height:1.7;margin:0 0 6px 0">${text}</p><p style="font-size:12px;font-weight:700;color:${C.MAROON};margin:0">${book} ${chapter}:${verse} · ${abbr}</p></blockquote><p></p>`;
      editorRef.current.insertHTML(html);
      onVerseClaimed?.();
    }
  }, [pendingVerse]);

  const save = useCallback(async () => {
    if (!noteId) return;
    setSaving(true);
    try {
      const content = await editorRef.current?.getContentHtml() ?? "";
      await updateNote(noteId, { title, content, category, color, isPinned });
    } catch(e) { console.error(e); }
    setSaving(false);
  }, [noteId, title, category, color, isPinned, updateNote]);

  const onChange = () => { clearTimeout(saveTimer.current); saveTimer.current = setTimeout(save, 1500); };

  const bgColor = NOTE_COLORS.find(c=>c.id===color)?.bg ?? "#fff";
  const cat = NOTE_CATEGORIES.find(c=>c.id===category);

  return (
    <KeyboardAvoidingView style={[{flex:1,backgroundColor:bgColor}]} behavior={Platform.OS==="ios"?"padding":undefined}>
      {/* ─── TOP BAR ─── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={onBack} hitSlop={8}><Ionicons name="chevron-back" size={22} color="#374151"/></TouchableOpacity>
        <TextInput value={title} onChangeText={t=>{setTitle(t);onChange();}}
          placeholder="Note title…" placeholderTextColor="#D1D5DB"
          style={s.titleIn}/>
        <Text style={s.saveLabel}>{saving?"Saving…":"Saved"}</Text>
        <TouchableOpacity onPress={()=>setShowMeta(m=>!m)} hitSlop={8}>
          <Ionicons name="pricetag-outline" size={18} color={showMeta?C.DARK_BLUE:"#9CA3AF"}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{setIsPinned(p=>!p);onChange();}} hitSlop={8}>
          <Ionicons name="pin" size={18} color={isPinned?"#C8971B":"#9CA3AF"}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={save} style={[s.saveBtn,{backgroundColor:C.DARK_BLUE}]}>
          <Ionicons name="checkmark" size={16} color="#fff"/>
        </TouchableOpacity>
      </View>

      {/* ─── META PANEL ─── */}
      {showMeta && (
        <View style={s.meta}>
          <Text style={s.metaLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>
            <View style={{flexDirection:"row",gap:8}}>
              {NOTE_CATEGORIES.map(c=>(
                <TouchableOpacity key={c.id} onPress={()=>{setCategory(c.id);onChange();}}
                  style={[s.catPill,{backgroundColor:c.bg},category===c.id&&{borderWidth:1.5,borderColor:c.color}]}>
                  <Text style={[s.catTxt,{color:c.color}]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={s.metaLabel}>COLOR</Text>
          <View style={{flexDirection:"row",gap:10}}>
            {NOTE_COLORS.map(c=>(
              <TouchableOpacity key={c.id} onPress={()=>{setColor(c.id);onChange();}}
                style={[s.colorDot,{backgroundColor:c.bg,borderColor:color===c.id?c.border:"#E5E7EB",borderWidth:color===c.id?2:1}]}/>
            ))}
          </View>
        </View>
      )}

      {/* ─── RICH TOOLBAR ─── */}
      <RichToolbar editor={editorRef}
        actions={[
          actions.setBold, actions.setItalic, actions.setUnderline, actions.setStrikethrough,
          "insertVerse", // custom action
          actions.separator,
          actions.insertBulletsList, actions.insertOrderedList,
          actions.separator,
          actions.blockquote, actions.heading1, actions.heading2,
          actions.separator,
          actions.setTextColor, actions.setTextBackgroundColor,
          actions.separator,
          actions.undo, actions.redo,
        ]}
        iconMap={{ insertVerse: ()=>(
          <View style={{flexDirection:"row",alignItems:"center",gap:3,backgroundColor:C.MAROON,borderRadius:6,paddingHorizontal:6,paddingVertical:3}}>
            <Ionicons name="book-outline" size={11} color="#fff"/>
            <Text style={{fontSize:10,color:"#fff",fontWeight:"700"}}>Verse</Text>
          </View>
        )}}
        onPressAddImage={()=>{
          Alert.prompt("Image URL","Enter image URL",(url:string)=>{
            if(url) editorRef.current?.insertImage(url);
          });
        }}
        insertVerse={()=>setShowVPicker(true)}
        style={s.toolbar}
        selectedButtonStyle={{backgroundColor:"#E8EAF6",borderRadius:6}}
        selectedIconTint={C.DARK_BLUE}
        iconTint="#374151"
      />

      {/* ─── EDITOR ─── */}
      <ScrollView style={{flex:1}}>
        <RichEditor ref={editorRef}
          initialContentHTML={note?.content??""}
          placeholder="Begin writing your gospel notes… let the Spirit guide your pen."
          style={[s.editor,{backgroundColor:bgColor}]}
          editorStyle={{
            backgroundColor:bgColor,
            color:"#111827",
            fontSize:15,
            lineHeight:26,
            placeholderColor:"#D1D5DB",
            contentCSSText:`
              body{font-family:Georgia,serif;padding:12px 16px}
              blockquote{border-left:4px solid ${C.MAROON};background:linear-gradient(135deg,#FFF8EF,#FFF0F5);
                padding:12px 16px;border-radius:0 12px 12px 0;margin:12px 0;font-style:italic}
              blockquote p:last-child{font-size:12px;font-style:normal;font-weight:700;color:${C.MAROON}}
            `,
          }}
          onChange={onChange}
          useContainer={false}
        />
      </ScrollView>

      {/* ─── VERSE PICKER MODAL ─── */}
      {showVPicker && (
        <VersePickerModal
          onClose={()=>setShowVPicker(false)}
          onInsert={(book,ch,vs,text,abbr)=>{
            const html = `<blockquote style="border-left:4px solid ${C.MAROON};background:#FFF8EF;padding:12px 16px;border-radius:0 12px 12px 0;margin:10px 0"><p style="font-style:italic;font-family:Georgia,serif;font-size:16px;line-height:1.7;margin:0 0 6px 0">${text}</p><p style="font-size:12px;font-weight:700;color:${C.MAROON};font-style:normal;margin:0">${book} ${ch}:${vs} · ${abbr}</p></blockquote><p></p>`;
            editorRef.current?.insertHTML(html);
            setShowVPicker(false);
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  topBar:    {flexDirection:"row",alignItems:"center",gap:8,paddingHorizontal:12,paddingVertical:10,borderBottomWidth:1,borderBottomColor:"#F3F4F6",backgroundColor:"#fff"},
  titleIn:   {flex:1,fontSize:16,fontWeight:"700",color:"#111827",fontFamily:"serif",padding:0},
  saveLabel: {fontSize:10,color:"#D1D5DB"},
  saveBtn:   {width:30,height:30,borderRadius:8,alignItems:"center",justifyContent:"center"},
  meta:      {padding:14,backgroundColor:"#F9FAFB",borderBottomWidth:1,borderBottomColor:"#E5E7EB"},
  metaLabel: {fontSize:9,fontWeight:"700",color:"#9CA3AF",letterSpacing:1.5,marginBottom:6},
  catPill:   {paddingHorizontal:12,paddingVertical:5,borderRadius:20},
  catTxt:    {fontSize:12,fontWeight:"600"},
  colorDot:  {width:24,height:24,borderRadius:12},
  toolbar:   {backgroundColor:"#fff",borderBottomWidth:1,borderBottomColor:"#F3F4F6",flexWrap:"wrap",minHeight:44},
  editor:    {flex:1,minHeight:400},
});
