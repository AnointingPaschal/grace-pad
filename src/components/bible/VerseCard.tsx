import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBible } from "../../contexts/BibleContext";
import { C } from "../../constants";

const HL_KEY = "gp:highlights";
const HIGHLIGHTS = ["#FFF3CC","#D4F5E2","#D4E8F5","#F5D4E8","#E5D4F5"];

async function getHL(k: string) {
  try { return JSON.parse(await AsyncStorage.getItem(HL_KEY)||"{}")[k]||null; } catch { return null; }
}
async function setHL(k: string, c: string|null) {
  try {
    const a = JSON.parse(await AsyncStorage.getItem(HL_KEY)||"{}");
    if (c) a[k]=c; else delete a[k];
    await AsyncStorage.setItem(HL_KEY, JSON.stringify(a));
  } catch {}
}

function HLText({ text, query }: { text: string; query: string }) {
  if (!query) return <Text style={s.vt}>{text}</Text>;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const parts = text.split(new RegExp(`(${esc})`,"gi"));
  return (
    <Text style={s.vt}>
      {parts.map((p,i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <Text key={i} style={s.hlMark}>{p}</Text>
          : p
      )}
    </Text>
  );
}

interface P {
  book:string; chapter:number; verse:number; text:string;
  onAddToNote?:(book:string,ch:number,vs:number,text:string,abbr:string)=>void;
  searchQuery?:string;
}

export default function VerseCard({ book, chapter, verse, text, onAddToNote, searchQuery="" }: P) {
  const { manifest, globalTranslation, verseOverrides, getVerseText, switchVerseTrans, shortRef } = useBible();
  const [menu,  setMenu]  = useState(false);
  const [bg,    setBg]    = useState<string|null>(null);
  const key = `${book}:${chapter}:${verse}`;

  useEffect(() => { getHL(key).then(setBg); }, [key]);

  const tap_HL = async (c: string) => {
    const next = bg===c ? null : c;
    setBg(next); await setHL(key,next); setMenu(false);
  };

  const activeTrans = verseOverrides[key] || globalTranslation;
  const display = getVerseText(book, chapter, verse) ?? text;
  const ref = shortRef(book, chapter, verse);

  return (
    <View style={[s.card, bg?{backgroundColor:bg}:null]}>
      {/* Ref row */}
      <View style={s.refRow}>
        <Text style={s.ref}>{ref}</Text>
        <TouchableOpacity onPress={()=>setMenu(m=>!m)} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Popup menu */}
      {menu && (
        <View style={s.menu}>
          {onAddToNote && (
            <TouchableOpacity style={s.mi} onPress={()=>{onAddToNote(book,chapter,verse,display||"",activeTrans);setMenu(false);}}>
              <Ionicons name="pencil-outline" size={14} color="#374151"/>
              <Text style={s.mt}>Add to note</Text>
            </TouchableOpacity>
          )}
          <View style={s.hlRow}>
            <Text style={s.hlLabel}>Highlight  </Text>
            {HIGHLIGHTS.map(c=>(
              <TouchableOpacity key={c} onPress={()=>tap_HL(c)}
                style={[s.dot,{backgroundColor:c},bg===c&&s.dotActive]}/>
            ))}
            {bg && <TouchableOpacity onPress={()=>tap_HL(null as any)} style={[s.dot,{backgroundColor:"#F3F4F6"}]}><Text style={{color:"#9CA3AF",fontSize:12,lineHeight:20,textAlign:"center"}}>×</Text></TouchableOpacity>}
          </View>
        </View>
      )}

      {/* Verse text */}
      <HLText text={display || "Not in this translation"} query={searchQuery} />

      {/* Translation row — left aligned, dark, instant */}
      <View style={s.transRow}>
        {manifest.map(t=>(
          <TouchableOpacity key={t.abbr} onPress={()=>switchVerseTrans(book,chapter,verse,t.abbr)}>
            <Text style={[s.tBtn, t.abbr===activeTrans && s.tBtnActive]}>{t.abbr}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card:    {paddingHorizontal:18,paddingTop:14,paddingBottom:10,borderBottomWidth:1,borderBottomColor:"#F3F4F6",backgroundColor:"#fff"},
  refRow:  {flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:6},
  ref:     {fontSize:13,fontWeight:"700",letterSpacing:0.3,color:C.MAROON},
  menu:    {backgroundColor:"#fff",borderRadius:12,borderWidth:1,borderColor:"#F3F4F6",padding:10,marginBottom:8,
            shadowColor:"#000",shadowOpacity:0.1,shadowRadius:6,elevation:4},
  mi:      {flexDirection:"row",alignItems:"center",gap:8,paddingVertical:6},
  mt:      {fontSize:14,color:"#374151"},
  hlRow:   {flexDirection:"row",alignItems:"center",paddingTop:6},
  hlLabel: {fontSize:11,color:"#9CA3AF"},
  dot:     {width:22,height:22,borderRadius:11,borderWidth:1.5,borderColor:"#E5E7EB",marginRight:6},
  dotActive:{borderColor:"#374151",transform:[{scale:1.2}]},
  vt:      {fontFamily:"serif",fontSize:16,lineHeight:28,color:"#111827",marginBottom:10},
  hlMark:  {backgroundColor:"#FEF3C7",borderRadius:2},
  transRow:{flexDirection:"row",flexWrap:"wrap",gap:8},
  tBtn:    {fontSize:11,fontWeight:"700",color:"#374151",letterSpacing:0.3},
  tBtnActive:{color:C.MAROON},
});
