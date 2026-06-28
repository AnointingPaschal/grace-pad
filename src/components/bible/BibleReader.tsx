import { useRef, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useBible } from "../../contexts/BibleContext";
import { OT_BOOKS, NT_BOOKS, BIBLE_BOOKS } from "../../utils/bibleBooks";
import { C } from "../../constants";
import VerseCard from "./VerseCard";

const OT_SET = new Set(OT_BOOKS.map(b=>b.name));
const NT_SET = new Set(NT_BOOKS.map(b=>b.name));

export default function BibleReader({ onAddToNote }: { onAddToNote?: (...a:any[])=>void }) {
  const { currentBook, currentChapter, currentVerses, totalChapters,
    isLoading, globalTranslation, navigateTo, activeSheet, setActiveSheet,
    globalSearch, setGlobalSearch, doSearch, getChapCount } = useBible();

  const [testTab,      setTestTab]      = useState<"OT"|"NT">("NT");
  const [searchFilter, setSearchFilter] = useState<"ALL"|"OT"|"NT">("ALL");
  const [searchRes,    setSearchRes]    = useState<any[]>([]);
  const bookSh  = useRef<BottomSheet>(null);
  const chapSh  = useRef<BottomSheet>(null);
  const verseSh = useRef<BottomSheet>(null);
  const listRef = useRef<FlatList>(null);
  const debRef  = useRef<any>();

  // Context-driven sheet open (from bottom nav)
  useEffect(() => {
    if (!activeSheet) return;
    if (activeSheet==="book")    { bookSh.current?.snapToIndex(0);  }
    if (activeSheet==="chapter") { chapSh.current?.snapToIndex(0);  }
    if (activeSheet==="verse")   { verseSh.current?.snapToIndex(0); }
    setActiveSheet(null);
  }, [activeSheet]);

  useEffect(() => { listRef.current?.scrollToOffset({offset:0,animated:false}); }, [currentBook, currentChapter]);

  // Real-time search
  useEffect(() => {
    clearTimeout(debRef.current);
    if (!globalSearch.trim()) { setSearchRes([]); return; }
    debRef.current = setTimeout(()=>setSearchRes(doSearch(globalSearch, 500)), 150);
  }, [globalSearch]);

  // Cascade: book → chapter → verse
  const pickBook = (name: string) => {
    navigateTo(name, 1); bookSh.current?.close();
    setTimeout(()=>chapSh.current?.snapToIndex(0), 350);
  };
  const pickChapter = (ch: number) => {
    navigateTo(currentBook, ch); chapSh.current?.close();
    setTimeout(()=>verseSh.current?.snapToIndex(0), 350);
  };
  const pickVerse = (v: number) => {
    verseSh.current?.close();
    setTimeout(()=>{
      const idx = currentVerses.findIndex(x=>x.verse===v);
      if (idx>=0) listRef.current?.scrollToIndex({index:idx,animated:true});
    },150);
  };

  const bookObj = BIBLE_BOOKS.find(b=>b.name===currentBook);
  const chapters = Array.from({length:totalChapters},(_,i)=>i+1);
  const isSearch = !!globalSearch.trim();
  const filtered = isSearch
    ? searchFilter==="OT" ? searchRes.filter(r=>OT_SET.has(r.book))
    : searchFilter==="NT" ? searchRes.filter(r=>NT_SET.has(r.book))
    : searchRes : [];

  return (
    <View style={{flex:1,backgroundColor:"#fff"}}>
      {/* Bible sub-header */}
      <LinearGradient colors={[C.DARK_BLUE,C.MID_BLUE]} style={s.hdr}>
        <TouchableOpacity onPress={()=>bookSh.current?.snapToIndex(0)} style={s.refBtn}>
          <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.8)"/>
          <Text style={s.refTxt}>{bookObj?.short??currentBook}.{currentChapter}</Text>
        </TouchableOpacity>
        <View style={s.searchBox}>
          <Ionicons name="search" size={14} color="rgba(255,255,255,0.6)"/>
          <TextInput value={globalSearch} onChangeText={setGlobalSearch}
            placeholder="Search…" placeholderTextColor="rgba(255,255,255,0.4)"
            style={s.searchIn}/>
          {!!globalSearch && <TouchableOpacity onPress={()=>setGlobalSearch("")}>
            <Ionicons name="close" size={14} color="rgba(255,255,255,0.6)"/></TouchableOpacity>}
        </View>
      </LinearGradient>

      {/* OT/NT/ALL filter tabs (search mode only) */}
      {isSearch && (
        <View style={s.filterBar}>
          {(["ALL","OT","NT"] as const).map(f=>(
            <TouchableOpacity key={f} onPress={()=>setSearchFilter(f)} style={s.fTab}>
              <Text style={[s.fTxt, searchFilter===f&&s.fTxtActive]}>
                {f==="ALL"?"All Results":f==="OT"?"Old Testament":"New Testament"}
              </Text>
              {searchFilter===f && <View style={s.fLine}/>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content */}
      {isLoading && !isSearch ? (
        <View style={s.loading}>
          <ActivityIndicator color={C.DARK_BLUE}/>
          <Text style={{color:"#9CA3AF",marginTop:8}}>Loading {globalTranslation}…</Text>
        </View>
      ) : isSearch ? (
        <FlatList data={filtered} keyExtractor={(_,i)=>`sr${i}`}
          ListEmptyComponent={<Text style={s.empty}>No results for "{globalSearch}"</Text>}
          ListHeaderComponent={filtered.length>0?<View style={s.srHead}><Text style={s.srCount}>{filtered.length}{filtered.length===500?"+":""} results</Text></View>:null}
          renderItem={({item})=>(
            <TouchableOpacity onPress={()=>{navigateTo(item.book,item.chapter);setGlobalSearch("");}}>
              <VerseCard book={item.book} chapter={item.chapter} verse={item.verse}
                text={item.text} onAddToNote={onAddToNote} searchQuery={globalSearch}/>
            </TouchableOpacity>
          )}/>
      ) : (
        <FlatList ref={listRef} data={currentVerses} keyExtractor={v=>`v${v.verse}`}
          renderItem={({item})=>(
            <VerseCard book={currentBook} chapter={currentChapter}
              verse={item.verse} text={item.text} onAddToNote={onAddToNote}/>
          )}/>
      )}

      {/* ── BOOK SHEET ── */}
      <BottomSheet ref={bookSh} index={-1} snapPoints={["80%"]} enablePanDownToClose backgroundStyle={s.sheet} handleIndicatorStyle={s.handle}>
        <View style={s.shHdr}><Text style={s.shTitle}>Choose Book</Text><TouchableOpacity onPress={()=>bookSh.current?.close()}><Ionicons name="close" size={20} color="#fff"/></TouchableOpacity></View>
        <View style={s.testTabs}>
          {(["OT","NT"] as const).map(t=>(
            <TouchableOpacity key={t} onPress={()=>setTestTab(t)} style={[s.testTab, testTab===t&&s.testTabActive]}>
              <Text style={[s.testTxt, testTab===t&&s.testTxtActive]}>{t==="OT"?"Old Testament":"New Testament"}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <BottomSheetFlatList data={testTab==="OT"?OT_BOOKS:NT_BOOKS} keyExtractor={b=>b.code} numColumns={2}
          columnWrapperStyle={{gap:8,paddingHorizontal:16}} contentContainerStyle={{gap:8,paddingBottom:40,paddingTop:8}}
          renderItem={({item})=>(
            <TouchableOpacity style={[s.bkItem, item.name===currentBook&&s.bkItemAct]} onPress={()=>pickBook(item.name)}>
              <Text style={[s.bkTxt, item.name===currentBook&&s.bkTxtAct]}>{item.name}</Text>
            </TouchableOpacity>
          )}/>
      </BottomSheet>

      {/* ── CHAPTER SHEET ── */}
      <BottomSheet ref={chapSh} index={-1} snapPoints={["55%"]} enablePanDownToClose backgroundStyle={s.sheet} handleIndicatorStyle={s.handle}>
        <View style={s.shHdr}><Text style={s.shTitle}>Chapters</Text><TouchableOpacity onPress={()=>chapSh.current?.close()}><Ionicons name="close" size={20} color="#fff"/></TouchableOpacity></View>
        <BottomSheetFlatList data={chapters} keyExtractor={c=>`c${c}`} numColumns={6}
          columnWrapperStyle={{gap:8,paddingHorizontal:16}} contentContainerStyle={{gap:8,paddingBottom:40,paddingTop:8}}
          renderItem={({item})=>(
            <TouchableOpacity style={[s.numBtn, item===currentChapter&&s.numBtnAct]} onPress={()=>pickChapter(item)}>
              <Text style={[s.numTxt, item===currentChapter&&s.numTxtAct]}>{item}</Text>
            </TouchableOpacity>
          )}/>
      </BottomSheet>

      {/* ── VERSE SHEET ── */}
      <BottomSheet ref={verseSh} index={-1} snapPoints={["55%"]} enablePanDownToClose backgroundStyle={s.sheet} handleIndicatorStyle={s.handle}>
        <View style={s.shHdr}><Text style={s.shTitle}>{bookObj?.short} {currentChapter} — Verses</Text><TouchableOpacity onPress={()=>verseSh.current?.close()}><Ionicons name="close" size={20} color="#fff"/></TouchableOpacity></View>
        <BottomSheetFlatList data={currentVerses} keyExtractor={v=>`vs${v.verse}`} numColumns={7}
          columnWrapperStyle={{gap:6,paddingHorizontal:16}} contentContainerStyle={{gap:6,paddingBottom:40,paddingTop:8}}
          renderItem={({item})=>(
            <TouchableOpacity style={s.numBtnSm} onPress={()=>pickVerse(item.verse)}>
              <Text style={s.numSmTxt}>{item.verse}</Text>
            </TouchableOpacity>
          )}/>
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  hdr:       {flexDirection:"row",alignItems:"center",paddingHorizontal:12,paddingVertical:10,gap:10},
  refBtn:    {flexDirection:"row",alignItems:"center",gap:6,flex:1},
  refTxt:    {fontSize:17,fontWeight:"700",color:"#fff",fontFamily:"serif"},
  searchBox: {flexDirection:"row",alignItems:"center",gap:6,backgroundColor:"rgba(255,255,255,0.12)",borderRadius:10,paddingHorizontal:10,paddingVertical:7,flex:1},
  searchIn:  {flex:1,fontSize:13,color:"#fff",padding:0},
  filterBar: {flexDirection:"row",borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
  fTab:      {flex:1,alignItems:"center",paddingVertical:10},
  fTxt:      {fontSize:12,fontWeight:"600",color:"#9CA3AF"},
  fTxtActive:{color:C.DARK_BLUE},
  fLine:     {position:"absolute",bottom:0,left:16,right:16,height:2,backgroundColor:C.DARK_BLUE},
  loading:   {flex:1,alignItems:"center",justifyContent:"center"},
  empty:     {textAlign:"center",color:"#9CA3AF",padding:40},
  srHead:    {paddingHorizontal:16,paddingVertical:8,backgroundColor:"#F9FAFB"},
  srCount:   {fontSize:12,color:"#9CA3AF"},
  sheet:     {backgroundColor:C.DARK_BLUE},
  handle:    {backgroundColor:"rgba(255,255,255,0.3)"},
  shHdr:     {flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingHorizontal:20,paddingVertical:14},
  shTitle:   {fontSize:17,fontWeight:"700",color:"#fff",fontFamily:"serif"},
  testTabs:  {flexDirection:"row",marginHorizontal:16,marginBottom:8,backgroundColor:"rgba(255,255,255,0.1)",borderRadius:10,padding:4},
  testTab:   {flex:1,paddingVertical:8,alignItems:"center"},
  testTabActive:{backgroundColor:"rgba(255,255,255,0.18)"},
  testTxt:   {fontSize:13,fontWeight:"600",color:"rgba(255,255,255,0.5)"},
  testTxtActive:{color:"#fff"},
  bkItem:    {flex:1,backgroundColor:"rgba(255,255,255,0.08)",borderRadius:10,paddingVertical:10,paddingHorizontal:8},
  bkItemAct: {backgroundColor:"rgba(255,255,255,0.22)"},
  bkTxt:     {fontSize:13,color:"rgba(255,255,255,0.8)"},
  bkTxtAct:  {color:"#fff",fontWeight:"700"},
  numBtn:    {flex:1,aspectRatio:1,borderRadius:8,borderWidth:1.5,borderColor:"rgba(255,255,255,0.25)",alignItems:"center",justifyContent:"center",minWidth:44},
  numBtnAct: {backgroundColor:"#fff",borderColor:"#fff"},
  numTxt:    {fontSize:13,fontWeight:"700",color:"rgba(255,255,255,0.9)"},
  numTxtAct: {color:C.DARK_BLUE},
  numBtnSm:  {flex:1,height:36,borderRadius:7,borderWidth:1,borderColor:"rgba(255,255,255,0.25)",alignItems:"center",justifyContent:"center",minWidth:38},
  numSmTxt:  {fontSize:12,fontWeight:"700",color:"rgba(255,255,255,0.9)"},
});
