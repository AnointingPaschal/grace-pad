import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS, BIBLE_BOOKS } from "../../utils/bibleBooks";
import { C } from "../../constants";

interface P { onClose():void; onInsert(book:string,ch:number,vs:number,text:string,abbr:string):void; }

export default function VersePickerModal({ onClose, onInsert }: P) {
  const { globalTranslation, manifest, loadedData, getChapCount } = useBible();
  const [step,       setStep]       = useState<"book"|"chapter"|"verse"|"trans">("book");
  const [testament,  setTestament]  = useState<"OT"|"NT">("NT");
  const [book,       setBook]       = useState("");
  const [chapter,    setChapter]    = useState(0);
  const [verseData,  setVerseData]  = useState<{verse:number;text:string}|null>(null);

  const chapCount = book ? getChapCount(book) : 0;
  const data = loadedData[globalTranslation];
  const verses = book && chapter && data
    ? Object.entries(data.books?.[book]?.[chapter]||{}).map(([v,t])=>({verse:+v,text:t as string})).sort((a,b)=>a.verse-b.verse)
    : [];

  const getVerseInTrans = (abbr: string) =>
    loadedData[abbr]?.books?.[book]?.[chapter]?.[verseData?.verse??0] ?? verseData?.text ?? "";

  const goBack = () => {
    if (step==="trans")   setStep("verse");
    else if (step==="verse") setStep("chapter");
    else if (step==="chapter") setStep("book");
    else onClose();
  };

  const TITLE = {book:"Select Book",chapter:`${book}`,verse:`${book} ${chapter}`,trans:`Choose Translation`}[step];

  return (
    <Modal visible animationType="slide" onRequestClose={goBack}>
      <View style={{flex:1,backgroundColor:"#fff"}}>
        {/* Header */}
        <View style={s.hdr}>
          <TouchableOpacity onPress={goBack} hitSlop={8}>
            <Ionicons name={step==="book"?"close":"chevron-back"} size={22} color="#fff"/>
          </TouchableOpacity>
          <Text style={s.title}>{TITLE}</Text>
        </View>

        {/* BOOK */}
        {step==="book" && (
          <View style={{flex:1}}>
            <View style={s.testTabs}>
              {(["OT","NT"] as const).map(t=>(
                <TouchableOpacity key={t} onPress={()=>setTestament(t)}
                  style={[s.testTab, testament===t&&{borderBottomColor:C.DARK_BLUE}]}>
                  <Text style={[s.testTxt, testament===t&&{color:C.DARK_BLUE}]}>
                    {t==="OT"?"Old Testament":"New Testament"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <FlatList numColumns={2} data={testament==="OT"?OT_BOOKS:NT_BOOKS} keyExtractor={b=>b.code}
              columnWrapperStyle={{gap:1}} contentContainerStyle={{gap:1}}
              renderItem={({item})=>(
                <TouchableOpacity style={s.bkRow} onPress={()=>{setBook(item.name);setStep("chapter");}}>
                  <Text style={s.bkTxt}>{item.name}</Text>
                </TouchableOpacity>
              )}/>
          </View>
        )}

        {/* CHAPTER */}
        {step==="chapter" && (
          <FlatList numColumns={6} data={Array.from({length:chapCount},(_,i)=>i+1)} keyExtractor={c=>`c${c}`}
            columnWrapperStyle={{gap:8,paddingHorizontal:16}} contentContainerStyle={{gap:8,paddingTop:16,paddingBottom:40}}
            renderItem={({item})=>(
              <TouchableOpacity style={[s.numBtn,item===chapter&&s.numBtnAct]}
                onPress={()=>{setChapter(item);setStep("verse");}}>
                <Text style={[s.numTxt,item===chapter&&{color:C.DARK_BLUE}]}>{item}</Text>
              </TouchableOpacity>
            )}/>
        )}

        {/* VERSE */}
        {step==="verse" && (
          <FlatList data={verses} keyExtractor={v=>`v${v.verse}`}
            renderItem={({item})=>(
              <TouchableOpacity style={s.vsRow}
                onPress={()=>{setVerseData(item);setStep("trans");}}>
                <Text style={s.vsNum}>{item.verse}</Text>
                <Text style={s.vsTxt}>{item.text}</Text>
              </TouchableOpacity>
            )}/>
        )}

        {/* TRANSLATION */}
        {step==="trans" && (
          <>
            <View style={s.transHint}><Text style={s.transHintTxt}>Tap a translation to insert it</Text></View>
            <FlatList data={manifest} keyExtractor={t=>t.abbr}
              renderItem={({item})=>{
                const text = getVerseInTrans(item.abbr);
                return (
                  <TouchableOpacity style={s.transRow}
                    onPress={()=>onInsert(book,chapter,verseData!.verse,text,item.abbr)}>
                    <View style={{width:48}}>
                      <Text style={[s.transAbbr,item.abbr===globalTranslation&&{color:C.MAROON}]}>{item.abbr}</Text>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={s.transName}>{item.name}</Text>
                      <Text style={s.transVerse} numberOfLines={3}>{text||"Loading…"}</Text>
                    </View>
                    {item.abbr===globalTranslation&&<Ionicons name="checkmark-circle" size={16} color="#15803D"/>}
                  </TouchableOpacity>
                );
              }}/>
          </>
        )}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  hdr:         {flexDirection:"row",alignItems:"center",gap:12,paddingHorizontal:16,paddingVertical:14,backgroundColor:C.DARK_BLUE},
  title:       {fontSize:17,fontWeight:"700",color:"#fff",fontFamily:"serif",flex:1},
  testTabs:    {flexDirection:"row",borderBottomWidth:1,borderBottomColor:"#E5E7EB"},
  testTab:     {flex:1,paddingVertical:12,alignItems:"center",borderBottomWidth:2,borderBottomColor:"transparent"},
  testTxt:     {fontSize:13,fontWeight:"600",color:"#9CA3AF"},
  bkRow:       {flex:1,paddingVertical:12,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
  bkTxt:       {fontSize:14,color:"#374151"},
  numBtn:      {flex:1,aspectRatio:1,borderRadius:10,borderWidth:1.5,borderColor:"#E5E7EB",alignItems:"center",justifyContent:"center",minWidth:48,backgroundColor:"#FAFAFA"},
  numBtnAct:   {backgroundColor:"#EEF2FF",borderColor:C.DARK_BLUE},
  numTxt:      {fontSize:14,fontWeight:"700",color:"#374151"},
  vsRow:       {flexDirection:"row",gap:12,paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
  vsNum:       {fontSize:12,fontWeight:"700",color:C.MAROON,width:24,textAlign:"right",marginTop:3},
  vsTxt:       {flex:1,fontSize:15,color:"#374151",fontFamily:"serif",lineHeight:24},
  transHint:   {paddingHorizontal:16,paddingVertical:10,backgroundColor:"#F9FAFB",borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
  transHintTxt:{fontSize:12,color:"#9CA3AF"},
  transRow:    {flexDirection:"row",alignItems:"flex-start",gap:12,paddingHorizontal:16,paddingVertical:14,borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
  transAbbr:   {fontSize:13,fontWeight:"700",color:C.DARK_BLUE},
  transName:   {fontSize:11,color:"#9CA3AF",marginBottom:4},
  transVerse:  {fontSize:14,color:"#374151",fontFamily:"serif",lineHeight:22},
});
