import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBible } from "../../contexts/BibleContext";
import { formatShortRef } from "../../utils/bibleParser";
import { getHighlight, saveHighlight } from "../../utils/storage";

const MAROON   = "#7B1515";
const DARK_BLU = "#160A47";
const HIGHLIGHTS = ["#FFF3CC","#D4F5E2","#D4E8F5","#F5D4E8","#E5D4F5"];

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <Text style={styles.verseText}>{text}</Text>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <Text style={styles.verseText}>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <Text key={i} style={styles.searchHL}>{p}</Text>
          : <Text key={i}>{p}</Text>
      )}
    </Text>
  );
}

interface Props {
  book: string; chapter: number; verse: number; text: string;
  onInsertToNote?: (book:string, ch:number, vs:number, text:string, abbr:string) => void;
  searchQuery?: string;
}

export default function VerseCard({ book, chapter, verse, text, onInsertToNote, searchQuery="" }: Props) {
  const { manifest, globalTranslation, verseOverrides, getVerseText, switchVerseTranslation } = useBible();
  const [menuVisible, setMenuVisible] = useState(false);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const storeKey = `${book}:${chapter}:${verse}`;

  useEffect(() => {
    getHighlight(storeKey).then(setBgColor);
  }, [storeKey]);

  const setHL = async (color: string | null) => {
    const next = bgColor === color ? null : color;
    setBgColor(next);
    await saveHighlight(storeKey, next);
    setMenuVisible(false);
  };

  const activeTrans = verseOverrides[storeKey] || globalTranslation;
  const displayText = getVerseText(book, chapter, verse) ?? text;
  const shortRef    = formatShortRef(book, chapter, verse);

  return (
    <View style={[styles.card, bgColor ? { backgroundColor: bgColor } : null]}>
      {/* Ref row */}
      <View style={styles.refRow}>
        <Text style={styles.ref}>{shortRef}</Text>
        <TouchableOpacity onPress={() => setMenuVisible(v => !v)} style={styles.menuBtn}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Context menu */}
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
            <Ionicons name="copy-outline" size={15} color="#374151" />
            <Text style={styles.menuText}>Copy verse</Text>
          </TouchableOpacity>
          {onInsertToNote && (
            <TouchableOpacity style={styles.menuItem}
              onPress={() => { onInsertToNote(book, chapter, verse, displayText||"", activeTrans); setMenuVisible(false); }}>
              <Ionicons name="pencil-outline" size={15} color="#374151" />
              <Text style={styles.menuText}>Add to note</Text>
            </TouchableOpacity>
          )}
          <View style={styles.hlRow}>
            <Text style={styles.hlLabel}>Highlight</Text>
            {HIGHLIGHTS.map(c => (
              <Pressable key={c} onPress={() => setHL(c)}
                style={[styles.hlDot, { backgroundColor: c }, bgColor===c && styles.hlDotActive]} />
            ))}
            {bgColor && (
              <Pressable onPress={() => setHL(null)} style={[styles.hlDot, { backgroundColor: "#F3F4F6" }]}>
                <Text style={styles.hlX}>×</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Verse text */}
      <HighlightText text={displayText ?? "Not in this translation"} query={searchQuery} />

      {/* Translation row */}
      <View style={styles.transRow}>
        {manifest.map(t => (
          <TouchableOpacity key={t.abbr} onPress={() => switchVerseTranslation(book, chapter, verse, t.abbr)}>
            <Text style={[styles.transBtn, t.abbr===activeTrans && styles.transBtnActive]}>
              {t.abbr}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:       { paddingHorizontal:20, paddingTop:14, paddingBottom:12, borderBottomWidth:1, borderBottomColor:"#F3F4F6", backgroundColor:"white" },
  refRow:     { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:6 },
  ref:        { fontWeight:"700", fontSize:13, letterSpacing:0.3, color:MAROON },
  menuBtn:    { padding:4 },
  menu:       { backgroundColor:"white", borderRadius:12, borderWidth:1, borderColor:"#F3F4F6", padding:8, marginBottom:8, shadowColor:"#000", shadowOpacity:0.1, shadowRadius:8, elevation:4 },
  menuItem:   { flexDirection:"row", alignItems:"center", gap:8, paddingVertical:8, paddingHorizontal:4 },
  menuText:   { fontSize:14, color:"#374151", fontFamily:"System" },
  hlRow:      { flexDirection:"row", alignItems:"center", gap:6, paddingTop:4, paddingHorizontal:4 },
  hlLabel:    { fontSize:11, color:"#9CA3AF", marginRight:2 },
  hlDot:      { width:22, height:22, borderRadius:11, borderWidth:1.5, borderColor:"#E5E7EB" },
  hlDotActive:{ borderColor:"#374151", transform:[{ scale: 1.15 }] },
  hlX:        { textAlign:"center", color:"#9CA3AF", lineHeight:20, fontSize:14 },
  verseText:  { fontFamily:"Georgia", fontSize:16, lineHeight:28, color:"#111827", marginBottom:10 },
  searchHL:   { backgroundColor:"#FEF3C7", borderRadius:2 },
  transRow:   { flexDirection:"row", flexWrap:"wrap", gap:10 },
  transBtn:   { fontSize:11, fontWeight:"700", color:"#374151", letterSpacing:0.5 },
  transBtnActive: { color:MAROON },
});
